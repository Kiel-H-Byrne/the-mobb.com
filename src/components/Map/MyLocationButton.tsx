import MyLocationIcon from "@mui/icons-material/MyLocationTwoTone";

import { useEffect, useState } from "react";
import { css } from "@styled/css";
import ClosestCard from "@/components/ClosestCard/ClosestCard";
import ClosestList from "@/components/ClosestList";
import { findClosestMarker, targetClient } from "@/util/functions";

const MyLocationButton = ({ listings, mapInstance }) => {
  const [clientLocation, setClientLocation] = useState<{lat: number, lng: number} | null>(null);
  const [closestListing, setClosestListing] = useState<any | null>(null);
  const [geoWatchId, setGeoWatchId] = useState<number | null>(null);
  const [clientMarker, setClientMarker] = useState<any | null>(null);
  const [toggleDisplay, setToggleDisplay] = useState(false);

  useEffect(() => {
    return () => {
      if (geoWatchId) {
        window.navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [geoWatchId, clientLocation]);

  const handleClick = () => {
    if (!geoWatchId) {
      const location = window.navigator && window.navigator.geolocation;
      if (location) {
        const watchId = location.watchPosition(
          (position) => {
            const positionObject = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };

            if (!clientMarker) {
              let marker = new window.google.maps.Marker({
                position: new window.google.maps.LatLng(positionObject),
                map: mapInstance,
                icon: { url: "img/map/orange_dot_sm_2.png" },
                title: "My Location",
              });
              setClientMarker(marker);
            } else {
              clientMarker.setMap(mapInstance);
              clientMarker.setPosition(positionObject);
            }
            setClientLocation(positionObject);
            targetClient(mapInstance, positionObject);

            if (!closestListing) {
              setClosestListing(findClosestMarker(listings, positionObject));
            }
          },
          (error) => {
            console.warn(error);
          },
        );
        setGeoWatchId(watchId);
      }
    }
    clientLocation && targetClient(mapInstance, clientLocation);
    setToggleDisplay(!toggleDisplay);
  };

  return (
    <>
      <button
        aria-label="My Location"
        onClick={handleClick}
        className={css({
          background: "transparent",
          border: "none",
          padding: "2",
          cursor: "pointer",
          color: clientLocation ? "brand.orange" : "brand.grey",
          borderRadius: "full",
          _hover: { backgroundColor: "rgba(0,0,0,0.05)" },
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        })}
      >
        <MyLocationIcon />
      </button>
      {closestListing && toggleDisplay && (
        <ClosestCard closestListing={closestListing} />
      )}
      {closestListing && toggleDisplay && (
        <ClosestList closestListing={closestListing} />
      )}
    </>
  );
};

export default MyLocationButton;
