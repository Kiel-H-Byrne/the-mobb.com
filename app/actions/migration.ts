"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
import { checkAdmin } from "./admin";

export async function migrateLegacyListings() {
    if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const listingsCol = db.collection("listings");

        // Find listings where locations array is either missing or empty
        const legacyListings = await listingsCol
            .find({
                $or: [
                    { locations: { $exists: false } },
                    { locations: { $size: 0 } },
                ],
            })
            .toArray();

        if (legacyListings.length === 0) {
            return { success: true, message: "No legacy listings found to migrate." };
        }

        let migratedCount = 0;
        let geocodedCount = 0;

        for (const listing of legacyListings) {
            let finalLocations: any[] = [];
            const address = listing.address;

            if (!listing.isOnlineOnly && address && typeof address === "string") {
                let lat, lng;

                // Use existing coordinates if they exist
                if (
                    listing.coordinates &&
                    listing.coordinates.coordinates &&
                    listing.coordinates.coordinates.length === 2
                ) {
                    lng = listing.coordinates.coordinates[0];
                    lat = listing.coordinates.coordinates[1];
                } else {
                    // Attempt to geocode
                    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
                    if (apiKey) {
                        try {
                            const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
                            const geocodeRes = await fetch(geocodeUrl);
                            const geocodeData = await geocodeRes.json();

                            if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
                                lat = geocodeData.results[0].geometry.location.lat;
                                lng = geocodeData.results[0].geometry.location.lng;
                                geocodedCount++;
                            }
                        } catch (err) {
                            console.error("Migration Geocoding Error:", err);
                        }
                    }
                }

                if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
                    finalLocations.push({
                        address,
                        coordinates: {
                            type: "Point",
                            coordinates: [Number(lng), Number(lat)]
                        }
                    });
                }
            }

            await listingsCol.updateOne(
                { _id: listing._id },
                {
                    $set: {
                        locations: finalLocations
                    }
                }
            );
            migratedCount++;
        }

        return {
            success: true,
            message: `Migrated ${migratedCount} legacy listings to multi-location array format. Automatically geocoded ${geocodedCount} missing coordinates.`,
            migratedCount,
            geocodedCount
        };
    } catch (error: any) {
        console.error("Migration error:", error);
        return { success: false, error: error.message };
    }
}
