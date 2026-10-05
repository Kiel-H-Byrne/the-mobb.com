// app/actions/geo-search.ts
"use server";

import clientPromise from "@/db/mongodb";
import { Listing } from "@/db/Types";
import {
  CategoryCount,
  UNCATEGORIZED,
  sortCategoryCounts,
} from "@/util/categories";
import {
  DirectoryLocation,
  EARTH_RADIUS_MILES,
  GeocodedPlace,
  METERS_PER_MILE,
  sanitizeLocation,
} from "@/util/location";
import { unstable_cache } from "next/cache";

export async function findBusinessesNearby(
  lat: number,
  lng: number,
  radiusMeters = 5000,
): Promise<Listing[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("listings");

  try {
    // MongoDB 2dsphere $near operator
    const businesses = await collection
      .find({
        coordinates: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat], // [longitude, latitude]
            },
            $maxDistance: radiusMeters,
          },
        },
      })
      .limit(100)
      .project({ places_details: 0 })
      .toArray();

    return JSON.parse(JSON.stringify(businesses)); // Serializing for Server Action response
  } catch (error) {
    console.error("Geosearch query error:", error);
    return []; // Return empty array on failure so UI handles it gracefully
  }
}

// Only the fields the map, its side panels, and the detail panel render.
const MAP_LISTING_PROJECTION = {
  name: 1,
  coordinates: 1,
  locations: 1,
  categories: 1,
  image: 1,
  og_image: 1,
  og_title: 1,
  og_description: 1,
  address: 1,
  isOnlineOnly: 1,
  url: 1,
  phone: 1,
  description: 1,
};

/**
 * Every listing that can appear on the map (has coordinates, not online-only),
 * loaded once so markers, filters, and counts cover the whole directory rather
 * than whatever happens to be near the current map view.
 */
export async function fetchMapListings(): Promise<Listing[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("listings");

  const listings = await collection
    .find({
      isOnlineOnly: { $ne: true },
      $or: [
        { "coordinates.coordinates.1": { $exists: true } },
        { "locations.coordinates.coordinates.1": { $exists: true } },
      ],
    })
    .project(MAP_LISTING_PROJECTION)
    .toArray();
  return JSON.parse(JSON.stringify(listings));
}

export type DirectoryScope = "all" | "online";

// Builds the filter for paged directory queries. "Uncategorized" matches
// listings tagged "Uncategorized" as well as ones with no categories.
function buildDirectoryQuery(
  selectedCategories?: string[],
  scope: DirectoryScope = "all",
  location: DirectoryLocation | null = null,
) {
  const base = scope === "online" ? { isOnlineOnly: true } : {};
  return mergeQueries(
    base,
    buildCategoryQuery(selectedCategories),
    buildLocationQuery(location),
  );
}

