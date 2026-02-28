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
  const { isAuthenticated } = useAuth0();

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
