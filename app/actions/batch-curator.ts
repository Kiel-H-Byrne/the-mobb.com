// app/actions/batch-curator.ts
"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
import { CurationJob } from "@/db/Types";
import { extractBusinessData } from "@app/actions/ai-curator";
import { checkAdmin } from "@app/actions/admin";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

function extractUrlsFromInput(raw: string | string[]): string[] {
  const text = Array.isArray(raw) ? raw.join("\n") : raw;
  const lines = text
    .split(/[\r\n,]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const validUrls: string[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    try {
      const url = new URL(line);
      if (url.protocol === "http:" || url.protocol === "https:") {
        const normalized = url.href;
        if (!seen.has(normalized)) {
          seen.add(normalized);
          validUrls.push(normalized);
        }
      }
    } catch {
      // Ignore invalid URL strings
    }
  }

  return validUrls;
}

export async function createBatchCurationJob(rawInput: string | string[]) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const urls = extractUrlsFromInput(rawInput);
  if (urls.length === 0) {
    return {
      success: false,
      error: "No valid HTTP or HTTPS URLs found. Please check your links.",
    };
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const jobsCollection = db.collection<CurationJob>("curation_jobs");

    const jobId = new ObjectId();
    const newJob: any = {
      _id: jobId,
      type: "BATCH_URLS",
      status: "PROCESSING",
      createdAt: new Date(),
      startedAt: new Date(),
      totalUrls: urls.length,
      processedUrls: 0,
      successCount: 0,
      failedCount: 0,
      listingsExtracted: 0,
      urls: urls.map((u) => ({
        url: u,
        status: "PENDING",
      })),
    };

    await jobsCollection.insertOne(newJob);

    // Launch worker in background without awaiting, so admin response is immediate
    executeBatchWorker(jobId.toString()).catch((err) => {
      console.error(`Batch job ${jobId} unhandled worker error:`, err);
    });

    return {
      success: true,
      jobId: jobId.toString(),
      totalUrls: urls.length,
    };
  } catch (error: any) {
    console.error("Create batch curation job error:", error);
    return { success: false, error: "Failed to initialize batch curation job." };
  }
}

// Background processing loop with concurrency limit of 2
async function executeBatchWorker(jobIdStr: string) {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const jobsCollection = db.collection("curation_jobs");
  const scannedUrlsCollection = db.collection("scanned_urls");

  const job = await jobsCollection.findOne({ _id: new ObjectId(jobIdStr) });
  if (!job) return;

  const urls = job.urls || [];
  const CONCURRENCY = 2;
  let currentIndex = 0;

  async function processUrl(index: number) {
    const item = urls[index];
    if (!item || item.status === "COMPLETED" || item.status === "FAILED") {
      return;
    }

    // Set URL status to PROCESSING
    await jobsCollection.updateOne(
      { _id: new ObjectId(jobIdStr), "urls.url": item.url },
      { $set: { "urls.$.status": "PROCESSING" } },
    );

    try {
      const res = await extractBusinessData(item.url, { runId: jobIdStr });
      const count = res.count || 0;

      await scannedUrlsCollection.updateOne(
        { url: item.url },
        { $set: { url: item.url, lastScanned: new Date(), status: "success" } },
        { upsert: true },
      );

      await jobsCollection.updateOne(
        { _id: new ObjectId(jobIdStr), "urls.url": item.url },
        {
          $set: {
            "urls.$.status": "COMPLETED",
            "urls.$.listingsFound": count,
            "urls.$.sourceType": res.sourceType,
            "urls.$.processedAt": new Date(),
          },
          $inc: {
            processedUrls: 1,
            successCount: 1,
            listingsExtracted: count,
          },
        },
      );
    } catch (err: any) {
      console.error(`Batch worker error on ${item.url}:`, err.message);

      await scannedUrlsCollection.updateOne(
        { url: item.url },
        {
          $set: {
            url: item.url,
            lastScanned: new Date(),
            status: "error",
            error: err.message,
          },
        },
        { upsert: true },
      );

      await jobsCollection.updateOne(
        { _id: new ObjectId(jobIdStr), "urls.url": item.url },
        {
          $set: {
            "urls.$.status": "FAILED",
            "urls.$.error": err.message || "Failed to extract data",
            "urls.$.processedAt": new Date(),
          },
          $inc: {
            processedUrls: 1,
            failedCount: 1,
          },
        },
      );
    }
  }

  // Promise pool
  const workers: Promise<void>[] = [];
  for (let i = 0; i < CONCURRENCY; i++) {
    workers.push(
      (async () => {
        while (currentIndex < urls.length) {
          const idx = currentIndex++;
          await processUrl(idx);
        }
      })(),
    );
  }

  await Promise.all(workers);

  // Mark job as COMPLETED
  await jobsCollection.updateOne(
    { _id: new ObjectId(jobIdStr) },
    {
      $set: {
        status: "COMPLETED",
        finishedAt: new Date(),
      },
    },
  );

  revalidatePath("/admin/reviews");
}

