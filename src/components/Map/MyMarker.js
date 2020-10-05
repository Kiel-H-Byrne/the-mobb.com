import React from "react";

import { Marker } from "@react-google-maps/api";

const MyMarker = React.memo(({
  data,
  clusterer,
  setisDrawerOpen,
  setisInfoWindowOpen,
  setactiveListing,
}) => {
  let loc;
  const { location, _id } = data;
  location ? (loc = location.split(",")) : (loc = "50.60982,-1.34987");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  let image = {
    url: "img/map/orange_marker_sm.png",
  };

  const handleMouseOverMarker = () => {
    setactiveListing(data);
    setisInfoWindowOpen(true);
  };
  const handleMouseOut = () => {
    setisInfoWindowOpen(false)
  }
  const handleClickMarker = () => {
    setactiveListing(data)
    setisDrawerOpen(true);
  };
  return (
    <Marker
      className="App-marker"
      key={_id}
      position={locObj}
      clusterer={clusterer}
      icon={image}
      onMouseOver={() => handleMouseOverMarker()}
      onMouseOut={() => handleMouseOut()}
      onClick={() => handleClickMarker()}
    />
  );
});

export default MyMarker;
