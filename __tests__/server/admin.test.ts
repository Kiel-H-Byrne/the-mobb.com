import clientPromise from "@/db/mongodb";
import {
  approveListing,
  autoFindPendingListingAddress,
  checkAdmin,
  deleteMultiplePendingListings,
  getPendingListings,
  rejectListing,
  rejectMultipleListings,
  updatePendingListing,
} from "@app/actions/admin";
import { beforeEach, describe, expect, it } from "vitest";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Resolves the shared MongoDB collection mock from the global setup. */
async function getCollectionMock(collectionName = "listings") {
  const client = await clientPromise;
  const db = client.db("test-db");
  return db.collection(collectionName);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("Admin Server Actions", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY = "fake-api-key";
  });

  // ── Auth Guard ────────────────────────────────────────────────────────────

  describe("checkAdmin", () => {
    it("returns true when the admin cookie is present (mocked to 'true')", async () => {
      const result = await checkAdmin();
      expect(result).toBe(true);
    });
  });

  // ── getPendingListings ────────────────────────────────────────────────────

  describe("getPendingListings", () => {
    it("returns { success: true, data: [] } when no pending listings exist", async () => {
      const res = await getPendingListings();
      expect(res.success).toBe(true);
      expect(res.data).toEqual([]);
    });

    it("serializes ObjectId to string for client components", async () => {
      const fakeDoc = { _id: { toString: () => "abc123" }, name: "Test Biz", status: "PENDING_REVIEW" };
      const collection = await getCollectionMock("pending_listings");
      ((collection as any).toArray as any).mockResolvedValueOnce([fakeDoc]);

      const res = await getPendingListings();
      expect(res.success).toBe(true);
      expect(res.data![0]._id).toBe("abc123");
    });
  });

  // ── approveListing ────────────────────────────────────────────────────────

  describe("approveListing", () => {
    it("geocodes a missing address and inserts with 2dsphere coordinates", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({
          status: "OK",
          results: [
            {
              geometry: { location: { lat: 34.0522, lng: -118.2437 } },
              formatted_address: "123 Test St, Los Angeles, CA 90001",
              place_id: "ChIJtestplace",
            },
          ],
        }),
      });

      const listings = await getCollectionMock("listings");

      const res = await approveListing("64a1b2c3d4e5f60000000000", {
        name: "Test Business",
        address: "123 Test St, Los Angeles, CA",
        category: "Tech",
      });

      expect(res.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("maps.googleapis.com/maps/api/geocode"),
      );
      // ── SNAPSHOT: Live listing insert payload ────────────────────────────────
      // The 2dsphere coordinates shape is critical for geospatial queries.
      // coordinates MUST be [lng, lat] (not [lat, lng]) or all map searches break.
      expect(listings.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Test Business",
          coordinates: {
            type: "Point",
            coordinates: [-118.2437, 34.0522],
          },
        }),
      );
      const insertPayload = (listings.insertOne as any).mock.calls[0][0];
      expect(insertPayload).toMatchSnapshot("approveListing:live-listing-insert");
    });

    it("skips geocoding for online-only listings and does not add coordinates", async () => {
      const listings = await getCollectionMock("listings");

      const res = await approveListing("64a1b2c3d4e5f60000000000", {
        name: "Online Business",
        address: "",
        category: "Service",
        isOnlineOnly: true,
        google_id: "google-123",
        places_details: { rating: 4.9 },
      });

      expect(res.success).toBe(true);
      expect(global.fetch).not.toHaveBeenCalled();
      expect(listings.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Online Business",
          address: "Online Only",
          isOnlineOnly: true,
        }),
      );
      // Coordinates must NOT be set for online-only businesses
      expect(listings.insertOne).not.toHaveBeenCalledWith(
        expect.objectContaining({ coordinates: expect.anything() }),
      );
    });

    it("returns duplicate error when a listing with same name+address exists", async () => {
      const listings = await getCollectionMock("listings");
      (listings.findOne as any).mockResolvedValueOnce({ _id: "existing", name: "Duplicate Biz" });

      const res = await approveListing("64a1b2c3d4e5f60000000000", {
        name: "Duplicate Biz",
        address: "123 Main St",
        locations: [{ address: "123 Main St", lat: 34.0, lng: -118.0 }],
        category: "Food",
      });

      expect(res.success).toBe(false);
      expect(res.error).toContain("Duplicate");
    });

    it("marks the pending listing as APPROVED after inserting into live collection", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({
          status: "OK",
          results: [{ geometry: { location: { lat: 40.7, lng: -74.0 } }, formatted_address: "1 Broadway, NYC" }],
        }),
      });

      const pending = await getCollectionMock("pending_listings");

      await approveListing("64a1b2c3d4e5f60000000000", {
        name: "Harlem Eats",
        address: "1 Broadway, New York",
        category: "Restaurant",
      });

      expect(pending.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ $set: expect.objectContaining({ status: "APPROVED" }) }),
      );
    });
  });

  // ── rejectListing ─────────────────────────────────────────────────────────

  describe("rejectListing", () => {
    it("updates the status to REJECTED", async () => {
      const pending = await getCollectionMock("pending_listings");

      const res = await rejectListing("64a1b2c3d4e5f60000000000");

      expect(res.success).toBe(true);
      expect(pending.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        { $set: { status: "REJECTED" } },
      );
    });
  });

  // ── rejectMultipleListings ────────────────────────────────────────────────

  describe("rejectMultipleListings", () => {
    it("batch-rejects multiple IDs via updateMany", async () => {
      const pending = await getCollectionMock("pending_listings");

      const res = await rejectMultipleListings([
        "64a1b2c3d4e5f60000000001",
        "64a1b2c3d4e5f60000000002",
      ]);

      expect(res.success).toBe(true);
      expect(pending.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ _id: expect.objectContaining({ $in: expect.any(Array) }) }),
        { $set: { status: "REJECTED" } },
      );
    });
  });

  // ── deleteMultiplePendingListings ─────────────────────────────────────────

  describe("deleteMultiplePendingListings", () => {
    it("permanently deletes multiple pending listings via deleteMany", async () => {
      const pending = await getCollectionMock("pending_listings");

      const res = await deleteMultiplePendingListings([
        "64a1b2c3d4e5f60000000001",
        "64a1b2c3d4e5f60000000002",
      ]);

      expect(res.success).toBe(true);
      expect(pending.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({ _id: expect.objectContaining({ $in: expect.any(Array) }) }),
      );
    });
  });

  // ── updatePendingListing ──────────────────────────────────────────────────

  describe("updatePendingListing", () => {
    it("unsets lat/lng and clears locations when marked online-only", async () => {
      const pending = await getCollectionMock("pending_listings");

      const res = await updatePendingListing("64a1b2c3d4e5f60000000000", {
        isOnlineOnly: true,
        lat: 1,
        lng: 2,
        address: ["Online", "Only"],
      });

      expect(res.success).toBe(true);
      expect(pending.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({
            isOnlineOnly: true,
            address: "Online, Only",
            locations: [], // The action explicitly clears locations for online-only
          }),
          $unset: { lat: "", lng: "" },
        }),
      );
      // ── SNAPSHOT: Online-only transition $set/$unset shape ──────────────────
      // Validates that lat/lng are explicitly UNSET (not just zeroed) and
      // locations[] is cleared when a listing is marked as online-only.
      const updateOp = (pending.updateOne as any).mock.calls[0][1];
      expect(updateOp).toMatchInlineSnapshot(`
        {
          "$set": {
            "address": "Online, Only",
            "isOnlineOnly": true,
            "locations": [],
          },
          "$unset": {
            "lat": "",
            "lng": "",
          },
        }
      `);
    });

    it("normalizes an array address to a single string", async () => {
      const pending = await getCollectionMock("pending_listings");

      await updatePendingListing("64a1b2c3d4e5f60000000000", {
        address: ["100 Auburn Ave", "Atlanta", "GA"],
      });

      expect(pending.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({ address: "100 Auburn Ave, Atlanta, GA" }),
        }),
      );
    });

    it("syncs locations[] from address+lat+lng when no locations provided", async () => {
      const pending = await getCollectionMock("pending_listings");

      await updatePendingListing("64a1b2c3d4e5f60000000000", {
        address: "500 MLK Blvd, Houston, TX",
        lat: 29.76,
        lng: -95.36,
      });

      expect(pending.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({
            locations: [{ address: "500 MLK Blvd, Houston, TX", lat: 29.76, lng: -95.36 }],
          }),
        }),
      );
    });
  });

  // ── autoFindPendingListingAddress ─────────────────────────────────────────

  describe("autoFindPendingListingAddress", () => {
    it("returns found:false and marks google_search_found:false when no candidate returned", async () => {
      const pending = await getCollectionMock("pending_listings");
      (pending.findOne as any).mockResolvedValueOnce({ _id: "fakeId", name: "Missing Biz", address: "" });

      // Google Places: no results
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({ status: "ZERO_RESULTS", candidates: [] }),
      });

      const res = await autoFindPendingListingAddress("64a1b2c3d4e5f60000000000");

      expect(res.success).toBe(true);
      expect((res as any).found).toBe(false);
      expect(pending.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({ google_search_found: false, google_search_attempted: true }),
        }),
      );
    });

    it("rejects a match that resolves to a broad geography, not a business", async () => {
      const pending = await getCollectionMock("pending_listings");
      (pending.findOne as any).mockResolvedValueOnce({ _id: "fakeId", name: "Vague Business" });

      // Place is a 'locality' (city), not an establishment
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({
          status: "OK",
          candidates: [{
            formatted_address: "Atlanta, GA, USA",
            place_id: "ChIJCity",
            geometry: { location: { lat: 33.74, lng: -84.38 } },
            types: ["locality", "political"],
          }],
        }),
      });

      const res = await autoFindPendingListingAddress("64a1b2c3d4e5f60000000000");

      expect(res.success).toBe(true);
      expect((res as any).found).toBe(false);
    });

    it("saves updated address, lat, lng and marks google_search_found:true on a valid establishment hit", async () => {
      const pending = await getCollectionMock("pending_listings");
      (pending.findOne as any).mockResolvedValueOnce({ _id: "fakeId", name: "Slutty Vegan", address: "Atlanta" });

      // findplacefromtext returns an establishment
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({
          status: "OK",
          candidates: [{
            formatted_address: "565 Lawton St SW, Atlanta, GA 30310",
            place_id: "ChIJSluVegan",
            geometry: { location: { lat: 33.7390, lng: -84.4190 } },
            types: ["restaurant", "establishment", "point_of_interest"],
          }],
        }),
      });

      // place details response
      (global.fetch as any).mockResolvedValueOnce({
        json: async () => ({
          status: "OK",
          result: {
            address_components: [
              { types: ["street_number"], short_name: "565" },
              { types: ["route"], short_name: "Lawton St SW" },
            ],
            website: "https://slutvegan.com",
            formatted_phone_number: "(404) 555-1234",
          },
        }),
      });

      const res = await autoFindPendingListingAddress("64a1b2c3d4e5f60000000000");

      expect(res.success).toBe(true);
      expect((res as any).found).toBe(true);
      expect(pending.updateOne).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          $set: expect.objectContaining({
            google_search_found: true,
            google_search_attempted: true,
            address: "565 Lawton St SW, Atlanta, GA 30310",
          }),
        }),
      );
      // ── SNAPSHOT: Geocoded address update payload ────────────────────────
      // Captures the full shape of the auto-geocode update so any drift in field
      // names (e.g. google_search_found vs googleSearchFound) is immediately caught.
      const geocodedUpdate = (pending.updateOne as any).mock.calls[0][1];
      expect(geocodedUpdate).toMatchSnapshot("autoFindPendingListingAddress:geocoded-update");
    });
  });
});
