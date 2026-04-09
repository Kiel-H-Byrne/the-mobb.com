import clientPromise from "@/db/mongodb";
import { extractBusinessData } from "@app/actions/ai-curator";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Module-level mocks ──────────────────────────────────────────────────────

vi.mock("ai", () => ({
  generateObject: vi.fn(),
}));

vi.mock("@ai-sdk/openai", () => ({
  createOpenAI: vi.fn(() => vi.fn()),
}));

// ─── Helper: Create a typed HTML fetch response ───────────────────────────────

/**
 * Creates a fake HTML fetch response. Used to mock the first fetch() call
 * inside fetchAndCleanHTML. Must be enqueued BEFORE geocoding mocks.
 */
function makeHtmlResponse(html = "<html><body>A Black-owned business.</body></html>") {
  return {
    ok: true,
    status: 200,
    text: async () => html,
  };
}

/**
 * Creates a fake geocoding response (street-level hit).
 * Used to mock the geocode/places fetch() calls after the HTML fetch.
 */
function makeGeocodeResponse(lat = 33.75, lng = -84.37) {
  return {
    ok: true,
    json: async () => ({
      status: "OK",
      results: [{
        geometry: { location: { lat, lng } },
        place_id: "ChIJtest",
        formatted_address: `${lat},${lng}`,
        types: ["street_address", "establishment"],
      }],
    }),
  };
}

