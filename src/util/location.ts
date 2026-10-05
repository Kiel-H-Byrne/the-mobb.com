export type LatLng = { lat: number; lng: number };

export type Bounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/**
 * A directory location filter: either a radius around a point (near me, a
 * city, a ZIP) or a region's bounding box (a state or country).
 */
export type DirectoryLocation =
  | { kind: "radius"; lat: number; lng: number; miles: number; label: string }
  | {
      kind: "region";
      bounds: Bounds;
      label: string;
      /**
       * State code/name (e.g. ["GA", "Georgia"]). A state's bounding box
       * overlaps its neighbors, so addresses must also mention the state.
       */
      names?: string[];
    };

/** A geocoded search result, before the user picks a radius. */
export type GeocodedPlace = {
  label: string;
  lat: number;
  lng: number;
  bounds: Bounds | null;
  /** States/countries filter by bounds; cities/ZIPs by radius. */
  isRegion: boolean;
  /** State short/long names when the place is a state. */
  regionNames?: string[];
};

export const RADIUS_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_RADIUS_MILES = 25;
const MAX_RADIUS_MILES = 500;

export const EARTH_RADIUS_MILES = 3963.2;
export const METERS_PER_MILE = 1609.344;

const isLat = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= -90 && v <= 90;
const isLng = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= -180 && v <= 180;

/**
 * Validates an untrusted location (server actions receive client input) and
 * returns a clean copy, or null if it is missing or malformed.
 */
export const sanitizeLocation = (input: unknown): DirectoryLocation | null => {
  if (!input || typeof input !== "object") return null;
  const loc = input as Record<string, any>;
  const label = typeof loc.label === "string" ? loc.label.slice(0, 120) : "";

  if (loc.kind === "radius" && isLat(loc.lat) && isLng(loc.lng)) {
    const miles = Number(loc.miles);
    if (!Number.isFinite(miles) || miles <= 0) return null;
    return {
      kind: "radius",
      lat: loc.lat,
      lng: loc.lng,
      miles: Math.min(miles, MAX_RADIUS_MILES),
      label,
    };
  }

  const b = loc.bounds;
  if (
    loc.kind === "region" &&
    b &&
    isLat(b.north) &&
    isLat(b.south) &&
    isLng(b.east) &&
    isLng(b.west) &&
    b.north > b.south
  ) {
    const names = Array.isArray(loc.names)
      ? loc.names
          .filter(
            (n: unknown): n is string => typeof n === "string" && !!n.trim(),
          )
          .slice(0, 3)
          .map((n: string) => n.trim().slice(0, 60))
      : [];
    return {
      kind: "region",
      bounds: { north: b.north, south: b.south, east: b.east, west: b.west },
      label,
      ...(names.length ? { names } : {}),
    };
  }

  return null;
};

/** Great-circle distance in miles. */
export const distanceMiles = (a: LatLng, b: LatLng): number => {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MILES * Math.asin(Math.sqrt(h));
};

export const formatMiles = (miles: number) =>
  miles < 0.1
    ? "<0.1 mi"
    : `${miles < 10 ? miles.toFixed(1) : Math.round(miles)} mi`;

export const describeLocation = (loc: DirectoryLocation) =>
  loc.kind === "radius"
    ? `Within ${loc.miles} mi of ${loc.label}`
    : `In ${loc.label}`;

type Coordinates = { coordinates?: number[] } | undefined;

/** Distance to a listing's nearest location (multi-location listings count once). */
export const listingDistanceMiles = (
  listing: {
    coordinates?: Coordinates;
    locations?: { coordinates?: Coordinates }[];
  },
  origin: LatLng,
): number => {
  const points = [
    listing.coordinates?.coordinates,
    ...(listing.locations ?? []).map((l) => l.coordinates?.coordinates),
  ].filter((c): c is number[] => !!c && c.length > 1);
  if (!points.length) return Infinity;
  return Math.min(
    ...points.map(([lng, lat]) => distanceMiles(origin, { lat, lng })),
  );
};

export type WithDistance<T> = T & {
  _distance: number;
  _formattedDistance: string;
};

/** The `limit` listings nearest to `origin`, annotated with their distance. */
export const nearestListings = <
  T extends Parameters<typeof listingDistanceMiles>[0],
>(
  listings: T[],
  origin: LatLng,
  limit = Infinity,
): WithDistance<T>[] =>
  listings
    .map((listing) => {
      const miles = listingDistanceMiles(listing, origin);
      return {
        ...listing,
        _distance: miles,
        _formattedDistance: Number.isFinite(miles) ? formatMiles(miles) : "",
      };
    })
    .sort((a, b) => a._distance - b._distance)
    .slice(0, limit);
