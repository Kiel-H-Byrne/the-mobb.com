import clientPromise, { DB_NAME } from "@/db/mongodb";
import { extractBusinessData } from "@app/actions/ai-curator";
import { ObjectId } from "mongodb";

export type ScoutResult =
  | {
      success: true;
      runId: string;
      processed: { url: string; status: string; error?: string }[];
    }
  | { success: false; error: string };

// Shared by the Vercel cron route and the admin "run scout" action.
// Throws on configuration/infrastructure errors.
export async function runScout(
  trigger: "cron" | "manual",
): Promise<ScoutResult> {
  const serpApiKey = process.env.SERP_API_KEY;
  if (!serpApiKey) {
    console.error(
      "CRON Error: SERP_API_KEY is missing from environment variables.",
    );
    throw new Error("SERP_API_KEY is missing");
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const scannedUrlsCollection = db.collection("scanned_urls");

  const currentYear = new Date().getFullYear();
  const searchConfigs = [
    { q: '"black owned" businesses -site:yelp.com -site:yellowpages.com -site:wikipedia.org', tbs: "qdr:w", filter: 0 }, // Super fresh - last week
    { q: '"black owned" businesses (blog OR article OR roundup OR "newly opened")', tbs: "qdr:m", filter: 0 }, // Fresh editorial roundups - last month
    { q: 'new "black owned" businesses -site:yelp.com -site:yellowpages.com', tbs: "qdr:w", filter: 0 }, // New businesses - last week
    { q: 'recent "black owned" restaurants -site:yelp.com', tbs: "qdr:m", filter: 0 }, // Recent restaurant openings
    { q: '"black owned" shops opening -site:yelp.com', tbs: "qdr:m", filter: 0 }, // New retail openings
    { q: '"black owned" (cafe OR bakery OR bookstore OR boutique)', tbs: "qdr:m", filter: 0 }, // Fresh specialty spots
    { q: `best new "black owned" businesses ${currentYear}`, tbs: "qdr:m", filter: 0 }, // Current year features
    { q: 'intitle:"black owned" (businesses OR restaurants OR brands)', tbs: "qdr:m", filter: 0 }, // Targeted title matches
    { q: '"black owned" brand spotlight OR feature', tbs: "qdr:m", filter: 0 }, // Editorial features
    { q: 'new "black owned" eateries OR stores near me', tbs: "qdr:w", filter: 0 }, // Super fresh local spots
  ];

  const selectedConfig =
    searchConfigs[Math.floor(Math.random() * searchConfigs.length)];

  // Each run is logged to scout_runs so /admin/reports can show what it did
  const runsCollection = db.collection("scout_runs");
  const runId = new ObjectId();
  await runsCollection.insertOne({
    _id: runId,
    trigger,
    query: selectedConfig.q,
    searchParams: selectedConfig,
    status: "running",
    startedAt: new Date(),
  });
  const finishRun = (fields: Record<string, unknown>) =>
    runsCollection.updateOne(
      { _id: runId },
      { $set: { ...fields, finishedAt: new Date() } },
    );

  try {
    return await scanSearchResults(serpApiKey);
  } catch (error: any) {
    await finishRun({ status: "failed", error: error.message });
    throw error;
  }

  async function scanSearchResults(apiKey: string): Promise<ScoutResult> {
    // Build SerpApi URL with advanced params
    const searchParams = new URLSearchParams({
      engine: "google",
      api_key: apiKey,
      q: selectedConfig.q,
      ...(selectedConfig.tbs && { tbs: selectedConfig.tbs }),
      ...(selectedConfig.filter !== undefined && {
        filter: selectedConfig.filter.toString(),
      }),
    });

    const searchUrl = `https://serpapi.com/search.json?${searchParams.toString()}`;

    console.log(
      `CRON: Fetching search results from SerpAPI with query: "${selectedConfig.q}" and params: ${JSON.stringify(selectedConfig)}`,
    );

    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    if (!searchData.organic_results) {
      console.warn("CRON: No organic results returned from SerpApi.");
      await finishRun({ status: "no_results", urls: [] });
      return { success: false, error: "No organic results from SerpApi" };
    }

    console.log(
      `CRON: Found ${searchData.organic_results.length} organic results.`,
    );

    // Filter out URLs we have already scanned in previous cron runs
    const allSerpUrls: string[] = searchData.organic_results.map(
      (r: any) => r.link,
    );
    const alreadyScannedDocs = await scannedUrlsCollection
      .find({ url: { $in: allSerpUrls } })
      .toArray();
    const alreadyScannedUrls = new Set(
      alreadyScannedDocs.map((doc) => doc.url),
    );

    const urlsToScan = allSerpUrls
      .filter((url) => !alreadyScannedUrls.has(url))
      .slice(0, 5);

    console.log(
      `CRON: Selected ${urlsToScan.length} NEW URLs to process.`,
      urlsToScan,
    );

    const results = [] as { url: string; status: string; error?: string }[];

    // Process each URL
    for (const url of urlsToScan) {
      console.log(`CRON: Extracting business data from URL: ${url}`);
      try {
        const extractRes = await extractBusinessData(url, {
          runId: runId.toString(),
        });
        console.log(`CRON: Successfully extracted data for URL: ${url}`);

        // Mark as scanned so we don't process it tomorrow
        await scannedUrlsCollection.updateOne(
          { url },
          { $set: { url, lastScanned: new Date(), status: "success" } },
          { upsert: true },
        );

        results.push({ url, status: "processed", ...extractRes });
      } catch (err: any) {
        console.error(
          `CRON: Failed to extract data for URL: ${url}. Error:`,
          err.message,
        );

        // still mark it as scanned but with error status, so we don't infinitely retry broken links
        await scannedUrlsCollection.updateOne(
          { url },
          {
            $set: {
              url,
              lastScanned: new Date(),
              status: "error",
              error: err.message,
            },
          },
          { upsert: true },
        );

        results.push({ url, status: "error", error: err.message });
      }
    }

    console.log("CRON: Completed job /api/cron/scout successfully.", results);
    await finishRun({
      status: "completed",
      urls: results.map((r: any) => ({
        url: r.url,
        status: r.status,
        count: r.count ?? 0,
        sourceType: r.sourceType,
        error: r.error,
      })),
    });
    return { success: true, runId: runId.toString(), processed: results };
  }
}
