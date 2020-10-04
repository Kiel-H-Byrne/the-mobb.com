import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/styles";
import { IconButton } from "@material-ui/core";
import MyLocationIcon from "@material-ui/icons/MyLocationTwoTone";
import { findClosestMarker, targetClient } from "./../../util/functions";
import ClosestCard from "../ClosestCard/ClosestCard";

const useStyles = makeStyles({
  root: {},
  hasLocation: {
    color: "#0abab5",
  }
});

const MyLocationButton = ({ listings, mapInstance }) => {
  const classes = useStyles();
  const [myLocation, setMyLocation] = useState(null);
  const [closestListing, setClosestListing] = useState(null);
  const [geoWatchId, setGeoWatchId] = useState(null);
  const [clientMarker, setClientMarker] = useState(null);
  const [toggleDisplay, setToggleDisplay] = useState(false);

  useEffect(() => {
    //pan map to new center every new lat/long
    //do nothing, then cleanup
    return () => {
      if (geoWatchId) {
        window.navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [geoWatchId, myLocation]);
  const handleClick = () => {
    //when clicked, find users location. keep finding every x minutes or as position changes. if position doesn't change after x minutes. turn off
    //zoom o position
    //calculate closest listing(s)
    //when user clicks again, turn tracking off.
    let oldMarker;

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
                // animation: google.maps.Animation.BOUNCE,
              });
              setClientMarker(marker);
            } else {
              //MARKER EXISTS, SO WE MOVE IT TO NEW POSITION.
              clientMarker.setMap(mapInstance);
              clientMarker.setPosition(positionObject);
            }
            setMyLocation(positionObject);
            targetClient(mapInstance, (positionObject))

            if (!closestListing) {
              setClosestListing(findClosestMarker(listings, positionObject));
            }
            // IN order to change the marker background i need the marker. in the old app an array of markers were stored in redux state
            if (oldMarker !== closestListing) {
              // set old marker icon
              //   url: "img/map/orange_marker_sm.png",
              // console.log("change color of marker")
            } else {
              // set closest marker icon
              //   url: "img/map/red_marker_sm.png",
              oldMarker = closestListing;
            }
          },
          (error) => {
            console.warn(error)
            // setMyLocation({
            //   latitude: "err-latitude",
            //   longitude: "err-longitude"
            // });
          }
        );
        setGeoWatchId(watchId);
      } else {
        setMyLocation({
          lat: null,
          lng: null,
        });
      }
    }
    myLocation && targetClient(mapInstance, myLocation);
    !toggleDisplay ? setToggleDisplay(true) : setToggleDisplay(false);
  };

  return (
    <>
    <IconButton
      color={myLocation ? "secondary" : "default"}
      className={[classes.root, myLocation ? "" : classes.hasLocation] }
      aria-label="My Location"
      onClick={handleClick}
    >
      <MyLocationIcon />
    </IconButton>
    {(closestListing && toggleDisplay) && <ClosestCard closestListing={closestListing}/>}
    </>
  );
};

export default MyLocationButton;
