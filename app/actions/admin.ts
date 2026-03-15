"use server";

import clientPromise, { DB_NAME } from "@/db/mongodb";
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
          lng: finalizedData.lng
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

              if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
                const bestMatch = geocodeData.results[0];
                lat = bestMatch.geometry.location.lat;
                lng = bestMatch.geometry.location.lng;
                place_id = bestMatch.place_id;
                formattedAddress = bestMatch.formatted_address || formattedAddress;
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
              coordinates: [Number(lng), Number(lat)]
            }
          });
        }
      }
    }

    const safeAddress = finalLocations.length > 0 ? finalLocations[0].address : (isOnlineOnly ? "Online Only" : "Unknown Address");

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
      .updateOne({ _id: new ObjectId(id) }, { $set: { status: "APPROVED" } });

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
      unsetData.lat = "";
      unsetData.lng = "";
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
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    
  try {
    const res = await fetch(`${baseUrl}/api/cron/scout`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${process.env.CRON_SECRET || ""}`
      }
    });
    
    // We try to parse the JSON response from the scout cron API
    const data = await res.json();
    revalidatePath("/admin/reviews");
    return data;
  } catch (error: any) {
    console.error("Manual scout trigger failed:", error);
    return { success: false, error: error.message || "Failed to trigger scout API." };
  }
}

