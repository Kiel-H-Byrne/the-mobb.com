"use server";

import { z } from "zod";
import clientPromise from "../../src/db/mongodb";

// We mirror the Listing shape somewhat, but as a pending submission
const SubmitSchema = z.object({
    name: z.string().min(2, "Business name is required"),
    category: z.string().min(2, "Category is required"),
    address: z.string().optional(),
    description: z.string().optional(),
    website: z.string().url().optional().or(z.literal("")),
    isBlackOwned: z.boolean().optional(),
    source: z.enum(["MANUAL", "AI_SCAN"]),
});

export async function submitListing(formData: any) {
    try {
        const data = SubmitSchema.parse(formData);

        const client = await clientPromise;
        const db = client.db("test"); // Assuming "test" or whatever the default DB is. We can use client.db() which uses the default DB from the connection string.

        const pendingCollection = db.collection("pending_listings");
        await pendingCollection.insertOne({
            ...data,
            status: "PENDING_REVIEW",
            createdAt: new Date(),
        });

        console.log("Saved to PENDING_REVIEW queue:", data);

        return { success: true, message: "Listing submitted for review!" };
    } catch (error: any) {
        if (error && error.errors && Array.isArray(error.errors)) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: "An unexpected error occurred." };
    }
}
