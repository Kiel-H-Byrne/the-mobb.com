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
}

export interface User {
  _id?: any;
  email: string;
  password?: string;
  role: "ADMIN" | "USER";
  name?: string;
}
