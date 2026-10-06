// app/actions/ai-curator.ts
"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
import { CurationReport, PendingListing } from "@/db/Types";
import { fetchLinkPreview, LinkPreviewData } from "@/util/linkPreview";
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
  blackOwnedConfidence: z
    .number()
    .describe(
      "0-100: how confident you are that this business is Black-owned, based only on evidence on this page",
    ),
  blackOwnedEvidence: z
    .string()
    .nullable()
    .describe(
      "Short verbatim quote from the page supporting Black ownership, or null if none",
    ),
  isOnlineOnly: z.boolean().describe("Online Only"),
});

const CURATOR_MODEL = "gpt-4o";

// Define the schema for the AI's response (It might find ONE or MANY)
const ExtractionSchema = z.object({
  sourceType: z.enum(["single_business", "listicle_directory"]),
  businesses: z.array(BusinessEntitySchema),
});

/**
 * Fetches and aggressively cleans a web page for token-efficient LLM ingestion.
 * Strips out head, scripts, styles, and other non-content tags. 
 */
export async function fetchAndCleanHTML(url: string, limit: number = 100000): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.5"
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch URL: ${res.status} ${res.statusText}`);
  }

  const html = await res.text();

  let cleanedContent = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  const bodyMatch = cleanedContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  if (bodyMatch) {
    cleanedContent = bodyMatch[1];
  }

  return cleanedContent.slice(0, limit);
}

export async function extractBusinessData(
  url: string,
  options: { runId?: string } = {},
) {
  // 1. Fetch the raw HTML and clean it
  const content = await fetchAndCleanHTML(url);

  // 2. AI Extraction
  const { object } = await generateObject({
    model: openai(CURATOR_MODEL),
    schema: ExtractionSchema,
    system: `
      You are an expert Data Curator for the MOBB (Map of Black Businesses) App.
      Your job is to analyze web pages and extract business details.
      
      - If the page is a "Listicle" (e.g., "10 Best Restaurants"), extract ALL businesses listed.
      - If the page is a single business website, extract information for just that one.
      - Prioritize extracting the primary location and full physical street address (with street number, city, state, and zip) of the business.
      - DO NOT save an address if it is just a city and state (e.g. "Washington, D.C."). If no street address is found, leave the address field empty or mark as "online only" if applicable.
      - If there are multiple locations to a business and more than one address is found, save it as an array of addresses.
      - Look for "Black-owned" keywords (Black-led, minority-owned, cultural context).
      - Rate blackOwnedConfidence 0-100 and quote the supporting text in blackOwnedEvidence. A page that only implies it (e.g. a generic "minority-owned" list) should score lower than an explicit "Black-owned" statement about this specific business.
      - Normalize addresses where possible.
      - If the business is online only (no physical storefront), label it as such "isOnlineOnly:true".
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
      const addressArray = (biz.address || []).filter((a): a is string =>
        Boolean(a),
      );
      const locations: any[] = [];
      let hasValidStreetLocation = false;
      let locationMethod: CurationReport["locationMethod"] = biz.isOnlineOnly
        ? "online_only"
        : "none";
      const geocodeResults: CurationReport["geocodeResults"] = [];

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

      if (!biz.isOnlineOnly) {
        if (addressArray.length > 0) {
          for (const addr of addressArray) {
            let lat, lng, place_id;
            let formattedAddress = addr;

            if (apiKey) {
              try {
                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addr)}&key=${apiKey}`;
                const geocodeRes = await fetch(geocodeUrl);
                const geocodeData = await geocodeRes.json();

                if (
                  geocodeData.status === "OK" &&
                  geocodeData.results.length > 0
                ) {
                  const bestMatch = geocodeData.results[0];
                  lat = bestMatch.geometry.location.lat;
                  lng = bestMatch.geometry.location.lng;
                  place_id = bestMatch.place_id;
                  formattedAddress = bestMatch.formatted_address || addr;

                  // Check if the result is a specific street/premise, not a broad city/state
                  const types = bestMatch.types || [];
                  const isStreet = types.some((t: string) =>
                    [
                      "street_address",
                      "premise",
                      "subpremise",
                      "route",
                      "intersection",
                      "establishment",
                      "point_of_interest",
                    ].includes(t),
                  );

                  if (lat && lng && isStreet) {
                    hasValidStreetLocation = true;
                    locationMethod = "geocoded_address";
                  }
                  geocodeResults.push({
                    query: addr,
                    formattedAddress,
                    types,
                    isStreetLevel: Boolean(lat && lng && isStreet),
                  });
                } else {
                  geocodeResults.push({
                    query: addr,
                    types: [],
                    isStreetLevel: false,
                  });
                }
              } catch (err) {
                console.error("Geocoding fetch error for AI Curator:", err);
              }
            }

            locations.push({
              address: formattedAddress,
              lat,
              lng,
              place_id,
            });
          }
        } else {
          // No address found by AI, try to search for the business by name to get an address and location
          if (apiKey) {
            try {
              // Using findplacefromtext is best for a name query to get the location details
              const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(biz.name)}&inputtype=textquery&fields=formatted_address,geometry,place_id,types&key=${apiKey}`;
              const placeRes = await fetch(findPlaceUrl);
              const placeData = await placeRes.json();

              if (
                placeData.status === "OK" &&
                placeData.candidates &&
                placeData.candidates.length > 0
              ) {
                const bestMatch = placeData.candidates[0];
                if (bestMatch.geometry && bestMatch.geometry.location) {
                  const newAddr = bestMatch.formatted_address || biz.name;
                  addressArray.push(newAddr);
                  locations.push({
                    address: newAddr,
                    lat: bestMatch.geometry.location.lat,
                    lng: bestMatch.geometry.location.lng,
                    place_id: bestMatch.place_id,
                  });

                  const types = bestMatch.types || [];
                  const isSpecificPlace = types.some((t: string) =>
                    ["establishment", "point_of_interest"].includes(t),
                  );
                  const isGeneral = types.some((t: string) =>
                    [
                      "locality",
                      "administrative_area_level_1",
                      "administrative_area_level_2",
                      "political",
                    ].includes(t),
                  );

                  const isStreetLevel = Boolean(
                    isSpecificPlace &&
                      !isGeneral &&
                      bestMatch.geometry.location.lat &&
                      bestMatch.geometry.location.lng,
                  );
                  if (isStreetLevel) {
                    hasValidStreetLocation = true;
                    locationMethod = "places_name_search";
                  }
                  geocodeResults.push({
                    query: biz.name,
                    formattedAddress: newAddr,
                    types,
                    isStreetLevel,
                  });
                }
              }
            } catch (err) {
              console.error("Places API fetch error for AI Curator:", err);
            }
          }
        }
      }

      let bizWebsite = biz.website || "";
      if (bizWebsite) {
        try {
          const sourceUrlObj = new URL(url);
          const bizWebsiteObj = new URL(bizWebsite);

          if (
            object.sourceType === "listicle_directory" &&
            sourceUrlObj.hostname === bizWebsiteObj.hostname
          ) {
            bizWebsite = "";
          } else if (bizWebsite === url) {
            bizWebsite = "";
          }
        } catch (e) {
          // If URL parsing fails, continue
        }
      }

      // Fetch OpenGraph metadata if website exists
      let ogData: LinkPreviewData | null = null;
      if (bizWebsite) {
        ogData = await fetchLinkPreview(bizWebsite);
      }

      const finalCategory = biz.category || "Uncategorized";

      let finalStatus: "PENDING_REVIEW" | "APPROVED" | "REJECTED" =
        "PENDING_REVIEW";
      let approvedAt: Date | undefined = undefined;

      if (biz.isOnlineOnly) {
        hasValidStreetLocation = true; // Online-only doesn't require a physical street
      }

      // Robust Auto-Approve Criteria
      const isHighlyConfident =
        biz.isBlackOwned && finalCategory !== "Uncategorized";

      if (isHighlyConfident && hasValidStreetLocation) {
        finalStatus = "APPROVED";
        approvedAt = new Date();
      } else if (!hasValidStreetLocation && !biz.isOnlineOnly) {
        // AI found a business but NO physical street address. We leave it as PENDING_REVIEW
        // to force human review instead of spamming map with city centers.
        finalStatus = "PENDING_REVIEW";
      }

      const rawConfidence = Number(biz.blackOwnedConfidence);
      const curation: CurationReport = {
        runId: options.runId,
        sourceUrl: url,
        sourceType: object.sourceType,
        model: CURATOR_MODEL,
        blackOwnedConfidence: Number.isFinite(rawConfidence)
          ? Math.min(100, Math.max(0, Math.round(rawConfidence)))
          : null,
        blackOwnedEvidence: biz.blackOwnedEvidence ?? null,
        locationMethod,
        geocodeResults,
        hasWebsite: Boolean(bizWebsite),
        hasOgData: Boolean(ogData),
        checks: [
          {
            key: "blackOwned",
            label: "AI flagged as Black-owned",
            passed: Boolean(biz.isBlackOwned),
            detail: biz.blackOwnedEvidence ?? undefined,
          },
          {
            key: "category",
            label: "Has a category",
            passed: finalCategory !== "Uncategorized",
            detail: finalCategory,
          },
          {
            key: "location",
            label: biz.isOnlineOnly
              ? "Online only (no street address required)"
              : "Street-level location verified",
            passed: hasValidStreetLocation,
            detail: locationMethod,
          },
        ],
        decision: finalStatus === "APPROVED" ? "AUTO_APPROVED" : "PENDING_REVIEW",
        evaluatedAt: new Date(),
      };

      const pendingInsertData: any = {
        name: biz.name,
        category: finalCategory,
        address: addressArray, // Legacy fallback
        locations,
        website: bizWebsite,
        description: biz.description || "",
        isBlackOwned: biz.isBlackOwned,
        isOnlineOnly: biz.isOnlineOnly,
        source: "AI_SCAN",
        status: finalStatus,
        createdAt: new Date(),
        curation,
      };

      if (approvedAt) {
        pendingInsertData.approvedAt = approvedAt;

        // Auto-promote directly to the live 'listings' collection
        const liveLocations = locations
          .map((l) => ({
            address: l.address,
            place_id: l.place_id,
            coordinates: {
              type: "Point",
              coordinates: [Number(l.lng), Number(l.lat)],
            },
          }))
          .filter(
            (l) => l.coordinates.coordinates[0] && l.coordinates.coordinates[1],
          );

        const liveListingToInsert = {
          name: biz.name,
          address:
            liveLocations.length > 0
              ? liveLocations[0].address
              : biz.isOnlineOnly
                ? "Online Only"
                : addressArray[0] || "Unknown",
          city: "",
          categories: [finalCategory],
          url: bizWebsite,
          description: biz.description || "",
          isOnlineOnly: biz.isOnlineOnly,
          claims: [],
          creator: new Date(),
          submitted: new Date(),
          locations: liveLocations,
          og_title: ogData?.title,
          og_description: ogData?.description,
          og_image: ogData?.image,
        };

        if (liveLocations.length > 0) {
          (liveListingToInsert as any).coordinates =
            liveLocations[0].coordinates;
          (liveListingToInsert as any).type = "Point";
        }

        const liveCollection = db.collection("listings");
        const dupInLive = await liveCollection.findOne({ name: biz.name });
        if (!dupInLive) {
          const { insertedId } =
            await liveCollection.insertOne(liveListingToInsert);
          curation.liveListingId = String(insertedId);
          console.log(`🤖 AI Auto-Approved and Published: ${biz.name}`);
        } else {
          // Not ours to revert, so keep it out of liveListingId
          curation.duplicateOfLiveListingId = String(dupInLive._id);
          curation.publishSkippedReason =
            "A live listing with this name already exists";
        }
      }

      newListings.push(pendingInsertData);
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
