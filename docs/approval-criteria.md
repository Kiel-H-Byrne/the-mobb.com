# MOBB Listing Approval Criteria

To maintain the quality and integrity of the Map of Black Businesses, all listings must meet the following strict criteria before they can be approved and published to the live platform.

## 1. Core Data Requirements
*   **Business Name:** Must be the official, recognizable name of the business.
*   **Category:** Must be assigned to a specific, relevant category (e.g., "Restaurant", "Bookstore"). Listings marked as "Uncategorized" cannot be approved.
*   **Source Verification:** AI-scanned listings must have a high confidence score for being Black-owned.

## 2. Location & Geocoding Standards
A listing must satisfy **one** of the following two conditions:

### A. Physical Establishment (Brick & Mortar)
*   **Full Street Address:** Must include a street number and street name. Generic city/state addresses (e.g., "Washington, D.C.") are strictly prohibited.
*   **Valid Geolocation:** Must have precise Latitude and Longitude coordinates.
*   **Google Place ID:** Captured via the Google Places API to ensure the business is a verified establishment, not just a geographic coordinate.

### B. Online Only / Service Area
*   **isOnlineOnly Flag:** Set to `true`.
*   **Regional Context:** While no specific street address is required, a service area or general city context is preferred for regional discovery.

## 3. Contact & Connectivity (Highly Recommended)
*   **Website:** A valid URL for the business's official site or social media profile.
*   **Phone Number:** A verified contact number for the business.

---

## Technical Enforcement
Technical checks are implemented in:
- `app/actions/ai-curator.ts`: For automated discovery and auto-approval.
- `app/admin/reviews/page.tsx`: For disabling the "Approve" button during manual review if criteria are not met.
- `src/components/Map/AppMap.tsx`: For visibility filtering on the map.
