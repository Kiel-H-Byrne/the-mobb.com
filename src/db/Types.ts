export interface Claim {
  ownerId?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerProof?: Date;
}

export interface Listing {
  name: string;
  address: string;
  street?: string;
  city: string;
  state?: string;
  zip?: string;
  country?: string;
  phone?: string;
  url?: string;
  claims: Claim[];
  claimsCount?: Number;
  location?: string;
  verifiers?: [String];
  verifierCount?: Number;
  deverifiers?: [String];
  deverifierCount?: Number;
  description?: string;
  image?: { url: string };
  google_id?: string;
  places_details?: Object;
  yelp_id?: string;
  email?: string;
  categories?: string[];
  social?: string;
  creator: Date;
  submitted: Date;
}

export interface GLocation { lat: string, lng: string }