// Shallow-merges query parts; parts that reuse a key (e.g. two `$or`s) are
// combined under `$and` instead of overwriting each other.
function mergeQueries(...parts: Record<string, unknown>[]) {
  const merged: Record<string, unknown> = {};
  const and: Record<string, unknown>[] = [];
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      if (key in merged) and.push({ [key]: value });
      else merged[key] = value;
    }
  }
  if (and.length) merged.$and = and;
  return merged;
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// $geoWithin works with countDocuments/aggregate and uses the 2dsphere index.
// Listings without coordinates (e.g. online-only) never match a location.
function buildLocationQuery(location: DirectoryLocation | null) {
  if (!location) return {};
  if (location.kind === "radius") {
    return {
      coordinates: {
        $geoWithin: {
          $centerSphere: [
            [location.lng, location.lat],
            location.miles / EARTH_RADIUS_MILES,
          ],
        },
      },
    };
  }
  const { north, south, east, west } = location.bounds;
  const stateClause = location.names?.length
    ? {
        $or: [
          {
            address: new RegExp(
              `\\b(${location.names.map(escapeRegex).join("|")})\\b`,
            ),
          },
          { address: { $in: [null, ""] } },
        ],
      }
    : {};
  return {
    ...stateClause,
    coordinates: {
      $geoWithin: {
        $geometry: {
          type: "Polygon",
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
      },
    },
  };
}

function buildCategoryQuery(selectedCategories?: string[]) {
  if (!selectedCategories || selectedCategories.length === 0) return {};

  if (!selectedCategories.includes(UNCATEGORIZED)) {
    return { categories: { $in: selectedCategories } };
  }

  return {
    $or: [
      { categories: { $in: selectedCategories } },
      { categories: { $exists: false } },
      { categories: { $size: 0 } },
    ],
  };
}

export async function fetchGlobalListings(
  page = 1,
  limit = 20,
  selectedCategories?: string[],
  location?: DirectoryLocation | null,
): Promise<Listing[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("listings");

  const skip = Math.max(0, (page - 1) * limit);
  const loc = sanitizeLocation(location);

  // Radius searches return nearest first ($nearSphere sorts by distance and
  // matches the same set as the $geoWithin used for counting).
  const query =
    loc?.kind === "radius"
      ? mergeQueries(buildDirectoryQuery(selectedCategories), {
          coordinates: {
            $nearSphere: {
              $geometry: { type: "Point", coordinates: [loc.lng, loc.lat] },
              $maxDistance: loc.miles * METERS_PER_MILE,
            },
          },
        })
      : buildDirectoryQuery(selectedCategories, "all", loc);

  let cursor = collection.find(query).project({ places_details: 0 });
  if (loc?.kind !== "radius") cursor = cursor.sort({ _id: -1 });

  const listings = await cursor.skip(skip).limit(limit).toArray();

  return JSON.parse(JSON.stringify(listings));
}

export async function countGlobalListings(
  selectedCategories?: string[],
  scope: DirectoryScope = "all",
  location?: DirectoryLocation | null,
): Promise<number> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("listings");

  return collection.countDocuments(
    buildDirectoryQuery(selectedCategories, scope, sanitizeLocation(location)),
  );
}

export const getCachedCategoryCounts = unstable_cache(
  async (
    scope: DirectoryScope = "all",
    location: DirectoryLocation | null = null,
  ): Promise<CategoryCount[]> => {
    const client = await clientPromise;
    const db = client.db("vercel-db");
    const collection = db.collection<Listing>("listings");

    const [grouped, uncategorized] = await Promise.all([
      collection
        .aggregate([
          { $match: buildDirectoryQuery([], scope, location) },
          { $unwind: "$categories" },
          { $group: { _id: "$categories", count: { $sum: 1 } } },
        ])
        .toArray(),
      collection.countDocuments(
        buildDirectoryQuery([UNCATEGORIZED], scope, location),
      ),
    ]);

    const counts = grouped
      .filter((row) => row._id && row._id !== UNCATEGORIZED)
      .map((row) => ({ name: String(row._id), count: row.count as number }));
    if (uncategorized > 0) {
      counts.push({ name: UNCATEGORIZED, count: uncategorized });
    }
    return sortCategoryCounts(counts);
  },
  ["category-counts-v4"],
  { revalidate: 3600 },
);

/** Every category used by listings in scope, with counts, most common first. */
export async function fetchCategoryCounts(
  scope: DirectoryScope = "all",
  location?: DirectoryLocation | null,
): Promise<CategoryCount[]> {
  return getCachedCategoryCounts(scope, sanitizeLocation(location));
}

const REGION_TYPES = ["administrative_area_level_1", "country"];

