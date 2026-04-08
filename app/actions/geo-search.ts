// app/actions/geo-search.ts
"use server";

import clientPromise from "@/db/mongodb";
import { Listing } from "@/db/Types";
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
      .project({ places_details: 0 })
      .toArray();

    return JSON.parse(JSON.stringify(businesses)); // Serializing for Server Action response
  } catch (error) {
    console.error("Geosearch query error:", error);
    return []; // Return empty array on failure so UI handles it gracefully
  }
}

export async function fetchTopListings(limit = 50): Promise<Listing[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("listings");

  const listings = await collection.find({}).project({ places_details: 0 }).limit(limit).toArray();
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
  ['all-categories'],
  { revalidate: 3600 } // Cache for 1 hour
);

export async function fetchAllCategories(): Promise<string[]> {
  return getCachedCategories();
}

export const getCachedSearchResults = unstable_cache(
  async (query: string) => {
    const client = await clientPromise;
    const db = client.db("vercel-db");
    const collection = db.collection<Listing>("listings");

    // Replace $regex with Atlas Search for performance
    const listings = await collection
      .aggregate([
        {
          $search: {
            index: "default", // Ensure this index is created in MongoDB Atlas on the 'name' field
            text: {
              query: query,
              path: "name",
              fuzzy: {
                maxEdits: 1,
              },
            },
          },
        },
        { $limit: 10 },
        { $project: { places_details: 0 } }
      ])
      .toArray();

    return JSON.parse(JSON.stringify(listings));
  },
  ['search-results'],
  { revalidate: 300 } // Cache for 5 minutes
);

export async function searchBusinesses(query: string): Promise<Listing[]> {
  return getCachedSearchResults(query);
}
