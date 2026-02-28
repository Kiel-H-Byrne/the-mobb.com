// app/actions/ai-curator.ts
"use server";

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import clientPromise, { DB_NAME } from "../../src/db/mongodb";
import { PendingListing } from "../../src/db/Types";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Define the schema for a single business entity
const BusinessEntitySchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  address: z.string().optional().describe("Full physical address if available"),
  website: z.string().url().optional(),
  socialHandle: z.string().optional(),
  isBlackOwned: z.boolean().describe("Confidence based on text indicators"),
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
    model: google("gemini-2.5-flash"),
    schema: ExtractionSchema,
    system: `
      You are an expert Data Curator for the MOBB (Map of Black Businesses) App.
      Your job is to analyze web pages and extract business details.
      
      - If the page is a "Listicle" (e.g., "10 Best Restaurants"), extract ALL businesses listed.
      - If the page is a single business website, extract just that one.
      - Look for "Black-owned" keywords (Black-led, minority-owned, cultural context).
      - Normalize addresses where possible.
    `,
    prompt: `Analyze this HTML content: ${content}`,
  });

  // 3. Save to Database
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const pendingCollection = db.collection<PendingListing>("pending_listings");

  const pendingListings: PendingListing[] = object.businesses.map((biz: any) => ({
    name: biz.name,
    category: biz.category || "Uncategorized",
    address: biz.address,
    website: biz.website,
    description: biz.description,
    isBlackOwned: biz.isBlackOwned,
    source: "AI_SCAN",
    status: "PENDING_REVIEW",
    createdAt: new Date(),
  }));

  if (pendingListings.length > 0) {
    await pendingCollection.insertMany(pendingListings);
  }

  return { success: true, count: pendingListings.length, sourceType: object.sourceType, data: object };
}
