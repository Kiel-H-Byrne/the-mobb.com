"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
import { fetchLinkPreview } from "@/util/linkPreview";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// Temporary Simple Auth Mock
import { cookies } from "next/headers";

function normalizeAddress(address: any) {
  if (Array.isArray(address)) {
    return address.filter(Boolean).join(", ").trim();
  }

  if (typeof address === "string") {
    return address.trim();
  }

  return "";
}

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
    (await cookies()).set("mobb_admin_token", "true", {
      httpOnly: true,
      secure: true,
      path: "/",
    });
    return { success: true };
  }
  return { success: false, error: "Invalid password" };
}

export async function logoutAdmin() {
  (await cookies()).delete("mobb_admin_token");
  revalidatePath("/admin/reviews");
}

export async function clearPendingListingGeolocation(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Unset all geocode-related fields
    await db.collection("pending_listings").updateOne(
      { _id: new ObjectId(id) },
      {
        $unset: {
          lat: "",
          lng: "",
          places_details: "",
          google_id: "",
          google_search_attempted: "",
          google_search_found: "",
          locations: "",
        },
      },
    );

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error: any) {
    console.error("Clear geocode failed:", error);
    return { success: false, error: "Failed to clear geocoding data" };
  }
}

export async function getPendingListings() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const listings = await db
      .collection("pending_listings")
      .find({ status: "PENDING_REVIEW" })
      .sort({ createdAt: -1 })
      .toArray();

    // Convert ObjectId to string for Client Components
    const serialized = listings.map((l: any) => ({
      ...l,
      _id: l._id.toString(),
    }));

    return { success: true, data: serialized };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch pending listings" };
  }
}

export async function sanitizePendingListings() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // 1. Identify listings in 'pending_listings' marked as APPROVED but missing from 'listings'
    const approvedInPending = await db
      .collection("pending_listings")
      .find({ status: "APPROVED" })
      .toArray();

    let resetCount = 0;
    for (const p of approvedInPending) {
      const existsInLive = await db
        .collection("listings")
        .findOne({ name: p.name });

      if (!existsInLive) {
        // Reset to PENDING_REVIEW so it appears in the dashboard
        await db
          .collection("pending_listings")
          .updateOne({ _id: p._id }, { $set: { status: "PENDING_REVIEW" } });
        resetCount++;
      }
    }

    revalidatePath("/admin/reviews");
    return { success: true, count: resetCount };
  } catch (error) {
    console.error("Sanitize failed:", error);
    return { success: false, error: "Sanitization failed." };
  }
}

