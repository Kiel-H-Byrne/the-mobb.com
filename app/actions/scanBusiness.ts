"use server";

import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

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

  // 2. Fetch raw HTML (In production, use a scraping proxy like ZenRows/BrightData)
  // Efficiency: Don't scrape images/media, just text.
  const response = await fetch(url);
  const htmlText = await response.text();

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

  return { success: true, data: object };
}
