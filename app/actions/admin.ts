"use server";

import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import clientPromise from "../../src/db/mongodb";

// Temporary Simple Auth Mock
import { cookies } from "next/headers";

export async function checkAdmin() {
    const cookieStore = await cookies();
    const isAdmin = cookieStore.get("mobb_admin_token");
    if (!isAdmin || isAdmin.value !== "true") {
        return false;
    }
    return true;
}

export async function loginAdmin(password: string) {
    // Simple env password for MVP protection, or fallback to 'admin'
    const validPassword = process.env.ADMIN_PASSWORD || "mobbadmin123";
    if (password === validPassword) {
        (await cookies()).set("mobb_admin_token", "true", { httpOnly: true, secure: true, path: "/" });
        return { success: true };
    }
    return { success: false, error: "Invalid password" };
}

export async function logoutAdmin() {
    (await cookies()).delete("mobb_admin_token");
    revalidatePath("/admin/reviews");
}

export async function getPendingListings() {
    if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

    try {
        const client = await clientPromise;
        const db = client.db("test");
        const listings = await db.collection("pending_listings").find({ status: "PENDING_REVIEW" }).sort({ createdAt: -1 }).toArray();

        // Convert ObjectId to string for Client Components
        const serialized = listings.map((l: any) => ({
            ...l,
            _id: l._id.toString()
        }));

        return { success: true, data: serialized };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Failed to fetch pending listings" };
    }
}

export async function approveListing(id: string, finalizedData: any) {
    if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

    try {
        const client = await clientPromise;
        const db = client.db("test");

        // 1. Move to "listings" colletion. Ensure Coordinates are 2dsphere!
        const newListing = {
            name: finalizedData.name,
            address: finalizedData.address || "Unknown Address",
            city: finalizedData.city || "",
            categories: [finalizedData.category],
            url: finalizedData.website,
            description: finalizedData.description,
            claims: [],
            creator: new Date(),
            submitted: new Date(),
        };

        // Note: To use $near, the coordinates MUST be [lng, lat] format precisely
        if (finalizedData.lat && finalizedData.lng) {
            (newListing as any).coordinates = {
                type: "Point",
                coordinates: [Number(finalizedData.lng), Number(finalizedData.lat)]
            };
            (newListing as any).type = "Point";
            // Temporary backward compatible schema mapping for existing Mobb
        }

        await db.collection("listings").insertOne(newListing);

        // 2. Mark as APPROVED in pending_listings
        await db.collection("pending_listings").updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: "APPROVED" } }
        );

        revalidatePath("/admin/reviews");
        revalidatePath("/");

        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Approval failed." };
    }
}

export async function rejectListing(id: string) {
    if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

    try {
        const client = await clientPromise;
        const db = client.db("test");

        await db.collection("pending_listings").updateOne(
            { _id: new ObjectId(id) },
            { $set: { status: "REJECTED" } }
        );

        revalidatePath("/admin/reviews");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Rejection failed." };
    }
}
