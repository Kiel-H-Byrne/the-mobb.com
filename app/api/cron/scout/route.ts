import clientPromise, { DB_NAME } from "@/db/mongodb";
import { extractBusinessData } from "@app/actions/ai-curator";
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure the route is never cached

// Vercel Cron will send this header if configured
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    console.log("CRON: Initiating /api/cron/scout...");

    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        if (process.env.NODE_ENV !== 'development') {
            console.warn("CRON: Unauthorized attempt. Invalid or missing authorization header.");
            return new Response('Unauthorized', { status: 401 });
        }
    }

    try {
        const serpApiKey = process.env.SERP_API_KEY;
        if (!serpApiKey) {
            console.error("CRON Error: SERP_API_KEY is missing from environment variables.");
            throw new Error("SERP_API_KEY is missing");
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const pendingCollection = db.collection('pending_listings');

        // Query SerpApi
        const query = "Black owned businesses restaurants near me"; // Can be randomized or rotated
        const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;

        console.log(`CRON: Fetching search results from SerpAPI for query: "${query}"`);

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.organic_results) {
            console.warn("CRON: No organic results returned from SerpApi.");
            return NextResponse.json({ success: false, error: "No organic results from SerpApi" });
        }

        console.log(`CRON: Found ${searchData.organic_results.length} organic results.`);

        const urlsToScan: string[] = searchData.organic_results
            .map((r: any) => r.link)
            .slice(0, 5); // Limit to top 5 hits per cron execution

        console.log(`CRON: Selected ${urlsToScan.length} URLs to process.`, urlsToScan);

        const results = [] as { url: string, status: string, error?: string }[];

        // Process each URL
        for (const url of urlsToScan) {
            // Very basic skip if we already scanned this url (needs a `url` field tracking in pending)
            const existing = await pendingCollection.findOne({ website: url });
            if (existing) {
                console.log(`CRON: Skipping URL (already exists): ${url}`);
                results.push({ url, status: "skipped_exists" });
                continue;
            }

            console.log(`CRON: Extracting business data from URL: ${url}`);
            try {
                const extractRes = await extractBusinessData(url);
                console.log(`CRON: Successfully extracted data for URL: ${url}`);
                results.push({ url, status: "processed", ...extractRes });
            } catch (err: any) {
                console.error(`CRON: Failed to extract data for URL: ${url}. Error:`, err.message);
                results.push({ url, status: "error", error: err.message });
            }
        }

        console.log("CRON: Completed job /api/cron/scout successfully.", results);
        return NextResponse.json({ success: true, processed: results });
    } catch (error: any) {
        console.error("CRON Scout Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
