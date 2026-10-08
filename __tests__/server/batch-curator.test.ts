import clientPromise from "@/db/mongodb";
import { createBatchCurationJob, getCurationJob } from "@app/actions/batch-curator";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function getCollectionMock(name: string) {
  const client = await clientPromise;
  const db = client.db("test-db");
  return db.collection(name);
}

describe("Batch URL Curation & Job Monitor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns an error if no valid HTTP/HTTPS URLs are provided", async () => {
    const res = await createBatchCurationJob("invalid text, not a url");
    expect(res.success).toBe(false);
    expect(res.error).toContain("No valid HTTP or HTTPS URLs");
  });

  it("extracts valid URLs, deduplicates, and creates a queued curation job", async () => {
    const jobsCol = await getCollectionMock("curation_jobs");
    const rawInput = `
      https://example.com/black-owned-eateries
      https://example.com/black-owned-shops, https://example.com/black-owned-eateries
      not-a-link
    `;

    const res = await createBatchCurationJob(rawInput);
    expect(res.success).toBe(true);
    expect(res.totalUrls).toBe(2); // Deduplicated 2 unique URLs
    expect(res.jobId).toBeDefined();

    expect(jobsCol.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "BATCH_URLS",
        totalUrls: 2,
        status: "PROCESSING",
      }),
    );
  });

  it("retrieves an active curation job status", async () => {
    const jobsCol = await getCollectionMock("curation_jobs");
    (jobsCol.findOne as any).mockResolvedValueOnce({
      _id: "job-12345",
      type: "BATCH_URLS",
      status: "PROCESSING",
      totalUrls: 2,
      processedUrls: 1,
      listingsExtracted: 4,
      urls: [
        { url: "https://example.com/1", status: "COMPLETED", listingsFound: 4 },
        { url: "https://example.com/2", status: "PENDING" },
      ],
    });

    const res = await getCurationJob("job-12345");
    expect(res.success).toBe(true);
    expect(res.data?.status).toBe("PROCESSING");
    expect(res.data?.listingsExtracted).toBe(4);
  });
});