export async function approveListing(id: string, finalizedData: any) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const isOnlineOnly = Boolean(finalizedData.isOnlineOnly);

    let sourceLocations = finalizedData.locations;
    if (!sourceLocations || !Array.isArray(sourceLocations)) {
      sourceLocations = [];
      const normalizedAddress = normalizeAddress(finalizedData.address);
      if (normalizedAddress) {
        sourceLocations.push({
          address: normalizedAddress,
          lat: finalizedData.lat,
          lng: finalizedData.lng,
        });
      }
    }

    const finalLocations: any[] = [];
    if (!isOnlineOnly) {
      for (const loc of sourceLocations) {
        let lat = loc.lat;
        let lng = loc.lng;
        let formattedAddress = loc.address;
        let place_id = loc.place_id;

        // Geocode if missing lat/lng
        if (!lat || !lng) {
          const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
          if (apiKey && formattedAddress) {
            try {
              const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(formattedAddress)}&key=${apiKey}`;
              const geocodeRes = await fetch(geocodeUrl);
              const geocodeData = await geocodeRes.json();

              if (
                geocodeData.status === "OK" &&
                geocodeData.results.length > 0
              ) {
                const bestMatch = geocodeData.results[0];
                lat = bestMatch.geometry.location.lat;
                lng = bestMatch.geometry.location.lng;
                place_id = bestMatch.place_id;
                formattedAddress =
                  bestMatch.formatted_address || formattedAddress;
              }
            } catch (err) {
              console.error("Geocoding fetch error:", err);
            }
          }
        }

        if (Number.isFinite(Number(lat)) && Number.isFinite(Number(lng))) {
          finalLocations.push({
            address: formattedAddress,
            place_id,
            coordinates: {
              type: "Point",
              coordinates: [Number(lng), Number(lat)],
            },
          });
        }
      }
    }

    const safeAddress =
      finalLocations.length > 0
        ? finalLocations[0].address
        : isOnlineOnly
          ? "Online Only"
          : "Unknown Address";

    // Fetch OpenGraph metadata if website exists
    let ogData = null;
    if (finalizedData.website) {
      ogData = await fetchLinkPreview(finalizedData.website);
    }

    // 0. Duplicate Check
    const existingDuplicate = await db.collection("listings").findOne({
      name: finalizedData.name,
      address: safeAddress,
    });

    if (existingDuplicate) {
      return {
        success: false,
        error:
          "Duplicate listing found: A business with this Exact Name and Address already exists.",
      };
    }

    // 1. Move to "listings" collection. Ensure Coordinates are 2dsphere!
    const newListing = {
      name: finalizedData.name,
      address: safeAddress,
      locations: finalLocations,
      city: finalizedData.city || "",
      categories: [finalizedData.category],
      url: finalizedData.website,
      phone: finalizedData.phone,
      description: finalizedData.description,
      google_id: finalizedData.google_id,
      places_details: finalizedData.places_details,
      isOnlineOnly,
      claims: [],
      creator: new Date(),
      submitted: new Date(),
      og_title: ogData?.title,
      og_description: ogData?.description,
      og_image: ogData?.image,
    };

    // Note: Legacy coordinates support for the first location to satisfy existing $near queries
    if (finalLocations.length > 0) {
      (newListing as any).coordinates = finalLocations[0].coordinates;
      (newListing as any).type = "Point";
    }

    await db.collection("listings").insertOne(newListing);

    // 2. Mark as APPROVED in pending_listings
    await db
      .collection("pending_listings")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { status: "APPROVED", approvedAt: new Date() } },
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

    await db
      .collection("pending_listings")
      .updateOne({ _id: new ObjectId(id) }, { $set: { status: "REJECTED" } });

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Rejection failed." };
  }
}

export async function rejectMultipleListings(ids: string[]) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const objectIds = ids.map((id) => new ObjectId(id));
    await db
      .collection("pending_listings")
      .updateMany(
        { _id: { $in: objectIds } },
        { $set: { status: "REJECTED" } },
      );

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Batch rejection failed." };
  }
}

export async function deleteMultiplePendingListings(ids: string[]) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const objectIds = ids.map((id) => new ObjectId(id));
    await db
      .collection("pending_listings")
      .deleteMany({ _id: { $in: objectIds } });

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Batch deletion failed." };
  }
}

export async function updatePendingListing(id: string, updatedData: any) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Remove _id from updatedData if present to avoid updating immutable field
    const { _id, ...safeData } = updatedData;
    const unsetData: Record<string, ""> = {};

    if ("address" in safeData) {
      safeData.address = normalizeAddress(safeData.address);
    }

    const hasLat =
      safeData.lat !== undefined &&
      safeData.lat !== null &&
      safeData.lat !== "";
    const hasLng =
      safeData.lng !== undefined &&
      safeData.lng !== null &&
      safeData.lng !== "";

    // Ensure lat/lng are formatted properly
    if (hasLat && hasLng) {
      safeData.lat = Number(safeData.lat);
      safeData.lng = Number(safeData.lng);
    } else {
      delete safeData.lat;
      delete safeData.lng;

      if ("lat" in updatedData) unsetData.lat = "";
      if ("lng" in updatedData) unsetData.lng = "";
    }

    if (safeData.isOnlineOnly) {
      delete safeData.lat;
      delete safeData.lng;
      safeData.locations = [];
      unsetData.lat = "";
      unsetData.lng = "";
    }

    // Sync root coordinates/address to the primary locations array so UI renders correctly for overrides
    if (
      !safeData.isOnlineOnly &&
      safeData.address &&
      hasLat &&
      hasLng &&
      !safeData.locations
    ) {
      safeData.locations = [
        {
          address: safeData.address,
          lat: safeData.lat,
          lng: safeData.lng,
        },
      ];
    }

    const updateOperation: Record<string, any> = { $set: safeData };

    if (Object.keys(unsetData).length > 0) {
      updateOperation.$unset = unsetData;
    }

    await db
      .collection("pending_listings")
      .updateOne({ _id: new ObjectId(id) }, updateOperation);

    revalidatePath("/admin/reviews");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Update failed." };
  }
}

export async function manuallyRunScout() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  try {
    const res = await fetch(`${baseUrl}/api/cron/scout`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${process.env.CRON_SECRET || ""}`,
      },
    });

    // We try to parse the JSON response from the scout cron API
    const data = await res.json();
    revalidatePath("/admin/reviews");
    return data;
  } catch (error: any) {
    console.error("Manual scout trigger failed:", error);
    return {
      success: false,
      error: error.message || "Failed to trigger scout API.",
    };
  }
}

