import { runScout } from "@/util/scout";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // Ensure the route is never cached

// Vercel Cron will send this header if configured
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  console.log("CRON: Initiating /api/cron/scout...");

  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    if (process.env.NODE_ENV !== "development") {
      console.warn(
        "CRON: Unauthorized attempt. Invalid or missing authorization header.",
      );
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const result = await runScout("cron");
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("CRON Scout Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
