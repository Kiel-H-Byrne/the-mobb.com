import clientPromise from "@/db/mongodb";
import {
  fetchAllCategories,
  fetchGlobalListings,
  fetchOnlineOnlyListings,
  fetchTopListings,
  findBusinessesNearby,
  searchBusinesses,
} from "@app/actions/geo-search";
import { beforeEach, describe, expect, it } from "vitest";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getCollectionMock(collectionName = "listings") {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  return db.collection(collectionName);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Geo-Search Server Actions", () => {
  beforeEach(() => {
    // Global setup.ts beforeEach handles clearing and mock re-initialization
  });

  // ── findBusinessesNearby ──────────────────────────────────────────────────

  describe("findBusinessesNearby", () => {
    it("returns an empty array when no businesses are within range", async () => {
      const result = await findBusinessesNearby(40.73061, -73.935242);
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0);
    });

    it("passes $near query with [lng, lat] coordinate order (MongoDB 2dsphere standard)", async () => {
      const collection = await getCollectionMock("listings");
      const lat = 33.749;
      const lng = -84.388;
      const radius = 8000;

      await findBusinessesNearby(lat, lng, radius);

      // ── SNAPSHOT: Full $near query shape ─────────────────────────────────
      // If this fails, a coordinate-order or schema change has broken map search.
      expect(collection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          coordinates: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [lng, lat], // Critical: MUST be [lng, lat] not [lat, lng]
              },
              $maxDistance: radius,
            },
          },
        }),
      );
      expect((collection.find as any).mock.calls[0][0]).toMatchInlineSnapshot(`
        {
          "coordinates": {
            "$near": {
              "$geometry": {
                "coordinates": [
                  -84.388,
                  33.749,
                ],
                "type": "Point",
              },
              "$maxDistance": 8000,
            },
          },
        }
      `);
    });

    it("uses the default 5000 meter radius when none is specified", async () => {
      const collection = await getCollectionMock("listings");

      await findBusinessesNearby(40.73, -73.93);

      expect(collection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          coordinates: expect.objectContaining({
            $near: expect.objectContaining({ $maxDistance: 5000 }),
          }),
        }),
      );
    });

    it("returns an empty array gracefully on MongoDB query error", async () => {
      const collection = await getCollectionMock("listings");
      ((collection as any).toArray as any).mockRejectedValueOnce(new Error("DB connection error"));

      const result = await findBusinessesNearby(0, 0);
      expect(result).toEqual([]);
    });

    it("returns JSON-serializable results (no ObjectId instances)", async () => {
      const collection = await getCollectionMock("listings");
      ((collection as any).toArray as any).mockResolvedValueOnce([
        { _id: "507f1f77bcf86cd799439011", name: "Soul Bistro", coordinates: { type: "Point", coordinates: [-84.3, 33.7] } },
      ]);

      const result = await findBusinessesNearby(33.7, -84.3);
      // JSON.parse/stringify used in implementation strips non-serializable types
      expect(() => JSON.stringify(result)).not.toThrow();
      expect(result[0].name).toBe("Soul Bistro");
    });
  });

  // ── fetchTopListings ──────────────────────────────────────────────────────

  describe("fetchTopListings", () => {
    it("calls .limit() with the specified number", async () => {
      const collection = await getCollectionMock("listings");

      await fetchTopListings(25);

      expect((collection as any).limit).toHaveBeenCalledWith(25);
    });

    it("defaults to 50 listings when no limit is specified", async () => {
      const collection = await getCollectionMock("listings");

      await fetchTopListings();

      expect((collection as any).limit).toHaveBeenCalledWith(50);
    });
  });

  // ── fetchGlobalListings ───────────────────────────────────────────────────

  describe("fetchGlobalListings", () => {
    it("returns all listings with no category filter", async () => {
      const result = await fetchGlobalListings();
      expect(result).toBeInstanceOf(Array);
    });

    it("applies $in category filter when categories are specified", async () => {
      const collection = await getCollectionMock("listings");

      await fetchGlobalListings(1, 20, ["Restaurant", "Retail"]);

      expect(collection.find).toHaveBeenCalledWith(
        expect.objectContaining({
          categories: { $in: ["Restaurant", "Retail"] },
        }),
      );
    });

    it("does NOT add a categories filter when the array is empty", async () => {
      const collection = await getCollectionMock("listings");

      await fetchGlobalListings(1, 20, []);

      expect(collection.find).toHaveBeenCalledWith({});
    });

    it("calculates the correct skip value for pagination", async () => {
      const collection = await getCollectionMock("listings");

      await fetchGlobalListings(3, 20); // Page 3, limit 20 → skip 40

      expect((collection as any).skip).toHaveBeenCalledWith(40);
    });

    it("clamps skip to 0 for page 0 or negative page numbers", async () => {
      const collection = await getCollectionMock("listings");

      await fetchGlobalListings(0, 20);

      expect((collection as any).skip).toHaveBeenCalledWith(0);
    });
  });

  // ── fetchOnlineOnlyListings ───────────────────────────────────────────────

  describe("fetchOnlineOnlyListings", () => {
    it("always includes { isOnlineOnly: true } in the query", async () => {
      const collection = await getCollectionMock("listings");

      await fetchOnlineOnlyListings();

      expect(collection.find).toHaveBeenCalledWith(
        expect.objectContaining({ isOnlineOnly: true }),
      );
    });

    it("combines isOnlineOnly filter with category filter", async () => {
      const collection = await getCollectionMock("listings");

      await fetchOnlineOnlyListings(1, 20, ["Tech"]);

      // ── SNAPSHOT: Combined online-only + category filter shape ────────────
      expect(collection.find).toHaveBeenCalledWith({
        isOnlineOnly: true,
        categories: { $in: ["Tech"] },
      });
      expect((collection.find as any).mock.calls[0][0]).toMatchInlineSnapshot(`
        {
          "categories": {
            "$in": [
              "Tech",
            ],
          },
          "isOnlineOnly": true,
        }
      `);
    });
  });

  // ── fetchAllCategories ────────────────────────────────────────────────────

  describe("fetchAllCategories", () => {
    it("returns a flat array of category names", async () => {
      const collection = await getCollectionMock("categories");
      ((collection as any).toArray as any).mockResolvedValueOnce([
        { name: "Restaurant" },
        { name: "Barbershop" },
        { name: "Tech" },
      ]);

      const categories = await fetchAllCategories();
      expect(categories).toEqual(["Restaurant", "Barbershop", "Tech"]);
    });
  });

  // ── searchBusinesses ──────────────────────────────────────────────────────

  describe("searchBusinesses", () => {
    it("runs an Atlas Search aggregate pipeline with the query term", async () => {
      const collection = await getCollectionMock("listings");
      ((collection as any).toArray as any).mockResolvedValueOnce([
        { name: "Wakanda Cuts Barbershop" },
      ]);

      const results = await searchBusinesses("Wakanda");

      expect(collection.aggregate).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            $search: expect.objectContaining({
              text: expect.objectContaining({ query: "Wakanda" }),
            }),
          }),
        ]),
      );
      // ── SNAPSHOT: First stage of the Atlas Search pipeline ────────────────
      // Guards against accidental pipeline restructure that silences search results.
      const firstStage = (collection.aggregate as any).mock.calls[0][0][0];
      expect(firstStage).toMatchInlineSnapshot(`
        {
          "$search": {
            "index": "default",
            "text": {
              "fuzzy": {
                "maxEdits": 1,
              },
              "path": "name",
              "query": "Wakanda",
            },
          },
        }
      `);

      expect(results[0].name).toBe("Wakanda Cuts Barbershop");
    });

    it("returns an empty array when no results match", async () => {
      const result = await searchBusinesses("xyznonexistent");
      expect(result).toEqual([]);
    });
  });
});
