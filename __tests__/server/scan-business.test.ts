import clientPromise from "@/db/mongodb";
import { scanBusinessUrl } from "@app/actions/scanBusiness";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Mock AI SDK at module level ─────────────────────────────────────────────

vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => vi.fn()),
}));

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function getCollectionMock(name: string) {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  return db.collection(name);
}

const MOCK_AI_RESULT = {
  name: "Kinky Curls Salon",
  description: "A natural hair salon owned by and for the community.",
  isBlackOwnedDetected: true,
  confidenceScore: 92,
  category: "Service",
  address: "100 Cascade Rd SW, Atlanta, GA 30311",
  website: "https://kinkycurls.com",
};

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("scanBusinessUrl Server Action", () => {
  let generateObject: any;

  beforeEach(async () => {
    // Global setup.ts beforeEach handles clearing and mock re-initialization
    const aiModule = await import("ai");
    generateObject = aiModule.generateObject;
  });

  // ── Input validation ──────────────────────────────────────────────────────

  it("throws when no URL is provided", async () => {
    await expect(scanBusinessUrl("")).rejects.toThrow("URL is required");
  });

  // ── Cache hit ─────────────────────────────────────────────────────────────

  it("returns cached result without calling AI when a recent cache entry exists", async () => {
    const collection = await getCollectionMock("ai_scan_cache");
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 5); // 5 days ago — within 30-day window

    (collection.findOne as any).mockResolvedValueOnce({
      url: "https://cached-business.com",
      scannedAt: recentDate,
      result: { ...MOCK_AI_RESULT, confidenceScore: 85 },
    });

    const res = await scanBusinessUrl("https://cached-business.com");

    expect(res.success).toBe(true);
    expect(res.data.name).toBe(MOCK_AI_RESULT.name);
    expect(generateObject).not.toHaveBeenCalled(); // Cache short-circuits AI
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("bypasses cache when the cached result has low confidence (<70)", async () => {
    const collection = await getCollectionMock("ai_scan_cache");
    const recentDate = new Date();

    (collection.findOne as any).mockResolvedValueOnce({
      url: "https://low-confidence.com",
      scannedAt: recentDate,
      result: { ...MOCK_AI_RESULT, confidenceScore: 55 }, // Below threshold
    });

    // Must still fetch HTML
    (global.fetch as any).mockResolvedValueOnce({
      text: async () => "<html><body>Low confidence content</body></html>",
    });

    generateObject.mockResolvedValueOnce({ object: MOCK_AI_RESULT });

    const res = await scanBusinessUrl("https://low-confidence.com");

    expect(res.success).toBe(true);
    expect(generateObject).toHaveBeenCalled(); // AI was called despite cache presence
  });

  it("bypasses cache when the cache entry is stale (older than 30 days)", async () => {
    const collection = await getCollectionMock("ai_scan_cache");
    const staleDate = new Date();
    staleDate.setDate(staleDate.getDate() - 45); // 45 days ago — expired

    (collection.findOne as any).mockResolvedValueOnce({
      url: "https://stale-cache.com",
      scannedAt: staleDate,
      result: { ...MOCK_AI_RESULT, confidenceScore: 95 },
    });

    (global.fetch as any).mockResolvedValueOnce({
      text: async () => "<html><body>Refreshed content</body></html>",
    });

    generateObject.mockResolvedValueOnce({ object: MOCK_AI_RESULT });

    const res = await scanBusinessUrl("https://stale-cache.com");

    expect(res.success).toBe(true);
    expect(generateObject).toHaveBeenCalled();
  });

  // ── Full scan pipeline ────────────────────────────────────────────────────

  it("fetches HTML, extracts data via AI, saves to cache, and returns result", async () => {
    // Cache miss
    const collection = await getCollectionMock("ai_scan_cache");
    (collection.findOne as any).mockResolvedValueOnce(null);

    // HTML fetch
    (global.fetch as any).mockResolvedValueOnce({
      text: async () => "<html><body>Kinky Curls is a Black-owned natural hair salon.</body></html>",
    });

    generateObject.mockResolvedValueOnce({ object: MOCK_AI_RESULT });

    const res = await scanBusinessUrl("https://kinkycurls.com");

    expect(res.success).toBe(true);
    expect(res.data.name).toBe("Kinky Curls Salon");
    expect(res.data.isBlackOwnedDetected).toBe(true);
    expect(res.data.confidenceScore).toBe(92);

    // Result should be upserted into the cache
    expect(collection.updateOne).toHaveBeenCalledWith(
      { url: "https://kinkycurls.com" },
      expect.objectContaining({
        $set: expect.objectContaining({
          url: "https://kinkycurls.com",
          result: MOCK_AI_RESULT,
        }),
      }),
      { upsert: true },
    );
  });

  // ── Fetch failure ─────────────────────────────────────────────────────────

  it("throws a descriptive error when the HTML fetch fails", async () => {
    const collection = await getCollectionMock("ai_scan_cache");
    (collection.findOne as any).mockResolvedValueOnce(null);

    (global.fetch as any).mockRejectedValueOnce(new Error("ECONNREFUSED"));

    await expect(scanBusinessUrl("https://unreachable.com")).rejects.toThrow(
      "Failed to fetch URL: ECONNREFUSED",
    );
  });

  // ── AI output shape ───────────────────────────────────────────────────────

  it("returns confidence score from the AI model output", async () => {
    const collection = await getCollectionMock("ai_scan_cache");
    (collection.findOne as any).mockResolvedValueOnce(null);

    (global.fetch as any).mockResolvedValueOnce({
      text: async () => "<html><body>Content</body></html>",
    });

    generateObject.mockResolvedValueOnce({
      object: { ...MOCK_AI_RESULT, confidenceScore: 78, isBlackOwnedDetected: false },
    });

    const res = await scanBusinessUrl("https://ambiguous-biz.com");

    expect(res.data.confidenceScore).toBe(78);
    expect(res.data.isBlackOwnedDetected).toBe(false);
  });
});