/** Creates a zero-result geocoding/places response. */
const zeroResultsResponse = {
  ok: true,
  json: async () => ({ status: "ZERO_RESULTS", candidates: [], results: [] }),
};

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getCollectionMock(collectionName: string) {
  const client = await clientPromise;
  const db = client.db("test-db");
  return db.collection(collectionName);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("AI Curator: extractBusinessData", () => {
  let generateObject: any;

  beforeEach(async () => {
    // Global setup.ts beforeEach handles mock reset and restoration.
    // Set the Google Maps API key so geocoding is attempted in extractBusinessData.
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY = "fake-api-key";
    const aiModule = await import("ai");
    generateObject = aiModule.generateObject;
  });

  // ── Happy path: listicle ──────────────────────────────────────────────────

  it("extracts multiple businesses from a listicle and saves them as pending", async () => {
    generateObject.mockResolvedValueOnce({
      object: {
        sourceType: "listicle_directory",
        businesses: [
          { name: "Mama's Kitchen", category: "Restaurant", address: ["500 Auburn Ave NE, Atlanta, GA 30312"], isBlackOwned: true, isOnlineOnly: false, description: "Soul food", website: null, socialHandle: null },
          { name: "Afro Tech Hub", category: "Tech", address: ["100 Peachtree St, Atlanta, GA 30303"], isBlackOwned: true, isOnlineOnly: false, description: "Co-working", website: null, socialHandle: null },
        ],
      },
    });

    // Queue: 1. HTML fetch, 2. geocode for Mama's, 3. geocode for Afro Tech
    (global.fetch as any)
      .mockResolvedValueOnce(makeHtmlResponse())
      .mockResolvedValueOnce(makeGeocodeResponse(33.75, -84.37))
      .mockResolvedValueOnce(makeGeocodeResponse(33.76, -84.38));

    const pending = await getCollectionMock("pending_listings");

    const res = await extractBusinessData("https://example.com/listicle");

    expect(res.success).toBe(true);
    expect(res.sourceType).toBe("listicle_directory");
    expect(res.count).toBe(2);
    expect(pending.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: "Mama's Kitchen", source: "AI_SCAN" }),
        expect.objectContaining({ name: "Afro Tech Hub", source: "AI_SCAN" }),
      ]),
    );
  });

  // ── Auto-approve: confident + street address ──────────────────────────────

  it("auto-approves and publishes when isBlackOwned=true, category set, and street address geocoded", async () => {
    generateObject.mockResolvedValueOnce({
      object: {
        sourceType: "single_business",
        businesses: [{
          name: "Slutty Vegan ATL",
          category: "Restaurant",
          address: ["565 Lawton St SW, Atlanta, GA 30310"],
          isBlackOwned: true,
          isOnlineOnly: false,
          description: "Plant-based soul food.",
          website: null,
          socialHandle: null,
        }],
      },
    });

    // Queue: 1. HTML, 2. geocoding (street_address type → auto-approve)
    (global.fetch as any)
      .mockResolvedValueOnce(makeHtmlResponse())
      .mockResolvedValueOnce(makeGeocodeResponse(33.739, -84.419));

    const listings = await getCollectionMock("listings");
    const pending = await getCollectionMock("pending_listings");

    const res = await extractBusinessData("https://slutvegan.com");

    expect(res.success).toBe(true);
    expect(listings.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Slutty Vegan ATL" }),
    );
    expect(pending.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ status: "APPROVED", name: "Slutty Vegan ATL" }),
      ]),
    );
  });

  // ── Online-only auto-approve ───────────────────────────────────────────────

  it("skips geocoding and auto-approves online-only businesses with category set", async () => {
    generateObject.mockResolvedValueOnce({
      object: {
        sourceType: "single_business",
        businesses: [{
          name: "Black Threads Co",
          category: "Fashion",
          address: [],
          isBlackOwned: true,
          isOnlineOnly: true,
          description: "Online fashion brand.",
          website: "https://blackthreads.co",
          socialHandle: "@blackthreads",
        }],
      },
    });

    // Queue: 1. HTML only — no geocoding for online-only
    (global.fetch as any).mockResolvedValueOnce(makeHtmlResponse());

    const listings = await getCollectionMock("listings");

    const res = await extractBusinessData("https://blackthreads.co");

    expect(res.success).toBe(true);
    expect(listings.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Black Threads Co", isOnlineOnly: true }),
    );
  });

  // ── Deduplication ─────────────────────────────────────────────────────────

  it("skips inserting a business that already exists in pending_listings", async () => {
    generateObject.mockResolvedValueOnce({
      object: {
        sourceType: "single_business",
        businesses: [{
          name: "Duplicate Biz",
          category: "Retail",
          address: [],
          isBlackOwned: true,
          isOnlineOnly: false,
          description: "",
          website: null,
          socialHandle: null,
        }],
      },
    });

    (global.fetch as any).mockResolvedValueOnce(makeHtmlResponse());

    // Simulate the business already existing in pending
    const pending = await getCollectionMock("pending_listings");
    (pending.findOne as any).mockResolvedValueOnce({ _id: "existing", name: "Duplicate Biz" });

    const res = await extractBusinessData("https://example.com/dupe");

    expect(res.success).toBe(true);
    expect(res.count).toBe(0);
    expect(pending.insertMany).not.toHaveBeenCalled();
  });

  // ── Uncategorized → PENDING_REVIEW ────────────────────────────────────────

  it("leaves a listing as PENDING_REVIEW when category is null (Uncategorized)", async () => {
    generateObject.mockResolvedValueOnce({
      object: {
        sourceType: "single_business",
        businesses: [{
          name: "Mystery Shop",
          category: null,
          address: ["100 Main St, Chicago, IL"],
          isBlackOwned: true,
          isOnlineOnly: false,
          description: "",
          website: null,
          socialHandle: null,
        }],
      },
    });

    // Queue: 1. HTML, 2. geocoding (street hit)
    (global.fetch as any)
      .mockResolvedValueOnce(makeHtmlResponse())
      .mockResolvedValueOnce(makeGeocodeResponse(41.88, -87.62));

    const listings = await getCollectionMock("listings");
    const pending = await getCollectionMock("pending_listings");

    await extractBusinessData("https://mysteryshop.com");

    expect(listings.insertOne).not.toHaveBeenCalled();
    expect(pending.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ status: "PENDING_REVIEW", category: "Uncategorized" }),
      ]),
    );
  });

  // ── Missing address → PENDING_REVIEW ──────────────────────────────────────

  it("leaves listing as PENDING_REVIEW when AI finds no address and Places API also fails", async () => {
    generateObject.mockResolvedValueOnce({
      object: {
        sourceType: "single_business",
        businesses: [{
          name: "No Address Biz",
          category: "Service",
          address: [],
          isBlackOwned: true,
          isOnlineOnly: false,
          description: "",
          website: null,
          socialHandle: null,
        }],
      },
    });

    // Queue: 1. HTML, 2. Places API fallback (zero results)
    (global.fetch as any)
      .mockResolvedValueOnce(makeHtmlResponse())
      .mockResolvedValueOnce(zeroResultsResponse);

    const pending = await getCollectionMock("pending_listings");

    await extractBusinessData("https://noaddress.com");

    expect(pending.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ status: "PENDING_REVIEW" }),
      ]),
    );
  });

  // ── Website deduplication: strip listicle source URL ─────────────────────

  it("clears bizWebsite when AI returns the listicle's own URL as the biz website", async () => {
    const listicleUrl = "https://thelist.com/top-10-businesses";

    generateObject.mockResolvedValueOnce({
      object: {
        sourceType: "listicle_directory",
        businesses: [{
          name: "Listed Biz",
          category: "Food",
          address: [],
          isBlackOwned: false,
          isOnlineOnly: false,
          description: "",
          website: listicleUrl, // Same domain as source — should be stripped
          socialHandle: null,
        }],
      },
    });

    // Queue: 1. HTML, 2. Places (zero results — no address found)
    (global.fetch as any)
      .mockResolvedValueOnce(makeHtmlResponse())
      .mockResolvedValueOnce(zeroResultsResponse);

    const pending = await getCollectionMock("pending_listings");

    await extractBusinessData(listicleUrl);

    expect(pending.insertMany).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ website: "" }),
      ]),
    );
  });
});
