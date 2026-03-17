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

        // Now sanitize pending_listings
        const pendingCol = db.collection("pending_listings");
        const legacyPending = await pendingCol
            .find({
                $or: [
                    { locations: { $exists: false } },
                    { locations: { $size: 0 } },
                ],
            })
            .toArray();

        let pendingMigratedCount = 0;
        let pendingGeocodedCount = 0;

        for (const pending of legacyPending) {
            let finalLocations: any[] = [];
            let addressField = pending.address;

            if (!pending.isOnlineOnly && addressField) {
                let addressStr = "";
                if (Array.isArray(addressField)) {
                    addressStr = addressField.filter(Boolean).join(", ");
                } else if (typeof addressField === "string") {
                    addressStr = addressField;
                }

                if (addressStr) {
                    let lat = pending.lat;
                    let lng = pending.lng;
                    let place_id = pending.place_id || (pending.places_details ? pending.places_details.place_id : undefined);

                    // Attempt to geocode if missing coordinates
                    if (!lat || !lng) {
                        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
                        if (apiKey) {
                            try {
                                const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressStr)}&key=${apiKey}`;
                                const geocodeRes = await fetch(geocodeUrl);
                                const geocodeData = await geocodeRes.json();

                                if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
                                    lat = geocodeData.results[0].geometry.location.lat;
                                    lng = geocodeData.results[0].geometry.location.lng;
                                    place_id = geocodeData.results[0].place_id;
                                    pendingGeocodedCount++;
                                }
                            } catch (err) {
                                console.error("Pending Migration Geocoding Error:", err);
                            }
                        }
                    }

                    finalLocations.push({
                        address: addressStr,
                        lat,
                        lng,
                        place_id
                    });
                }
            }

            await pendingCol.updateOne(
                { _id: pending._id },
                {
                    $set: {
                        locations: finalLocations
                    }
                }
            );
            pendingMigratedCount++;
        }

        return {
            success: true,
            message: `Sanitized Schemas: Migrated ${migratedCount} listings (${geocodedCount} geocoded) and ${pendingMigratedCount} pending listings (${pendingGeocodedCount} geocoded).`,
            migratedCount,
            geocodedCount,
            pendingMigratedCount,
            pendingGeocodedCount
        };
    } catch (error: any) {
        console.error("Migration error:", error);
        return { success: false, error: error.message };
    }
}

export async function deduplicateListingsByName() {
    if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        const listingsCol = db.collection("listings");

        // Aggregation to find listings with the same name (case-insensitive and trimmed)
        const duplicates = await listingsCol.aggregate([
            {
                $group: {
                    _id: { $toLower: { $trim: { input: { $ifNull: ["$name", ""] } } } },
                    docs: { $push: "$$ROOT" },
                    count: { $sum: 1 }
                }
            },
            {
                $match: {
                    count: { $gt: 1 },
                    _id: { $nin: [null, ""] }
                }
            }
        ]).toArray();

        if (duplicates.length === 0) {
            return { success: true, message: "No duplicate listings found by name." };
        }

        let mergedCount = 0;
        let deletedCount = 0;

        for (const group of duplicates) {
            const docs = group.docs;
            // The first listing is kept as the primary
            const primary = docs[0];
            const idsToDelete: any[] = [];
            const mergedLocations: any[] = [];
            const seenLocationKeys = new Set<string>();

            // Helper to add unique location
            const addUniqueLocation = (loc: any) => {
                if (!loc) return;
                
                // Construct a unique key: place_id, or address, or coordinates string
                let key = "";
                if (loc.place_id) {
                    key = loc.place_id;
                } else if (loc.address) {
                    key = loc.address.trim().toLowerCase();
                } else if (loc.coordinates && Array.isArray(loc.coordinates.coordinates)) {
                    key = loc.coordinates.coordinates.join(",");
                } else if (loc.lat && loc.lng) {
                    key = `${loc.lat},${loc.lng}`;
                }

                if (!key) return; // Cannot uniquely identify this location

                if (!seenLocationKeys.has(key)) {
                    seenLocationKeys.add(key);
                    mergedLocations.push(loc);
                }
            };

            for (let i = 0; i < docs.length; i++) {
                const doc = docs[i];
                if (i > 0) {
                    idsToDelete.push(doc._id);
                }

                // If doc has locations array, add them
                if (Array.isArray(doc.locations) && doc.locations.length > 0) {
                    doc.locations.forEach(addUniqueLocation);
                } 
                // Fallback for missing locations array but existing coordinates/address at the root
                else {
                    const fallbackLoc: any = {};
                    if (doc.address) fallbackLoc.address = doc.address;
                    if (doc.coordinates && Array.isArray(doc.coordinates.coordinates)) {
                        fallbackLoc.coordinates = doc.coordinates;
                    }
                    if (doc.places_details?.place_id) {
                        fallbackLoc.place_id = doc.places_details.place_id;
                    }

                    if (fallbackLoc.address || fallbackLoc.coordinates) {
                        addUniqueLocation(fallbackLoc);
                    }
                }
            }

            // Update primary doc with merged locations
            await listingsCol.updateOne(
                { _id: primary._id },
                { $set: { locations: mergedLocations } }
            );

            // Delete the other duplicate docs
            if (idsToDelete.length > 0) {
                await listingsCol.deleteMany({ _id: { $in: idsToDelete } });
                deletedCount += idsToDelete.length;
            }

            mergedCount++;
        }

        return {
            success: true,
            message: `Deduplication complete. Merged ${mergedCount} duplicate groups and deleted ${deletedCount} redundant listings.`,
            mergedCount,
            deletedCount
        };

    } catch (error: any) {
        console.error("Deduplication error:", error);
        return { success: false, error: error.message };
    }
}

export async function sanitizeGeolocations() {
    if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

    try {
        const client = await clientPromise;
        const db = client.db(DB_NAME);
        
        // 1. Sanitize Pending Listings
        const pendingCol = db.collection("pending_listings");
        const pendingCursor = pendingCol.find({ isOnlineOnly: { $ne: true } });
        let pendingUpdated = 0;

        for await (const doc of pendingCursor) {
            let needsUpdate = false;
            let updatedFields: any = {};
            let unsetFields: any = {};

            const addressStr = Array.isArray(doc.address) ? doc.address.join(" ") : (doc.address || "");
            const isMock = ["n/a", "geocoded", "unknown address"].includes(addressStr.toLowerCase().trim());
            // Most valid street addresses have a number. If none, it's highly likely to be purely a city/state match.
            const hasNoNumbers = addressStr ? !/\d/.test(addressStr) : false;
            const isMissingCoords = !doc.lat || !doc.lng;

            if (isMock || hasNoNumbers || isMissingCoords) {
                needsUpdate = true;
                unsetFields.lat = "";
                unsetFields.lng = "";
                unsetFields.places_details = "";
                unsetFields.google_id = "";
                unsetFields.google_search_attempted = "";
                unsetFields.google_search_found = "";
                
                if (isMock) {
                    updatedFields.address = ""; // Clear entirely if it's N/A
                }
            }

            if (doc.locations && Array.isArray(doc.locations)) {
                // Check if existing locations array has bad data
                const validLocations = doc.locations.filter((loc: any) => {
                    const locAddr = loc.address || "";
                    const mock = ["n/a", "geocoded", "unknown address"].includes(locAddr.toLowerCase().trim());
                    const noNums = locAddr ? !/\d/.test(locAddr) : false;
                    const noCoords = !loc.lat || !loc.lng;
                    return !mock && !noNums && !noCoords;
                });

                if (validLocations.length !== doc.locations.length) {
                    needsUpdate = true;
                    if (validLocations.length === 0) {
                        unsetFields.locations = ""; // Clear array if all bad
                    } else {
                        updatedFields.locations = validLocations;
                        delete unsetFields.locations; // prioritize set over unset
                    }
                }
            }

            if (needsUpdate) {
                const updateOp: any = {};
                if (Object.keys(updatedFields).length > 0) updateOp.$set = updatedFields;
                if (Object.keys(unsetFields).length > 0) updateOp.$unset = unsetFields;
                if (updateOp.$set || updateOp.$unset) {
                    await pendingCol.updateOne({ _id: doc._id }, updateOp);
                    pendingUpdated++;
                }
            }
        }

        // 2. Sanitize Approved/Active Listings
        const listingsCol = db.collection("listings");
        const listingsCursor = listingsCol.find({ isOnlineOnly: { $ne: true } });
        let listingsUpdated = 0;

        for await (const doc of listingsCursor) {
            let needsUpdate = false;
            let updatedFields: any = {};
            let unsetFields: any = {};

            const addressStr = doc.address || "";
            const isMock = ["n/a", "geocoded", "unknown address"].includes(addressStr.toLowerCase().trim());
            const hasNoNumbers = addressStr ? !/\d/.test(addressStr) : false;
            const isMissingCoords = !doc.coordinates || !doc.coordinates.coordinates || doc.coordinates.coordinates.length !== 2;

            if (isMock || hasNoNumbers || isMissingCoords) {
                needsUpdate = true;
                unsetFields.coordinates = "";
                unsetFields.type = "";
                unsetFields.places_details = "";
                unsetFields.google_id = "";
                
                if (isMock) {
                    updatedFields.address = ""; 
                }
            }

            if (doc.locations && Array.isArray(doc.locations)) {
                const validLocations = doc.locations.filter((loc: any) => {
                    const locAddr = loc.address || "";
                    const mock = ["n/a", "geocoded", "unknown address"].includes(locAddr.toLowerCase().trim());
                    const noNums = locAddr ? !/\d/.test(locAddr) : false;
                    const noCoords = !loc.coordinates || !loc.coordinates.coordinates || loc.coordinates.coordinates.length !== 2;
                    return !mock && !noNums && !noCoords;
                });

                if (validLocations.length !== doc.locations.length) {
                    needsUpdate = true;
                    if (validLocations.length === 0) {
                        unsetFields.locations = "";
                    } else {
                        updatedFields.locations = validLocations;
                        delete unsetFields.locations;
                    }
                }
            }

            if (needsUpdate) {
                const updateOp: any = {};
                if (Object.keys(updatedFields).length > 0) updateOp.$set = updatedFields;
                if (Object.keys(unsetFields).length > 0) updateOp.$unset = unsetFields;
                if (updateOp.$set || updateOp.$unset) {
                    await listingsCol.updateOne({ _id: doc._id }, updateOp);
                    listingsUpdated++;
                }
            }
        }

        return {
            success: true,
            message: `Sanitized ${pendingUpdated} pending listings and ${listingsUpdated} active listings. Unmapped mock strings, missing coords, and city/state only entries were cleared.`
        };

    } catch (error: any) {
        console.error("Sanitization error:", error);
        return { success: false, error: error.message };
    }
}
