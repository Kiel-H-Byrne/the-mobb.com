import { NextResponse } from 'next/server';
import { extractBusinessData } from "@app/actions/ai-curator";
import clientPromise, { DB_NAME } from "@/db/mongodb";

// Vercel Cron will send this header if configured
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
        if (process.env.NODE_ENV !== 'development') {
            return new Response('Unauthorized', { status: 401 });
        }
    }

    try {
        const serpApiKey = process.env.SERP_API_KEY;
        if (!serpApiKey) {
            throw new Error("SERP_API_KEY is missing");
        }

        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const pendingCollection = db.collection('pending_listings');

        // Query SerpApi
        const query = "Black owned businesses restaurants near me"; // Can be randomized or rotated
        const searchUrl = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&api_key=${serpApiKey}`;

        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();

        if (!searchData.organic_results) {
            return NextResponse.json({ success: false, error: "No organic results from SerpApi" });
        }

        const urlsToScan: string[] = searchData.organic_results
            .map((r: any) => r.link)
            .slice(0, 5); // Limit to top 5 hits per cron execution

        const results = [];

        // Process each URL
        for (const url of urlsToScan) {
            // Very basic skip if we already scanned this url (needs a `url` field tracking in pending)
            const existing = await pendingCollection.findOne({ website: url });
            if (existing) {
                results.push({ url, status: "skipped_exists" });
                continue;
            }

            try {
                const extractRes = await extractBusinessData(url);
                results.push({ url, status: "processed", ...extractRes });
            } catch (err: any) {
                results.push({ url, status: "error", error: err.message });
            }
        }

        return NextResponse.json({ success: true, processed: results });
    } catch (error: any) {
        console.error("Cron Scout Error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
