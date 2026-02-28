import { useAuth0 } from "@auth0/auth0-react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import AddLocationIcon from "@mui/icons-material/AddLocationTwoTone";
import { APIProvider, Map, MapControl, useMap } from "@vis.gl/react-google-maps";
import { memo, useEffect, useState } from "react";

import MAvatar from "@/components/Nav/Mavatar";
import SideDrawer from "@/components/SideDrawer/SideDrawer";
import { Category, Libraries, Listing } from "@/db/Types";
import { GEOCENTER } from "@/util/functions";
import { findBusinessesNearby } from "@app/actions/geo-search";
import { css } from "@styled/css";
import ListingInfoWindow from "./ListingInfoWindow";
import MapAutoComplete from "./MapAutoComplete";
import MyMarker from "./MyMarker";

const libraries: Libraries = [
  "marker",
  "places",
  "visualization",
  "geometry",
];

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
}

const MapContent = memo(({
  listings,
  categories,
  selectedCategories,
  setSelectedCategories,
  activeListing,
  setactiveListing,
  isDrawerOpen,
  setisDrawerOpen,
  isInfoWindowOpen,
  setisInfoWindowOpen,
  mapInstance,
  setMapInstance
}: any) => {
  const map = useMap("GMap");
  const [clusterer, setClusterer] = useState<MarkerClusterer>();
  const { isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!map) return;
    setMapInstance(map);
    setClusterer(new MarkerClusterer({ map }));
  }, [map, setMapInstance]);

  return (
    <>
      <MapControl position={3}> {/* TOP_RIGHT */}
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "2",
            margin: "2",
            marginRight: "4",
            padding: "2",
            backgroundColor: "rgba(255, 230, 200, 1)",
            borderRadius: "full",
            boxShadow: "md",
          })}
        >
          {isAuthenticated ? (
            <button
              aria-label="Add A Listing"
              className={css({
                background: "transparent",
                border: "none",
                color: "brand.grey",
                cursor: "pointer",
                padding: "2",
                borderRadius: "full",
                _hover: { backgroundColor: "rgba(0,0,0,0.05)" },
              })}
            >
              <AddLocationIcon />
            </button>
          ) : null}
          <MAvatar />
        </div>
      </MapControl>
      <MapControl position={2}>
        <MapAutoComplete
          listings={listings}
          categories={categories}
          mapInstance={mapInstance || map}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          setactiveListing={setactiveListing}
          setisDrawerOpen={setisDrawerOpen}
        />
      </MapControl>
      {listings && listings.length === 0 && (
        <div
          className={css({
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(12px)",
            padding: "8",
            borderRadius: "2xl",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            textAlign: "center",
            maxWidth: "350px",
            zIndex: 10,
            border: "1px solid rgba(255, 255, 255, 0.3)",
          })}
        >
          <div className={css({ mb: "4", color: "brand.orange" })}>
            <AddLocationIcon sx={{ fontSize: 48 }} />
          </div>
          <h2 className={css({ fontSize: "2xl", fontWeight: "bold", mb: 2, color: "gray.800" })}>
            No Businesses Found Here
          </h2>
          <p className={css({ color: "gray.600", mb: 6, fontSize: "sm", lineHeight: "relaxed" })}>
            We couldn't find any Black-owned businesses in this immediate area. Help us grow the MOBB by adding one, or search another area!
          </p>
          <button
            onClick={() => isAuthenticated ? setisDrawerOpen(true) : loginWithRedirect()}
            className={css({
              backgroundColor: "brand.orange",
              color: "white",
              fontWeight: "600",
              padding: "3 6",
              borderRadius: "full",
              cursor: "pointer",
              transition: "all 0.2s",
              _hover: { transform: "translateY(-1px)", boxShadow: "md" },
              _active: { transform: "translateY(0)" },
            })}
          >
            {isAuthenticated ? "Add a Business" : "Sign in to Add"}
          </button>
        </div>
      )}

      {listings && listings.map((listing: Listing) => {
        const hasMatch = listing.categories && listing.categories.some((el: Category) => selectedCategories.has(el));
        const noCategories = !listing.categories || listing.categories.length === 0;
        const isVisible = hasMatch || noCategories;

        if (!isVisible) return null;

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
      {activeListing && isInfoWindowOpen && (
        <ListingInfoWindow activeListing={activeListing} />
      )}
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
});

const AppMap = memo(
  ({
    listings,
    setListings,
    categories,
    browserLocation,
    setMapInstance,
    mapInstance,
  }: IAppMap) => {
    const [isDrawerOpen, setisDrawerOpen] = useState(false);
    const [isInfoWindowOpen, setisInfoWindowOpen] = useState(false);
    const [activeListing, setactiveListing] = useState<Listing | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(
      new Set(categories || [])
    );

    const handleIdle = async (e: any) => {
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
          colorScheme={"DARK"}
          onIdle={handleIdle}
        >
          <MapContent
            listings={listings}
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
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
  }
);

export default AppMap;
