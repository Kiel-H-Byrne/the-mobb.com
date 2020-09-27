import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { makeStyles } from "@material-ui/styles";
import { IconButton } from "@material-ui/core";
import MyLocationIcon from "@material-ui/icons/MyLocationTwoTone";
import { UPDATE_SESSION_REDUCER } from "./../../actions/actionConstants";
import { findClosestMarker } from "./../../util/functions";

const useStyles = makeStyles({
  root: {},
});

const MyLocationButton = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const myLocation = useSelector((state) => state.session.browser_location);
  const geoWatchId = useSelector((state) => state.session.geolocation_watch_id);
  const clientMarker = useSelector((state) => state.session.client_marker);
  const listings = useSelector((state) => state.listings.byId);
  const mapInstance = useSelector((state) => state.map.GMap);

  useEffect(() => {
    //pan map to new center every new lat/long
    //do nothing, then cleanup
    return () => {
      if (geoWatchId) {
        window.navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [geoWatchId, clientMarker, myLocation]);

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
                icon: { url: "img/orange_dot_sm_2.png" },
                title: "My Location",
                // animation: google.maps.Animation.BOUNCE,
              });

              dispatch({
                type: UPDATE_SESSION_REDUCER,
                aspect: "client_marker",
                payload: marker,
              });
            } else {
              //MARKER EXISTS, SO WE MOVE IT TO NEW POSITION.
              clientMarker.setMap(mapInstance);
              clientMarker.setPosition(positionObject);
            }

            let closestListing = findClosestMarker(listings, positionObject);
            if (oldMarker !== closestListing) {
              // set old marker icon
              //   url: "img/orange_marker_sm.png",
            } else {
              // set closest marker icon
              //   url: "img/red_marker_sm.png",
              oldMarker = closestListing;
            }
            dispatch({
              type: UPDATE_SESSION_REDUCER,
              aspect: "browser_location",
              payload: {
                ...positionObject,
                searching: false,
              },
            });
            dispatch({
              type: UPDATE_SESSION_REDUCER,
              aspect: "closest_listing",
              payload: closestListing,
            });
          },
          (error) => {
            // setMyLocation({
            //   latitude: "err-latitude",
            //   longitude: "err-longitude"
            // });
          }
        );
        dispatch({
          type: UPDATE_SESSION_REDUCER,
          aspect: "geolocation_watch_id",
          payload: watchId,
        });
      } else {
        dispatch({
          type: UPDATE_SESSION_REDUCER,
          aspect: "browser_location",
          payload: {
            lat: null,
            lng: null,
            searching: true,
          },
        });
      }
    }
  };

  return (
    <IconButton
      color={myLocation ? "secondary" : "default"}
      className={classes.root}
      aria-label="My Location"
      onClick={handleClick}
    >
      <MyLocationIcon />
    </IconButton>
  );
};

export default MyLocationButton;