export async function getWeeklyApprovedStats() {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    // Get the start of the week (Sunday at midnight)
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const stats = await db
      .collection("pending_listings")
      .aggregate([
        {
          $match: {
            status: "APPROVED",
            $or: [
              { approvedAt: { $gte: startOfWeek } },
              {
                approvedAt: { $exists: false },
                createdAt: { $gte: startOfWeek },
              },
            ],
          },
        },
        {
          $group: {
            _id: "$source", // Group by AI_SCAN vs MANUAL
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    // Reformat into a simple object { AI_SCAN: 10, MANUAL: 5 }
    const formattedStats = stats.reduce(
      (acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      success: true,
      data: {
        total: stats.reduce((sum, curr) => sum + curr.count, 0),
        aiScanned: formattedStats["AI_SCAN"] || 0,
        manual: formattedStats["MANUAL"] || 0,
        startOfWeek,
      },
    };
  } catch (error) {
    console.error(error);
    return { success: false, error: "Failed to fetch stats" };
  }
}

export async function autoFindPendingListingAddress(id: string) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const listing = await db
      .collection("pending_listings")
      .findOne({ _id: new ObjectId(id) });
    if (!listing) return { success: false, error: "Listing not found" };

    const addressString = normalizeAddress(listing.address);
    // Include the address (e.g. city/state) in the query to improve accuracy
    const query = encodeURIComponent(
      [listing.name, addressString].filter(Boolean).join(" "),
    );
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
    if (!apiKey)
      return { success: false, error: "No Google Maps API key configured" };

    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${query}&inputtype=textquery&fields=place_id,formatted_address,geometry,name,types&key=${apiKey}`;
    const res = await fetch(searchUrl);
    const data = await res.json();

    if (data.status === "OK" && data.candidates && data.candidates.length > 0) {
      const match = data.candidates[0]; // Take best match
      const place_id = match.place_id;
      const address = match.formatted_address;
      const lat = match.geometry?.location?.lat;
      const lng = match.geometry?.location?.lng;

      // Ensure we have a valid place ID + address
      if (address && place_id) {
        // Reject if it's purely a geographic region (like a city/state match) and not an actual business
        const isEstablishment =
          match.types &&
          (match.types.includes("establishment") ||
            match.types.includes("point_of_interest"));
        if (!isEstablishment) {
          await db.collection("pending_listings").updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                google_search_attempted: true,
                google_search_found: false,
              },
            },
          );
          revalidatePath("/admin/reviews");
          return {
            success: true,
            found: false,
            error:
              "Match was a general geography, not a business establishment.",
          };
        }

        // Now fetch full place details for phone/website using Places Details API
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=website,formatted_phone_number,address_components&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        // Ensure new result has a street address, not just city/state
        const addressComponents = detailsData.result?.address_components || [];
        const hasStreet = addressComponents.some(
          (c: any) =>
            c.types.includes("route") ||
            c.types.includes("street_number") ||
            c.types.includes("premise") ||
            c.types.includes("subpremise") ||
            c.types.includes("intersection"),
        );

        if (addressComponents.length > 0 && !hasStreet) {
          // Reject this result and mark as not found
          await db.collection("pending_listings").updateOne(
            { _id: new ObjectId(id) },
            {
              $set: {
                google_search_attempted: true,
                google_search_found: false,
              },
            },
          );
          revalidatePath("/admin/reviews");
          return {
            success: true,
            found: false,
            error: "Only city/state found, requires street address.",
          };
        }

        const updateData: any = {
          address,
          lat,
          lng,
          places_details: { place_id },
          google_search_attempted: true,
          google_search_found: true,
          locations: [
            {
              address,
              lat,
              lng,
              place_id,
            },
          ],
        };

        if (detailsData.status === "OK" && detailsData.result) {
          if (!listing.website && detailsData.result.website) {
            updateData.website = detailsData.result.website;
          }
          if (!listing.phone && detailsData.result.formatted_phone_number) {
            updateData.phone = detailsData.result.formatted_phone_number;
          }
        }

        await db
          .collection("pending_listings")
          .updateOne({ _id: new ObjectId(id) }, { $set: updateData });

        revalidatePath("/admin/reviews");
        return { success: true, found: true, updateData };
      }
    }

    // Attempted but NOT found
    await db
      .collection("pending_listings")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: { google_search_attempted: true, google_search_found: false } },
      );

    revalidatePath("/admin/reviews");
    return { success: true, found: false };
  } catch (error: any) {
    console.error("Auto-find failed:", error);
    return { success: false, error: "Failed to auto-find address" };
  }
}

export async function batchClearAndAutoFindListings(ids: string[]) {
  if (!(await checkAdmin())) return { success: false, error: "Unauthorized" };

  let successCount = 0;
  let failedCount = 0;

  for (const id of ids) {
    const clearRes = await clearPendingListingGeolocation(id);
    if (!clearRes.success) {
      failedCount++;
      continue;
    }

    // Add a small delay to respect Google Places API limits
    await new Promise((resolve) => setTimeout(resolve, 500));

    const findRes = await autoFindPendingListingAddress(id);
    if (findRes.success && findRes.found) {
      successCount++;
    } else {
      failedCount++;
    }
  }

  return { success: true, successCount, failedCount };
}
