import React from "react";

import { Marker } from "@react-google-maps/api";
import { useDispatch } from "react-redux";
import * as ACTIONS from "./../../actions/actionConstants";

const MyMarker = ({
  data,
  clusterer,
}) => {
  const dispatch = useDispatch();

  const handleMouseOverMarker = (e, data) => {
    dispatch({ type: ACTIONS.SHOW_INFOWINDOW, payload: data });
  };

  const handleMouseExitMarker = () => {
    dispatch({ type: ACTIONS.SHOW_INFOWINDOW, payload: false });
  };
  let loc;
  data.location
    ? (loc = data.location.split(","))
    : (loc = "50.60982,-1.34987");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  let image = {
    url:
      "https://cdn0.iconfinder.com/data/icons/gloss-basic-icons-by-momentum/32/pin-red.png",
  };

  const handleClickMarker = (data) => {
    dispatch({ type: ACTIONS.SHOW_SIDEDRAWER, payload: data });
  };
  return (
    <Marker
      className="App-marker"
      key={data._id}
      position={locObj}
      clusterer={clusterer}
      data={data}
      icon={image}
      title={data.name}
      customData={JSON.stringify(data)}
      onMouseOver={m => handleMouseOverMarker(m, data)}
      onMouseOut={() => handleMouseExitMarker()}
      onClick={() => handleClickMarker(data)}
    />
  );
};

export default MyMarker;
