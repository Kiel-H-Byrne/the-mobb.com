export interface Claim {
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerProof?: Date;
}

export interface Listing {
  _id: any; //ObjectId type from mongoDB
  name: string;
  address: string; // Legacy fallback
  street?: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  url?: string;
  claims: Claim[];
  claimsCount?: number;
  location?: string;
  verifiers?: string[];
  verifierCount?: number;
  deverifiers?: string[];
  deverifierCount?: number;
  description?: string;
  image?: { url: string };
  og_title?: string;
  og_description?: string;
  og_image?: string;
  google_id?: string;
  places_details?: Object;
  yelp_id?: string;
  email?: string;
  categories?: string[];
  social?: string;
  isOnlineOnly?: boolean;
  coordinates?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };
  locations?: {
    address: string;
    coordinates?: {
      type: "Point";
      coordinates: [number, number]; // [longitude, latitude]
    };
    place_id?: string;
  }[];
  creator: Date | string;
  submitted: Date | string;
}
export type Category = string;
export type Libraries = (
  | "drawing"
  | "geometry"
  | "places"
  | "visualization"
  | "marker"
)[];

export interface GLocation {
  lat: number;
  lng: number;
}

export interface PendingListing {
  _id?: any;
  name: string;
  category: string;
  address?: string | (string | null)[] | null; // Legacy fallback
  locations?: {
    address: string;
    lat?: number;
    lng?: number;
    place_id?: string;
  }[];
  website?: string;
  description?: string;
  isBlackOwned?: boolean;
  isOnlineOnly?: boolean;
  phone?: string;
  google_id?: string;
  places_details?: Record<string, unknown>;
  lat?: number;
  lng?: number;
  source: "MANUAL" | "AI_SCAN";
  status: "PENDING_REVIEW" | "APPROVED" | "REJECTED";
  createdAt: Date;
  google_search_attempted?: boolean;
  google_search_found?: boolean;
  curation?: CurationReport;
}

export type CurationCheck = {
  key: "blackOwned" | "category" | "location";
  label: string;
  passed: boolean;
  detail?: string;
};

// Audit trail of how the curator scored a listing; stored on pending_listings.curation
export type CurationReport = {
  runId?: string;
  sourceUrl: string;
  sourceType?: "single_business" | "listicle_directory";
  model: string;
  blackOwnedConfidence: number | null;
  blackOwnedEvidence: string | null;
  locationMethod:
    | "online_only"
    | "geocoded_address"
    | "places_name_search"
    | "none"
    // Legacy listings: a location exists but how it was found wasn't recorded
    | "unknown";
  geocodeResults: {
    query: string;
    formattedAddress?: string;
    types: string[];
    isStreetLevel: boolean;
  }[];
  hasWebsite: boolean;
  hasOgData: boolean;
  checks: CurationCheck[];
  decision: "AUTO_APPROVED" | "PENDING_REVIEW";
  liveListingId?: string;
  duplicateOfLiveListingId?: string;
  publishSkippedReason?: string;
  revertedAt?: Date;
  // Set on reports reconstructed for listings approved before curation was recorded
  legacy?: { sourceUrlInferred: boolean; liveListingInferred: boolean };
  evaluatedAt: Date;
};

export interface User {
  _id?: any;
  email: string;
  password?: string;
  role: "ADMIN" | "USER";
  name?: string;
}
