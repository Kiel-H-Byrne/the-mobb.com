# MOBB Performance Optimization Roadmap

## 🚀 Performance Improvement Strategy
**Primary Goal**: Transition from "Full-Page Re-renders" to "Atomic Updates" and leverage React Server Components (RSC) to reduce the client-side JavaScript burden.

---

## 📋 Performance Optimization Todo List

### 1. State Management & Component Architecture
* [x] **Refactor `app/page.tsx` Monolith**: Break down the 230+ lines of state in `Home` into discrete providers or a lightweight state store (like **Zustand**).
* [x] **Atomic UI States**: Move ephemeral states (like `isDrawerOpen` or `activeNav`) out of the main loop. Toggling a drawer should not cause the Map to re-evaluate 100+ markers.
* [x] **Memoization Audit**: Wrap `visibleListings` calculation in `ActivePulsePanel.tsx` with `useMemo`. Currently, it sorts and maps the entire listing array on *every* mouse move or state change.

### 2. Next.js & Server-Side Optimization
* [ ] **Fetch All → Viewport Fetching**: Replace `fetchAllListings()` (which pulls the entire DB) with a Server Action that fetches businesses based on the map's `bounds` or `radius`.
* [ ] **Categories as RSC**: Fetch the Category list on the server in `page.tsx` and pass them as initial data. This removes a `useEffect` jump on load.
* [ ] **Caching Strategy**: Implement `unstable_cache` in `app/actions/geo-search.ts` for categories and static search results to reduce MongoDB Atlas hits.

### 3. Database & Search (MongoDB)
* [ ] **Field Projection**: In `findBusinessesNearby`, only return fields needed for the map/list (Name, Coords, Category). Do not return the massive `places_details` object until the user clicks an individual listing.
* [ ] **Atlas Search Integration**: Replace `$regex` in `searchBusinesses` with a proper MongoDB Atlas Search index. Regex is O(n) and will crawl as the business count grows.
* [ ] **2dsphere Verification**: Ensure the `coordinates` field in the `listings` collection has a `2dsphere` index to prevent Geospatial query timeouts.

### 4. UI/UX & Rendering
* [ ] **Marker Virtualization/Clustering**: Ensure `MarkerClusterer` is efficiently handling $1000+$ points. Verify that `AdvancedMarkerElement` is using the `collisionBehavior` property to reduce GPU overhead.
* [x] **Icon Optimization**: Replace the blocking `<script>` tag for Phosphor icons in `layout.tsx` with local SVGs or `@phosphor-icons/react`. This improves "Largest Contentful Paint" (LCP) significantly.
* [ ] **Image Optimization**: Replace generic `<img>` tags in `ActivePulsePanel` and `ListingDetailPanel3D` with `next/image` to benefit from automatic WebP conversion and lazy loading.

---

## 🛠️ Technical Implementation Plan

| Feature Area | Current Problem | Proposed Strategy | Measurable Gain |
| :--- | :--- | :--- | :--- |
| **Map Interaction** | `onIdle` triggers full state update of `listings` array. | Use a Map-local state and only update the global "Active" listing. | ~200ms reduction in UI lag during panning. |
| **Listing List** | Sorts/Filters O(n) on every render. | `useMemo` based on `[listings, selectedCategories, userLocation]`. | Eliminates frame-drops on high-refresh-rate monitors. |
| **Initial Load** | Empty map for ~1s while `useEffect` fetches. | Pre-fetch top 50 businesses via RSC in `page.tsx`. | ~40% faster FCP (First Contentful Paint). |
| **Asset Delivery** | Blocking external scripts for fonts/icons. | Use `next/font/google` and inline SVGs. | ~300ms reduction in Time-to-Interactive (TTI). |
