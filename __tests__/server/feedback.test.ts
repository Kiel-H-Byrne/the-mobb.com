import clientPromise from "@/db/mongodb";
import { submitListingReport } from "@app/actions/feedback";
import * as userAuth from "@app/actions/user-auth";
import { beforeEach, describe, expect, it, vi } from "vitest";

async function getCollectionMock(name: string) {
  const client = await clientPromise;
  const db = client.db("test-db");
  return db.collection(name);
}

describe("Crowdsourced Listing Feedback & Delisting", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects report submission when user is not authenticated", async () => {
    vi.spyOn(userAuth, "getCurrentUser").mockResolvedValueOnce(null);

    const result = await submitListingReport({
      listingId: "507f1f77bcf86cd799439011",
      reason: "CLOSED",
      comment: "Store is boarded up",
    });

    expect(result.success).toBe(false);
    expect(result.requiresAuth).toBe(true);
    expect(result.error).toContain("registered and logged-in users");
  });

  it("successfully records report and updates deverifiers for authenticated user", async () => {
    vi.spyOn(userAuth, "getCurrentUser").mockResolvedValueOnce({
      id: "user-123",
      email: "member@example.com",
      name: "Marcus",
      role: "USER",
    });

    const listingsCol = await getCollectionMock("listings");
    (listingsCol.findOne as any).mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      name: "Harlem Roast Cafe",
      deverifiers: [],
      deverifierCount: 0,
    });

    const result = await submitListingReport({
      listingId: "507f1f77bcf86cd799439011",
      reason: "INCORRECT_ADDRESS",
      comment: "Moved to 125th St",
    });

    expect(result.success).toBe(true);
    expect(result.isDelisted).toBe(false);
    expect(result.deverifierCount).toBe(1);

    expect(listingsCol.updateOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        $addToSet: { deverifiers: "user-123" },
      }),
    );
  });

  it("prevents duplicate reporting by the same user", async () => {
    vi.spyOn(userAuth, "getCurrentUser").mockResolvedValueOnce({
      id: "user-123",
      email: "member@example.com",
      role: "USER",
    });

    const listingsCol = await getCollectionMock("listings");
    (listingsCol.findOne as any).mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      name: "Harlem Roast Cafe",
      deverifiers: ["user-123"],
      deverifierCount: 1,
    });

    const result = await submitListingReport({
      listingId: "507f1f77bcf86cd799439011",
      reason: "CLOSED",
    });

    expect(result.success).toBe(false);
    expect(result.alreadyReported).toBe(true);
    expect(result.error).toContain("already submitted feedback");
  });

  it("automatically delists business upon reaching 3 unique registered user reports", async () => {
    vi.spyOn(userAuth, "getCurrentUser").mockResolvedValueOnce({
      id: "user-789",
      email: "third@example.com",
      role: "USER",
    });

    const listingsCol = await getCollectionMock("listings");
    (listingsCol.findOne as any).mockResolvedValueOnce({
      _id: "507f1f77bcf86cd799439011",
      name: "Harlem Roast Cafe",
      deverifiers: ["user-123", "user-456"],
      deverifierCount: 2,
    });

    const result = await submitListingReport({
      listingId: "507f1f77bcf86cd799439011",
      reason: "CLOSED",
    });

    expect(result.success).toBe(true);
    expect(result.isDelisted).toBe(true);
    expect(result.deverifierCount).toBe(3);

    expect(listingsCol.updateOne).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        $set: expect.objectContaining({
          isDelisted: true,
        }),
      }),
    );
  });
});
