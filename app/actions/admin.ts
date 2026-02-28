"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

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
        const db = client.db(DB_NAME);
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
        const db = client.db(DB_NAME);

        // Fetch Google Geocoding before inserting
        let finalLat = finalizedData.lat;
        let finalLng = finalizedData.lng;

        if (!finalLat || !finalLng) {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
            if (apiKey && finalizedData.address) {
                try {
                    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(finalizedData.address)}&key=${apiKey}`;
                    const geocodeRes = await fetch(geocodeUrl);
                    const geocodeData = await geocodeRes.json();

                    if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
                        finalLat = geocodeData.results[0].geometry.location.lat;
                        finalLng = geocodeData.results[0].geometry.location.lng;
                    } else {
                        console.warn("Geocoding could not locate address:", geocodeData);
                    }
                } catch (geocodeErr) {
                    console.error("Geocoding fetch error:", geocodeErr);
                }
            }
        }

        const safeAddress = finalizedData.address || "Unknown Address";

        // 0. Duplicate Check
        const existingDuplicate = await db.collection("listings").findOne({
            name: finalizedData.name,
            address: safeAddress
        });

        if (existingDuplicate) {
            return { success: false, error: "Duplicate listing found: A business with this Exact Name and Address already exists." };
        }

        // 1. Move to "listings" collection. Ensure Coordinates are 2dsphere!
        const newListing = {
            name: finalizedData.name,
            address: safeAddress,
            city: finalizedData.city || "",
            categories: [finalizedData.category],
            url: finalizedData.website,
            description: finalizedData.description,
            claims: [],
            creator: new Date(),
            submitted: new Date(),
        };

        // Note: To use $near, the coordinates MUST be [lng, lat] format precisely
        if (finalLat && finalLng) {
            (newListing as any).coordinates = {
                type: "Point",
                coordinates: [Number(finalLng), Number(finalLat)]
            };
            (newListing as any).type = "Point";
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
        const db = client.db(DB_NAME);

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

export async function updatePendingListing(id: string, updatedData: any) {
    if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);

        // Remove _id from updatedData if present to avoid updating immutable field
        const { _id, ...safeData } = updatedData;

        // Ensure lat/lng are formatted properly
        if (safeData.lat && safeData.lng) {
            safeData.lat = Number(safeData.lat);
            safeData.lng = Number(safeData.lng);
        }

        await db.collection("pending_listings").updateOne(
            { _id: new ObjectId(id) },
            { $set: safeData }
        );

        revalidatePath("/admin/reviews");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { success: false, error: "Update failed." };
    }
}
