// app/actions/feedback.ts
"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
import { Listing, ListingReport, ReportReason } from "@/db/Types";
import { getCurrentUser } from "@app/actions/user-auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const DELIST_THRESHOLD = 3;

const SubmitReportSchema = z.object({
  listingId: z.string().min(1, "Listing ID is required"),
  reason: z.enum([
    "CLOSED",
    "INCORRECT_ADDRESS",
    "NOT_BLACK_OWNED",
    "WRONG_CONTACT",
    "OTHER",
  ]),
  comment: z.string().max(500, "Comment cannot exceed 500 characters").optional(),
});

export async function submitListingReport(input: {
  listingId: string;
  reason: ReportReason;
  comment?: string;
}) {
  // 1. Strict Auth Guard: Only registered & logged-in users can report/delist
  const user = await getCurrentUser();
  if (!user || !user.id) {
    return {
      success: false,
      requiresAuth: true,
      error: "Only registered and logged-in users can report inaccuracies. Please sign in or create an account.",
    };
  }

  // 2. Validate input schema
  const parsed = SubmitReportSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid report data.",
    };
  }

  const { listingId, reason, comment } = parsed.data;

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const listingsCollection = db.collection<Listing>("listings");
    const reportsCollection = db.collection<ListingReport>("listing_reports");

    // Resolve ObjectId or string fallback
    let queryId: any;
    try {
      queryId = new ObjectId(listingId);
    } catch {
      queryId = listingId;
    }

    const listing = await listingsCollection.findOne({
      $or: [{ _id: queryId }, { _id: listingId }],
    });

    if (!listing) {
      return { success: false, error: "Listing not found in database." };
    }

    // 3. Unique user check: prevent duplicate reporting by the same registered user
    const currentDeverifiers: string[] = Array.isArray(listing.deverifiers)
      ? listing.deverifiers
      : [];

    if (currentDeverifiers.includes(user.id)) {
      return {
        success: false,
        alreadyReported: true,
        error: "You have already submitted feedback for this listing. Thank you for contributing!",
      };
    }

    // 4. Create detailed audit report entry
    const newReport: ListingReport = {
      listingId: String(listing._id),
      listingName: listing.name,
      userId: user.id,
      userEmail: user.email,
      reason,
      comment: comment?.trim() || undefined,
      createdAt: new Date(),
      status: "PENDING",
    };
    await reportsCollection.insertOne(newReport);

    // 5. Atomic listing update: track unique userId in deverifiers
    const newDeverifierCount = currentDeverifiers.length + 1;
    const isNowDelisted = newDeverifierCount >= DELIST_THRESHOLD;

    const updateDoc: any = {
      $addToSet: { deverifiers: user.id },
      $set: {
        deverifierCount: newDeverifierCount,
        lastReportedAt: new Date(),
      },
    };

    if (isNowDelisted) {
      updateDoc.$set.isDelisted = true;
      updateDoc.$set.delistedAt = new Date();
      console.warn(
        `🚨 Listing "${listing.name}" has reached ${newDeverifierCount} unique user reports and is now DELISTED (hidden from map).`,
      );
    }

    await listingsCollection.updateOne({ _id: listing._id }, updateDoc);

    // 6. Invalidate caches so public map and admin reviews immediately reflect state
    revalidatePath("/");
    revalidatePath("/admin/reviews");

    return {
      success: true,
      isDelisted: isNowDelisted,
      deverifierCount: newDeverifierCount,
      threshold: DELIST_THRESHOLD,
    };
  } catch (error: any) {
    console.error("Submit listing report error:", error);
    return {
      success: false,
      error: "An error occurred while submitting feedback. Please try again.",
    };
  }
}
