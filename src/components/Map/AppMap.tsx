"use client";

import { useAuth0 } from "@auth0/auth0-react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";
import { Dispatch, memo, SetStateAction, useEffect, useState } from "react";

import { Category, Libraries, Listing } from "@/db/Types";
import { GEOCENTER } from "@/util/functions";
import { findBusinessesNearby } from "@app/actions/geo-search";
import { css } from "@styled/css";
import SideDrawer from "../SideDrawer/SideDrawer";
import MyMarker from "./MyMarker";

const libraries: Libraries = ["marker", "places", "visualization", "geometry"];

const defaultProps = {
  center: GEOCENTER,
  zoom: 5,
  options: {
    backgroundColor: "#555",
    clickableIcons: true,
    disableDefaultUI: true,
    fullscreenControl: false,
    zoomControl: true,
    mapTypeControl: false,
    scaleControl: false,
    rotateControl: true,
    streetViewControl: false,
    gestureHandling: "greedy",
    scrollwheel: true,
    maxZoom: 18,
    minZoom: 4,
  },
};

interface IAppMap {
  listings: Listing[];
  setListings: (listings: Listing[]) => void;
  categories: Category[];
  browserLocation: any;
  setMapInstance: any;
  mapInstance: any;
  activeListing: Listing | null;
  setactiveListing: Dispatch<SetStateAction<Listing | null>>;
  selectedCategories: Set<Category>;
  setSelectedCategories: Dispatch<SetStateAction<Set<Category>>>;
  isDrawerOpen: boolean;
  setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
  isInfoWindowOpen: boolean;
  setisInfoWindowOpen: Dispatch<SetStateAction<boolean>>;
  setIsMapActive: Dispatch<SetStateAction<boolean>>;
}

const MapContent = memo(
  ({
    listings,
    selectedCategories,
    activeListing,
    setactiveListing,
    isDrawerOpen,
    setisDrawerOpen,
    isInfoWindowOpen,
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
            const hasMatch =
              listing.categories &&
              listing.categories.some((el: Category) =>
                selectedCategories.has(el),
              );
            const noCategories =
              !listing.categories || listing.categories.length === 0;
            const isVisible = hasMatch || noCategories;
            const hasCoordinates = Boolean(
              listing.coordinates &&
                listing.coordinates.coordinates &&
                listing.coordinates.coordinates.length > 1,
            );

            if (!isVisible || !hasCoordinates || listing.isOnlineOnly)
              return null;

            return (
              <MyMarker
                key={`marker-${listing._id}`}
                //@ts-ignore
                data={listing}
                clusterer={clusterer}
                setactiveListing={setactiveListing}
                setisDrawerOpen={setisDrawerOpen}
                setisInfoWindowOpen={setisInfoWindowOpen}
              />
            );
          })}

        {activeListing && isDrawerOpen && (
          <SideDrawer
            activeListing={activeListing}
            isOpen={isDrawerOpen}
            setOpen={setisDrawerOpen}
            mapInstance={mapInstance || map}
          />
        )}
      </>
    );
  },
);

const AppMap = memo(
  ({
    listings,
    setListings,
    categories,
    browserLocation,
    setMapInstance,
    mapInstance,
    activeListing,
    setactiveListing,
    selectedCategories,
    setSelectedCategories,
    isDrawerOpen,
    setisDrawerOpen,
    isInfoWindowOpen,
    setisInfoWindowOpen,
    setIsMapActive,
  }: IAppMap) => {
    const handleIdle = async (e: any) => {
      setIsMapActive(false);
      const map = e.map;
      if (map) {
        const center = map.getCenter();
        const lat = center.lat();
        const lng = center.lng();
        const zoom = map.getZoom();
        const radius = Math.max(5000, 10 ** (15 - zoom));

        try {
          const nearby = await findBusinessesNearby(lat, lng, radius);
          if (nearby && nearby.length > 0) {
            setListings(nearby);
          }
        } catch (error) {
          console.error("Error fetching nearby businesses:", error);
        }
      }
    };

    let { center, zoom, options } = defaultProps;

    return (
      <APIProvider
        apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY as string}
        //@ts-ignore
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
          disableDefaultUI={options.disableDefaultUI}
          zoomControl={options.zoomControl}
          gestureHandling={options.gestureHandling}
          colorScheme={"LIGHT"}
          onDragstart={() => setIsMapActive(true)}
          onIdle={handleIdle}
        >
          <MapContent
            listings={listings}
            selectedCategories={selectedCategories}
            activeListing={activeListing}
            setactiveListing={setactiveListing}
            isDrawerOpen={isDrawerOpen}
            setisDrawerOpen={setisDrawerOpen}
            isInfoWindowOpen={isInfoWindowOpen}
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
