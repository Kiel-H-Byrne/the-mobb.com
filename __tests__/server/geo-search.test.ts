import clientPromise from "@/db/mongodb";
import {
  countGlobalListings,
  fetchAllCategories,
  fetchCategoryCounts,
  fetchGlobalListings,
  fetchOnlineOnlyListings,
  fetchMapListings,
  findBusinessesNearby,
  geocodeLocation,
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
      ((collection as any).toArray as any).mockRejectedValueOnce(
        new Error("DB connection error"),
      );

      const result = await findBusinessesNearby(0, 0);
      expect(result).toEqual([]);
    });

    it("returns JSON-serializable results (no ObjectId instances)", async () => {
      const collection = await getCollectionMock("listings");
      ((collection as any).toArray as any).mockResolvedValueOnce([
        {
          _id: "507f1f77bcf86cd799439011",
          name: "Soul Bistro",
          coordinates: { type: "Point", coordinates: [-84.3, 33.7] },
        },
      ]);

      const result = await findBusinessesNearby(33.7, -84.3);
      // JSON.parse/stringify used in implementation strips non-serializable types
      expect(() => JSON.stringify(result)).not.toThrow();
      expect(result[0].name).toBe("Soul Bistro");
    });
  });

  // ── fetchMapListings ──────────────────────────────────────────────────────

  describe("fetchMapListings", () => {
    it("loads every mappable listing (coordinates, not online-only) with no limit", async () => {
      const collection = await getCollectionMock("listings");

      await fetchMapListings();

      expect(collection.find).toHaveBeenCalledWith({
        isOnlineOnly: { $ne: true },
        $or: [
          { "coordinates.coordinates.1": { $exists: true } },
          { "locations.coordinates.coordinates.1": { $exists: true } },
        ],
      });
      expect((collection as any).limit).not.toHaveBeenCalled();
    });

    it("projects only the fields the map renders", async () => {
      const collection = await getCollectionMock("listings");

      await fetchMapListings();

      const projection = (collection as any).project.mock.calls[0][0];
      expect(projection).toMatchObject({
        name: 1,
        coordinates: 1,
        categories: 1,
      });
      expect(projection).not.toHaveProperty("places_details");
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

      expect(collection.find).toHaveBeenCalledWith({ isOnlineOnly: { $ne: true } });
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

  describe("fetchGlobalListings — Uncategorized", () => {
    it("matches listings tagged 'Uncategorized' or with no categories", async () => {
      const collection = await getCollectionMock("listings");

      await fetchGlobalListings(1, 20, ["Tech", "Uncategorized"]);

      expect(collection.find).toHaveBeenCalledWith({
        isOnlineOnly: { $ne: true },
        $or: [
          { categories: { $in: ["Tech", "Uncategorized"] } },
          { categories: { $exists: false } },
          { categories: { $size: 0 } },
        ],
      });
    });
  });

  // ── countGlobalListings ───────────────────────────────────────────────────

  describe("countGlobalListings", () => {
    it("counts with the same category filter used for paging", async () => {
      const collection = await getCollectionMock("listings");
      (collection as any).countDocuments.mockResolvedValueOnce(42);

      const total = await countGlobalListings(["Retail"]);

      expect(total).toBe(42);
      expect((collection as any).countDocuments).toHaveBeenCalledWith({
        isOnlineOnly: { $ne: true },
        categories: { $in: ["Retail"] },
      });
    });
  });

  describe("global scope", () => {
    it("excludes online-only listings from the global directory", async () => {
      const collection = await getCollectionMock("listings");

      await fetchCategoryCounts();

      expect((collection as any).aggregate.mock.calls[0][0][0]).toEqual({
        $match: { isOnlineOnly: { $ne: true } },
      });
    });
  });

  describe("online scope", () => {
    it("counts only online-only listings in the online scope", async () => {
      const collection = await getCollectionMock("listings");

      await countGlobalListings(["Retail"], "online");

      expect((collection as any).countDocuments).toHaveBeenCalledWith({
        isOnlineOnly: true,
        categories: { $in: ["Retail"] },
      });
    });

    it("restricts category counts to online-only listings", async () => {
      const collection = await getCollectionMock("listings");

      await fetchCategoryCounts("online");

      expect((collection as any).aggregate.mock.calls[0][0][0]).toEqual({
        $match: { isOnlineOnly: true },
      });
    });
  });

  describe("location filter", () => {
    const chicago = {
      kind: "radius" as const,
      lat: 41.88,
      lng: -87.63,
      miles: 25,
      label: "Chicago, IL",
    };

    it("pages radius searches nearest-first with $nearSphere and no _id sort", async () => {
      const collection = await getCollectionMock("listings");

      await fetchGlobalListings(1, 24, [], chicago);

      expect(collection.find).toHaveBeenCalledWith({
        isOnlineOnly: { $ne: true },
        coordinates: {
          $nearSphere: {
            $geometry: { type: "Point", coordinates: [-87.63, 41.88] },
            $maxDistance: 25 * 1609.344,
          },
        },
      });
      expect((collection as any).sort).not.toHaveBeenCalled();
    });

    it("counts radius searches with $geoWithin (countDocuments can't use $near)", async () => {
      const collection = await getCollectionMock("listings");

      await countGlobalListings(["Retail"], "all", chicago);

      expect((collection as any).countDocuments).toHaveBeenCalledWith({
        isOnlineOnly: { $ne: true },
        categories: { $in: ["Retail"] },
        coordinates: {
          $geoWithin: { $centerSphere: [[-87.63, 41.88], 25 / 3963.2] },
        },
      });
    });

    it("limits a state to its bounds and to addresses naming the state", async () => {
      const collection = await getCollectionMock("listings");

      await countGlobalListings(["Uncategorized"], "all", {
        kind: "region",
        label: "Georgia",
        bounds: { north: 35, south: 30, east: -80, west: -86 },
        names: ["GA", "Georgia"],
      });

      const query = (collection as any).countDocuments.mock.calls[0][0];
      // Both the Uncategorized and state clauses use $or, so they're ANDed.
      expect(query.$or).toBeDefined();
      expect(query.$and).toHaveLength(1);
      const stateRegex = query.$and[0].$or[0].address as RegExp;
      expect(stateRegex.test("12 Peachtree St, Atlanta, GA 30303")).toBe(true);
      expect(stateRegex.test("688 Albright Rd, Rock Hill, SC 29730")).toBe(
        false,
      );
      expect(query.coordinates.$geoWithin.$geometry.type).toBe("Polygon");
    });

    it("ignores malformed locations from the client", async () => {
      const collection = await getCollectionMock("listings");

      await countGlobalListings([], "all", { kind: "radius", lat: 999 } as any);

      expect((collection as any).countDocuments).toHaveBeenCalledWith({
        isOnlineOnly: { $ne: true },
      });
    });
  });

  describe("geocodeLocation", () => {
    it("returns a state as a region with its names", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({
          status: "OK",
          results: [
            {
              formatted_address: "Georgia, USA",
              types: ["administrative_area_level_1", "political"],
              address_components: [
                {
                  short_name: "GA",
                  long_name: "Georgia",
                  types: ["administrative_area_level_1", "political"],
                },
              ],
              geometry: {
                location: { lat: 32.1, lng: -82.9 },
                viewport: {
                  northeast: { lat: 35, lng: -80.8 },
                  southwest: { lat: 30.4, lng: -85.6 },
                },
              },
            },
          ],
        }),
      });
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY = "fake-key";

      const place = await geocodeLocation("  Georgia ");

      expect(place).toEqual({
        label: "Georgia",
        lat: 32.1,
        lng: -82.9,
        bounds: { north: 35, south: 30.4, east: -80.8, west: -85.6 },
        isRegion: true,
        regionNames: ["GA", "Georgia"],
      });
    });

    it("returns null for no results or too-short input", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ status: "ZERO_RESULTS", results: [] }),
      });
      process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY = "fake-key";

      expect(await geocodeLocation("asdfqwer")).toBeNull();
      expect(await geocodeLocation("a")).toBeNull();
    });
  });

  // ── fetchCategoryCounts ───────────────────────────────────────────────────

  describe("fetchCategoryCounts", () => {
    it("returns categories sorted by count, with Uncategorized covering tagged and empty listings", async () => {
      const collection = await getCollectionMock("listings");
      ((collection as any).toArray as any).mockResolvedValueOnce([
        { _id: "Tech", count: 3 },
        { _id: "Uncategorized", count: 2 },
        { _id: "Retail", count: 5 },
      ]);
      // countDocuments covers literal "Uncategorized" + missing/empty categories
      (collection as any).countDocuments.mockResolvedValueOnce(4);

      const counts = await fetchCategoryCounts();

      expect(counts).toEqual([
        { name: "Retail", count: 5 },
        { name: "Uncategorized", count: 4 },
        { name: "Tech", count: 3 },
      ]);
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
    it("searches the whole collection by name, category, or address", async () => {
      const collection = await getCollectionMock("listings");

      await searchBusinesses("  Wakanda ");

      const query = (collection.find as any).mock.calls[0][0];
      expect(query.$or.map((c: any) => Object.keys(c)[0])).toEqual([
        "name",
        "categories",
        "address",
      ]);
      expect((query.$or[0].name as RegExp).test("wakanda cuts")).toBe(true);
    });

    it("ranks name prefix > word in name > category > address", async () => {
      const collection = await getCollectionMock("listings");
      ((collection as any).toArray as any).mockResolvedValueOnce([
        { name: "Corner Store", address: "1 Cuts Ave" },
        { name: "Best Cuts Barbershop" },
        { name: "Hair Lab", categories: ["Cuts & Styling"] },
        { name: "Cuts by Dre" },
      ]);

      const results = await searchBusinesses("cuts");

      expect(results.map((r) => r.name)).toEqual([
        "Cuts by Dre",
        "Best Cuts Barbershop",
        "Hair Lab",
        "Corner Store",
      ]);
    });

    it("escapes regex characters in the query", async () => {
      const collection = await getCollectionMock("listings");

      await searchBusinesses("A+ Tutors (DC)");

      const pattern = (collection.find as any).mock.calls[0][0].$or[0]
        .name as RegExp;
      expect(pattern.test("a+ tutors (dc) llc")).toBe(true);
    });

    it("returns an empty array for no matches or too-short input", async () => {
      expect(await searchBusinesses("xyznonexistent")).toEqual([]);
      expect(await searchBusinesses("a")).toEqual([]);
    });
  });
});
