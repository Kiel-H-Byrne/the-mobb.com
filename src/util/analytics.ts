import { Listing } from "@/db/Types";

// Ensure global Window has gtag typed
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

/**
 * Low-level Google Analytics gtag event dispatcher.
 * Handles SSR safety and missing gtag gracefully.
 */
export const trackEvent = (
  eventName: string,
  eventParams: Record<string, any> = {},
) => {
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParams);
  }
};

// ==========================================
// 1. Searches Executed
// ==========================================
export interface SearchEventParams {
  searchTerm: string;
  searchType: "text" | "category" | "nearby" | "location";
  resultCount?: number;
}

export const trackSearchExecuted = ({
  searchTerm,
  searchType,
  resultCount,
}: SearchEventParams) => {
  const payload = {
    search_term: searchTerm,
    search_type: searchType,
    ...(resultCount !== undefined ? { results_count: resultCount } : {}),
  };

  // Standard GA4 recommended event
  trackEvent("search", payload);
  // Custom explicit success metric alias
  trackEvent("search_executed", payload);
};

const getListingId = (listing: Partial<Listing>): string => {
  return (
    (listing as any)?._id?.toString() ||
    (listing as any)?.id ||
    listing.google_id ||
    "unknown"
  );
};

// ==========================================
// 2. Business Listings Viewed
// ==========================================
export const trackListingViewed = (
  listing: Partial<Listing>,
  source: string = "unknown",
) => {
  const listingId = getListingId(listing);
  const listingName =
    listing.name || (listing as any)?.og_title || "Unknown Business";
  const category =
    (listing as any)?.category || listing.categories?.[0] || "General";

  // Standard GA4 view_item event
  trackEvent("view_item", {
    items: [
      {
        item_id: listingId,
        item_name: listingName,
        item_category: category,
      },
    ],
    source,
  });

  // Explicit success metric event
  trackEvent("listing_viewed", {
    listing_id: listingId,
    listing_name: listingName,
    category,
    has_address: Boolean(listing.address),
    is_online_only: Boolean(listing.isOnlineOnly),
    source,
  });
};

// ==========================================
// 3. Directions / Click-Throughs Triggered
// ==========================================
export const trackDirectionsTriggered = (
  listing: Partial<Listing>,
  destination?: string,
) => {
  const listingId = getListingId(listing);
  const listingName =
    listing.name || (listing as any)?.og_title || "Unknown Business";
  const address = destination || listing.address || "";

  const payload = {
    listing_id: listingId,
    listing_name: listingName,
    destination_address: address,
  };

  // Standard GA4 / custom directions event
  trackEvent("get_directions", payload);
  trackEvent("directions_triggered", payload);
};

export type ClickThroughType = "website" | "phone" | "share" | "social";

export const trackClickThrough = (
  listing: Partial<Listing>,
  clickType: ClickThroughType,
  destination?: string,
) => {
  const listingId = getListingId(listing);
  const listingName =
    listing.name || (listing as any)?.og_title || "Unknown Business";

  // Explicit success metric
  trackEvent("click_through_triggered", {
    listing_id: listingId,
    listing_name: listingName,
    click_type: clickType,
    destination: destination || "",
  });

  // Standard GA4 specific mappings
  if (clickType === "website") {
    trackEvent("outbound_click", {
      listing_id: listingId,
      listing_name: listingName,
      destination_url: destination || listing.url || "",
    });
  } else if (clickType === "phone") {
    trackEvent("contact_phone", {
      listing_id: listingId,
      listing_name: listingName,
      phone_number: destination || listing.phone || "",
    });
  } else if (clickType === "share") {
    trackEvent("share", {
      method: "native_share",
      content_type: "listing",
      item_id: listingId,
    });
  }
};

// ==========================================
// 4. Places Saved
// ==========================================
export const trackPlaceSaved = (
  listing: Partial<Listing>,
  isSaved: boolean,
) => {
  const listingId = getListingId(listing);
  const listingName =
    listing.name || (listing as any)?.og_title || "Unknown Business";
  const category =
    (listing as any)?.category || listing.categories?.[0] || "General";

  if (isSaved) {
    // Standard GA4 event
    trackEvent("add_to_wishlist", {
      items: [
        {
          item_id: listingId,
          item_name: listingName,
          item_category: category,
        },
      ],
    });
    // Explicit success metric
    trackEvent("place_saved", {
      listing_id: listingId,
      listing_name: listingName,
      category,
      action: "save",
    });
  } else {
    trackEvent("place_saved", {
      listing_id: listingId,
      listing_name: listingName,
      category,
      action: "unsave",
    });
  }
};

// ==========================================
// 5. New User Submissions
// ==========================================
export interface NewSubmissionParams {
  name: string;
  category: string;
  source: "AI_SCAN" | "MANUAL";
  isBlackOwned?: boolean;
  isOnlineOnly?: boolean;
}

export const trackNewSubmission = (data: NewSubmissionParams) => {
  // Standard GA4 lead generation event
  trackEvent("generate_lead", {
    currency: "USD",
    value: 1,
    submission_type: data.source,
    business_name: data.name,
    category: data.category,
  });

  // Explicit success metric
  trackEvent("new_user_submission", {
    business_name: data.name,
    category: data.category,
    submission_source: data.source,
    is_black_owned: Boolean(data.isBlackOwned),
    is_online_only: Boolean(data.isOnlineOnly),
  });
};

export const trackScanInitiated = ({ url }: { url: string }) => {
  trackEvent("ai_scan_initiated", {
    url,
  });
};
