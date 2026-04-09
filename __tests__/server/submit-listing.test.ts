import clientPromise from "@/db/mongodb";
import { submitListing } from "@app/actions/submitListing";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ─── Helpers ────────────────────────────────────────────────────────────────

async function getCollectionMock(name = "pending_listings") {
  const client = await clientPromise;
  const db = client.db("vercel-db");
  return db.collection(name);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("submitListing Server Action", () => {
  // Global setup.ts beforeEach handles clearing and mock re-initialization

  // ── Happy path ────────────────────────────────────────────────────────────

  it("saves a valid MANUAL listing to pending_listings with PENDING_REVIEW status", async () => {
    const collection = await getCollectionMock("pending_listings");

    const res = await submitListing({
      name: "King's Barber Shop",
      category: "Barbershop",
      address: "1234 Malcolm X Blvd, Harlem, NY 10037",
      description: "Premium cuts since 1995.",
      website: "https://kingsbarber.com",
      isBlackOwned: true,
      source: "MANUAL",
    });

    expect(res.success).toBe(true);
    expect(res.message).toContain("submitted");

    expect(collection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "King's Barber Shop",
        category: "Barbershop",
        source: "MANUAL",
        status: "PENDING_REVIEW",
      }),
    );
  });

  it("includes the requester IP address in the stored document", async () => {
    const collection = await getCollectionMock("pending_listings");

    await submitListing({
      name: "Tech Noir Studio",
      category: "Tech",
      source: "MANUAL",
    });

    expect(collection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({
        ipAddress: "127.0.0.1", // Value returned by the mocked headers()
      }),
    );
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it("returns { success: false } when name is too short (Zod validation)", async () => {
    const res = await submitListing({
      name: "A", // Too short — minimum 2 chars
      category: "Food",
      source: "MANUAL",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Business name is required/i);
  });

  it("returns { success: false } when category is missing", async () => {
    const res = await submitListing({
      name: "Valid Business Name",
      category: "X", // Too short — minimum 2 chars
      source: "MANUAL",
    });

    expect(res.success).toBe(false);
    expect(res.error).toMatch(/Category is required/i);
  });

  it("returns { success: false } for an invalid website URL", async () => {
    const res = await submitListing({
      name: "Good Business",
      category: "Retail",
      source: "MANUAL",
      website: "not-a-url",
    });

    expect(res.success).toBe(false);
  });

  it("accepts an empty string as a valid website (optional field)", async () => {
    const res = await submitListing({
      name: "Simple Store",
      category: "Retail",
      source: "MANUAL",
      website: "",
    });

    expect(res.success).toBe(true);
  });

  it("accepts an AI_SCAN source", async () => {
    const collection = await getCollectionMock("pending_listings");

    const res = await submitListing({
      name: "Scanned Business",
      category: "Tech",
      source: "AI_SCAN",
    });

    expect(res.success).toBe(true);
    expect(collection.insertOne).toHaveBeenCalledWith(
      expect.objectContaining({ source: "AI_SCAN" }),
    );
  });

  it("rejects an unknown source value", async () => {
    const res = await submitListing({
      name: "Bad Source Biz",
      category: "Retail",
      source: "UNKNOWN_SOURCE",
    });

    expect(res.success).toBe(false);
  });
});
