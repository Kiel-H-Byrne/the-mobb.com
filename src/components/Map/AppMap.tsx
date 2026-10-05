"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { useTheme } from "next-themes";
import { Dispatch, memo, SetStateAction, useEffect, useState } from "react";

import { Category, Libraries, Listing } from "@/db/Types";
import { listingMatchesCategories } from "@/util/categories";
import { GEOCENTER } from "@/util/functions";
import { css } from "@styled/css";
import MyMarker from "./MyMarker";

const libraries: Libraries = ["marker", "places", "visualization", "geometry"];

const defaultProps = {
  center: GEOCENTER,
  zoom: 5,
  options: {
    clickableIcons: false,
    backgroundColor: "#555",
    disableDefaultUI: true,
    fullscreenControl: false,
    zoomControl: false,
    mapTypeControl: false,
    scaleControl: false,
    rotateControl: false,
    streetViewControl: false,
    gestureHandling: "greedy",
    scrollwheel: true,
    maxZoom: 18,
    minZoom: 4,
  },
};

interface IAppMap {
  listings: Listing[];
  categories: Category[];
  browserLocation: any;
  setMapInstance: any;
  mapInstance: any;
  activeListing?: Listing | null; // Kept as optional just in case, but unused
  setactiveListing: Dispatch<SetStateAction<Listing | null>>;
  selectedCategories: Set<Category>;
  setSelectedCategories: Dispatch<SetStateAction<Set<Category>>>;
  setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
  setisInfoWindowOpen: Dispatch<SetStateAction<boolean>>;
  setIsMapActive: Dispatch<SetStateAction<boolean>>;
}

const MapContent = memo(
  ({
    listings,
    categories,
    selectedCategories,
    setactiveListing,
    setisDrawerOpen,
    setisInfoWindowOpen,
    mapInstance,
    setMapInstance,
  }: any) => {
    const map = useMap("GMap");
    const [clusterer, setClusterer] = useState<MarkerClusterer>();
    const { isAuthenticated, loginWithRedirect } = useAuth0();
    const [isAddListingOpen, setIsAddListingOpen] = useState(false);

    useEffect(() => {
      if (!map) return;
      setMapInstance(map);

      // Custom Renderer for Vision 2030 brand.orange pulsing nodes
      const customRenderer = {
        render: ({ count, position }: any) => {
          const el = document.createElement("div");
          el.innerHTML = count.toString();

          Object.assign(el.style, {
            width: "40px",
            height: "40px",
            background: "#FF5A00",
            color: "white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
            fontFamily: "Inter, sans-serif",
            boxShadow: "0 0 20px #FF5A00, 0 0 40px rgba(255, 90, 0, 0.6)",
            position: "relative",
            fontSize: "14px",
            border: "1px solid rgba(255, 90, 0, 0.8)",
          });

          // Add pulse ring logic
          const ring = document.createElement("div");
          Object.assign(ring.style, {
            position: "absolute",
            top: "-50%",
            left: "-50%",
            width: "200%",
            height: "200%",
            border: "1px solid #FF5A00",
            borderRadius: "50%",
            animation:
              "pulseSlow 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite",
            pointerEvents: "none",
          });
          el.appendChild(ring);

          return new google.maps.marker.AdvancedMarkerElement({
            position,
            content: el,
            zIndex: Number(google.maps.Marker.MAX_ZINDEX) + count,
            collisionBehavior:
              google.maps.CollisionBehavior.OPTIONAL_AND_HIDES_LOWER_PRIORITY,
          });
        },
      };

      setClusterer(new MarkerClusterer({ map, renderer: customRenderer }));
    }, [map, setMapInstance]);

    return (
      <>
        {/* HUD and AutoComplete MapControls have been relocated to 2030 AR Panels */}
        {listings &&
          listings.map((listing: Listing) => {
            const isVisible = listingMatchesCategories(
              listing,
              selectedCategories,
            );
            const hasLegacyCoordinates = Boolean(
              listing.coordinates &&
                listing.coordinates.coordinates &&
                listing.coordinates.coordinates.length > 1,
            );
            const hasLocations = Boolean(
              listing.locations &&
                listing.locations.length > 0 &&
                listing.locations.some(
                  (loc) => loc.coordinates?.coordinates?.length === 2,
                ),
            );

            const hasPlacesLocation = Boolean(
              (listing.places_details as any)?.location?.lat &&
                (listing.places_details as any)?.location?.lng,
            );

            if (
              !isVisible ||
              (!hasLegacyCoordinates && !hasLocations && !hasPlacesLocation) ||
              listing.isOnlineOnly
            )
              return null;

            if (hasLocations) {
              return listing.locations!.map((loc, idx) => {
                if (!loc.coordinates || loc.coordinates.coordinates.length < 2)
                  return null;
                return (
                  <MyMarker
                    key={`marker-${listing._id}-${idx}`}
                    data={listing}
                    locationData={loc}
                    clusterer={clusterer}
                    setactiveListing={setactiveListing}
                    setisDrawerOpen={setisDrawerOpen}
                    setisInfoWindowOpen={setisInfoWindowOpen}
                  />
                );
              });
            }

            return (
              <MyMarker
                key={`marker-${listing._id}`}
                data={listing}
                clusterer={clusterer}
                setactiveListing={setactiveListing}
                setisDrawerOpen={setisDrawerOpen}
                setisInfoWindowOpen={setisInfoWindowOpen}
              />
            );
          })}
      </>
    );
  },
);

const AppMap = memo(
  ({
    listings,
    categories,
    browserLocation,
    setMapInstance,
    mapInstance,
    setactiveListing,
    selectedCategories,
    setSelectedCategories,
    setisDrawerOpen,
    setisInfoWindowOpen,
    setIsMapActive,
  }: IAppMap) => {
    const { theme } = useTheme();

    // All mappable listings are loaded up front (see fetchMapListings), so
    // moving the map no longer swaps in a different subset of listings.
    const handleIdle = () => setIsMapActive(false);

    let { center, zoom, options } = defaultProps;

    return (
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}
        libraries={libraries}
      >
        <Map
          id="GMap"
          mapId={process.env.NEXT_PUBLIC_MAP_ID || "DEMO_MAP_ID"}
          className={css({
            width: "100%",
            height: "100%",
            position: "absolute",
            overflow: "hidden",
            top: "0",
            left: "0",
          })}
          defaultCenter={browserLocation || center}
          defaultZoom={browserLocation ? 16 : zoom}
          {...options}
          colorScheme={theme === "dark" ? "DARK" : "LIGHT"}
          onDragstart={() => setIsMapActive(true)}
          onIdle={handleIdle}
        >
          <MapContent
            listings={listings}
            categories={categories}
            selectedCategories={selectedCategories}
            setactiveListing={setactiveListing}
            setisDrawerOpen={setisDrawerOpen}
            setisInfoWindowOpen={setisInfoWindowOpen}
            mapInstance={mapInstance}
            setMapInstance={setMapInstance}
          />
        </Map>
      </APIProvider>
    );
  },
);

export default AppMap;