export async function processBatchStep(jobIdStr: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const jobsCollection = db.collection("curation_jobs");

    const job = await jobsCollection.findOne({ _id: new ObjectId(jobIdStr) });
    if (!job || job.status === "COMPLETED") {
      return { success: true, completed: true };
    }

    // Find first pending or stalled URL
    const nextItem = (job.urls || []).find((u: any) => u.status === "PENDING");
    if (!nextItem) {
      await jobsCollection.updateOne(
        { _id: new ObjectId(jobIdStr) },
        { $set: { status: "COMPLETED", finishedAt: new Date() } },
      );
      return { success: true, completed: true };
    }

    // Process this single URL
    await jobsCollection.updateOne(
      { _id: new ObjectId(jobIdStr), "urls.url": nextItem.url },
      { $set: { "urls.$.status": "PROCESSING" } },
    );

    try {
      const res = await extractBusinessData(nextItem.url, { runId: jobIdStr });
      const count = res.count || 0;

      await jobsCollection.updateOne(
        { _id: new ObjectId(jobIdStr), "urls.url": nextItem.url },
        {
          $set: {
            "urls.$.status": "COMPLETED",
            "urls.$.listingsFound": count,
            "urls.$.sourceType": res.sourceType,
            "urls.$.processedAt": new Date(),
          },
          $inc: {
            processedUrls: 1,
            successCount: 1,
            listingsExtracted: count,
          },
        },
      );
    } catch (err: any) {
      await jobsCollection.updateOne(
        { _id: new ObjectId(jobIdStr), "urls.url": nextItem.url },
        {
          $set: {
            "urls.$.status": "FAILED",
            "urls.$.error": err.message,
            "urls.$.processedAt": new Date(),
          },
          $inc: {
            processedUrls: 1,
            failedCount: 1,
          },
        },
      );
    }

    return { success: true, completed: false };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getCurationJob(
  jobIdStr: string,
): Promise<{ success: boolean; data?: CurationJob; error?: string }> {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const jobsCollection = db.collection<CurationJob>("curation_jobs");

    let queryId: any;
    try {
      queryId = new ObjectId(jobIdStr);
    } catch {
      queryId = jobIdStr;
    }

    const job = await jobsCollection.findOne({
      $or: [{ _id: queryId }, { _id: jobIdStr }],
    });
    if (!job) return { success: false, error: "Job not found" };

    return {
      success: true,
      data: {
        ...job,
        _id: String(job._id),
      } as CurationJob,
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getRecentCurationJobs(
  limit = 5,
): Promise<{ success: boolean; data?: CurationJob[]; error?: string }> {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const jobsCollection = db.collection<CurationJob>("curation_jobs");

    const jobs = await jobsCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return {
      success: true,
      data: jobs.map((j: any) => ({
        ...j,
        _id: String(j._id),
      })) as CurationJob[],
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
