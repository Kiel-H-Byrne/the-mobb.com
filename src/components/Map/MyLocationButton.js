import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { makeStyles } from "@material-ui/styles";
import { IconButton } from "@material-ui/core";
import MyLocationIcon from "@material-ui/icons/MyLocationTwoTone";
import { UPDATE_SESSION_REDUCER } from "./../../actions/actionConstants";

const useStyles = makeStyles({
  root: {}
});

const MyLocationButton = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const myLocation = useSelector(state => state.session.browser_location);
  const geoWatchId = useSelector(state => state.session.geolocation_watch_id);

  useEffect(() => {
    //do nothing, then cleanup
    return () => {
      console.log("cleanup", geoWatchId);
      if (geoWatchId) {
        window.navigator.geolocation.clearWatch(geoWatchId);
      }
    };
  }, [geoWatchId]);

  const handleClick = () => {
    const location = window.navigator && window.navigator.geolocation;

    if (location) {
      const watchId = location.watchPosition(
        position => {
          dispatch({
            type: UPDATE_SESSION_REDUCER,
            aspect: "browser_location",
            payload: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        error => {
          // setMyLocation({
          //   latitude: "err-latitude",
          //   longitude: "err-longitude"
          // });
        }
      );
      dispatch({
        type: UPDATE_SESSION_REDUCER,
        aspect: "geolocation_watch_id",
        payload: watchId
      });
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
