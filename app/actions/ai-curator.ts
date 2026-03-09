// app/actions/ai-curator.ts
"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
import { PendingListing } from "@/db/Types";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the schema for a single business entity
const BusinessEntitySchema = z.object({
  name: z.string(),
  description: z.string().nullable().describe("Description of the business"),
  category: z.string().nullable().describe("Category of the business"),
  address: z.array(
    z.string().nullable().describe("Full physical address if available"),
  ),
  website: z.string().nullable().describe("Website URL if available"),
  socialHandle: z
    .string()
    .nullable()
    .describe("Social media handle if available"),
  isBlackOwned: z.boolean().describe("Confidence based on text indicators"),
  isOnlineOnly: z.boolean().describe("Online Only"),
});

// Define the schema for the AI's response (It might find ONE or MANY)
const ExtractionSchema = z.object({
  sourceType: z.enum(["single_business", "listicle_directory"]),
  businesses: z.array(BusinessEntitySchema),
});

export async function extractBusinessData(url: string) {
  // 1. Fetch the raw HTML (simplified for prototype)
  const res = await fetch(url);
  const html = await res.text();

  // Truncate to avoid token limits, focus on main content
  const content = html.slice(0, 30000);

  // 2. AI Extraction
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: ExtractionSchema,
    system: `
      You are an expert Data Curator for the MOBB (Map of Black Businesses) App.
      Your job is to analyze web pages and extract business details.
      
      - If the page is a "Listicle" (e.g., "10 Best Restaurants"), extract ALL businesses listed.
      - If the page is a single business website, extract just that one.
      - If there are multiple locations to a business and more than one address is found, save it as an array of addresses.
      - Look for "Black-owned" keywords (Black-led, minority-owned, cultural context).
      - Normalize addresses where possible.
      - If the business is online only, label it as such "isOnlineOnly:true"
    `,
    prompt: `Analyze this HTML content: ${content}`,
  });

  // 3. Save to Database
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const pendingCollection = db.collection<PendingListing>("pending_listings");

  const newListings: PendingListing[] = [];

  for (const biz of object.businesses) {
    // Basic deduplication: Check if a pending listing with this name already exists
    const existing = await pendingCollection.findOne({ name: biz.name });

    if (!existing) {
      const addressArray = (biz.address || []).filter((a): a is string => Boolean(a));
      const locations: any[] = [];

      for (const addr of addressArray) {
        if (!biz.isOnlineOnly) {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
          let lat, lng, place_id;
          let formattedAddress = addr;

          if (apiKey) {
            try {
              const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${apiKey}`;
              const geocodeRes = await fetch(geocodeUrl);
              const geocodeData = await geocodeRes.json();

              if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
                const bestMatch = geocodeData.results[0];
                lat = bestMatch.geometry.location.lat;
                lng = bestMatch.geometry.location.lng;
                place_id = bestMatch.place_id;
                formattedAddress = bestMatch.formatted_address || addr;
              }
            } catch (err) {
              console.error("Geocoding fetch error for AI Curator:", err);
            }
          }

          locations.push({
            address: formattedAddress,
            lat,
            lng,
            place_id
          });
        }
      }

      newListings.push({
        name: biz.name,
        category: biz.category || "Uncategorized",
        address: addressArray, // Legacy fallback
        locations,
        website: biz.website || "",
        description: biz.description || "",
        isBlackOwned: biz.isBlackOwned,
        isOnlineOnly: biz.isOnlineOnly,
        source: "AI_SCAN",
        status: "PENDING_REVIEW",
        createdAt: new Date(),
      });
    } else {
      console.log(`AI Curator: Skipping duplicate business "${biz.name}"`);
    }
  }

  if (newListings.length > 0) {
    await pendingCollection.insertMany(newListings);
  }

  return {
    success: true,
    count: newListings.length,
    sourceType: object.sourceType,
    data: object,
  };
}
