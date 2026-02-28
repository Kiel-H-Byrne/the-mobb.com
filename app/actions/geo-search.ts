// app/actions/geo-search.ts
"use server";

import clientPromise from "@/db/mongodb";
import { Listing } from "@/db/Types";

export async function findBusinessesNearby(
  lat: number,
  lng: number,
  radiusMeters = 5000,
): Promise<Listing[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("mobb-listings");

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
    .toArray();

  return JSON.parse(JSON.stringify(businesses)); // Serializing for Server Action response
}

export async function fetchAllListings(): Promise<Listing[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("mobb-listings");

  const listings = await collection.find({}).toArray();
  return JSON.parse(JSON.stringify(listings));
}

export async function fetchAllCategories(): Promise<string[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection("categories");

  const categories = await collection.find({}).toArray();
  // Assume categories collection has documents with a 'name' field, or they are just strings.
  // Based on SAMPLE_CATEGORIES, it seems they are strings, but MongoDB documents usually have _id.
  return categories.map((cat: any) => cat.name || cat);
}

export async function searchBusinesses(query: string): Promise<Listing[]> {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  const collection = db.collection<Listing>("mobb-listings");

  const listings = await collection
    .find({
      name: { $regex: query, $options: "i" },
    })
    .limit(10)
    .toArray();

  return JSON.parse(JSON.stringify(listings));
}
