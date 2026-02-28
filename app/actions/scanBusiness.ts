"use server";

import clientPromise from "@/db/mongodb";
import { createOpenAI } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the shape of data we WANT from the AI (Type Safety is Key)
const BusinessSchema = z.object({
  name: z.string(),
  description: z.string(),
  isBlackOwnedDetected: z
    .boolean()
    .describe("True if 'Black-owned', 'Black-led', or similar terms found"),
  confidenceScore: z.number().min(0).max(100),
  category: z.enum(["Restaurant", "Retail", "Service", "Tech", "Other"]),
  address: z.string().nullable().describe("The business address, or null if not found"),
  website: z.string().nullable().describe("Business website URL, or null if not found"),
});

export async function scanBusinessUrl(url: string) {
  // 1. Business Logic: Validate URL before spending tokens
  if (!url) throw new Error("URL is required");

  const client = await clientPromise;
  const db = client.db("vercel-db");
  const cacheCollection = db.collection("ai_scan_cache");

  // 1.5. Check Cache
  try {
    const cachedResult = await cacheCollection.findOne({ url });
    if (cachedResult) {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // If it exists, is less than 30 days old, and has decent confidence, use it
      if (
        cachedResult.scannedAt > thirtyDaysAgo &&
        cachedResult.result.confidenceScore >= 70
      ) {
        console.log(`Cache hit for ${url}`);
        return { success: true, data: cachedResult.result };
      }
    }
  } catch (error) {
    console.error("Cache Check Error:", error);
    // Proceed normally if cache check fails
  }

  // 2. Fetch raw HTML (In production, use a scraping proxy like ZenRows/BrightData)
  // Efficiency: Don't scrape images/media, just text.
  let htmlText = "";
  try {
    const response = await fetch(url);
    htmlText = await response.text();
  } catch (e: any) {
    throw new Error(`Failed to fetch URL: ${e.message}`);
  }

  // Truncate HTML to save tokens (Head + Body intro usually has the info)
  const context = htmlText.slice(0, 15000);
  console.log('context length', context.length);
  // 3. AI Extraction
  const { object } = await generateObject({
    model: openai("gpt-4o"),
    schema: BusinessSchema,
    prompt: `
      Analyze this HTML content for a business directory.
      Extract the business details. 
      Look for specific cultural indicators or 'About Us' text to determine if it is Black-owned.
      
      HTML Context:
      ${context}
    `,
  });

  // 4. Save to Cache
  try {
    await cacheCollection.updateOne(
      { url },
      {
        $set: {
          url,
          result: object,
          scannedAt: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error("Cache Save Error:", error);
  }

  return { success: true, data: object };
}