const getCachedGeocode = unstable_cache(
  async (query: string): Promise<GeocodedPlace | null> => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey) return null;

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&region=us&key=${apiKey}`;
    const data = await (await fetch(url)).json();
    if (data.status !== "OK" || !data.results?.length) return null;

    const best = data.results[0];
    const vp = best.geometry?.viewport;
    const types: string[] = best.types || [];
    const state = types.includes("administrative_area_level_1")
      ? (best.address_components || []).find((c: any) =>
          c.types?.includes("administrative_area_level_1"),
        )
      : null;
    return {
      label: String(best.formatted_address || query).replace(/, USA$/, ""),
      lat: best.geometry.location.lat,
      lng: best.geometry.location.lng,
      bounds: vp
        ? {
            north: vp.northeast.lat,
            south: vp.southwest.lat,
            east: vp.northeast.lng,
            west: vp.southwest.lng,
          }
        : null,
      isRegion: types.some((t) => REGION_TYPES.includes(t)),
      ...(state ? { regionNames: [state.short_name, state.long_name] } : {}),
    };
  },
  ["geocode-place-v2"],
  { revalidate: 60 * 60 * 24 * 7 },
);

/** Resolves a city, state, or ZIP typed by the user to a place. */
export async function geocodeLocation(
  query: string,
): Promise<GeocodedPlace | null> {
  const q = String(query ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 100);
  if (q.length < 2) return null;
  try {
    return await getCachedGeocode(q.toLowerCase());
  } catch (error) {
    console.error("Geocode failed:", error);
    return null;
  }
}

export async function fetchOnlineOnlyListings(
  page = 1,
  limit = 20,
  selectedCategories?: string[],
): Promise<Listing[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("listings");

  const skip = Math.max(0, (page - 1) * limit);
  const query = buildDirectoryQuery(selectedCategories, "online");

  const listings = await collection
    .find(query)
    .project({ places_details: 0 })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return JSON.parse(JSON.stringify(listings));
}

// Caching strategies
export const getCachedCategories = unstable_cache(
  async () => {
    const client = await clientPromise;
    const db = client.db("vercel-db");
    const collection = db.collection("categories");

    const categories = await collection.find({}).toArray();
    return categories.map((cat: any) => cat.name || cat);
  },
  ["all-categories"],
  { revalidate: 3600 }, // Cache for 1 hour
);

export async function fetchAllCategories(): Promise<string[]> {
  return getCachedCategories();
}

const SEARCH_LIMIT = 10;

// Lower is better: name prefix, then a word in the name, then anywhere in the
// name, then category, then address.
const rankSearchMatch = (listing: Listing, term: string) => {
  const name = (listing.name || "").toLowerCase();
  if (name.startsWith(term)) return 0;
  if (name.split(/[\s&/-]+/).some((w) => w.startsWith(term))) return 1;
  if (name.includes(term)) return 2;
  if (listing.categories?.some((c) => c.toLowerCase().includes(term))) return 3;
  return 4;
};

// Plain indexed-collection scan rather than Atlas Search: the cluster has no
// Atlas Search index, so `$search` silently returned nothing. At ~1k listings
// this is fast; revisit with an Atlas index if the directory grows a lot.
export const getCachedSearchResults = unstable_cache(
  async (query: string): Promise<Listing[]> => {
    const client = await clientPromise;
    const db = client.db("vercel-db");
    const collection = db.collection<Listing>("listings");

    const pattern = new RegExp(escapeRegex(query), "i");
    const candidates = await collection
      .find({
        $or: [{ name: pattern }, { categories: pattern }, { address: pattern }],
      })
      .project({ places_details: 0 })
      .limit(200)
      .toArray();

    const term = query.toLowerCase();
    const ranked = (candidates as unknown as Listing[])
      .map((listing) => ({ listing, rank: rankSearchMatch(listing, term) }))
      .sort(
        (a, b) =>
          a.rank - b.rank ||
          (a.listing.name || "").localeCompare(b.listing.name || ""),
      )
      .slice(0, SEARCH_LIMIT)
      .map(({ listing }) => listing);

    return JSON.parse(JSON.stringify(ranked));
  },
  ["search-results-v2"],
  { revalidate: 300 }, // Cache for 5 minutes
);

/** Searches every listing in the database by name, category, or address. */
export async function searchBusinesses(query: string): Promise<Listing[]> {
  const q = String(query ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 80);
  if (q.length < 2) return [];
  return getCachedSearchResults(q);
}
