import React, { memo } from "react";

import { Marker } from "@react-google-maps/api";

const MyMarker = React.memo(({
  data,
  clusterer,
  setisDrawerOpen,
  setisInfoWindowOpen,
  setactiveListing,
  // selectedCategories
}) => {
  const { location, coordinates, _id } = data;
  let locObj;

  if (coordinates && coordinates.coordinates) {
    locObj = {
      lat: coordinates.coordinates[1],
      lng: coordinates.coordinates[0],
    };
  } else if (location) {
    const loc = location.split(",");
    locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  } else {
    locObj = { lat: 50.60982, lng: -1.34987 };
  }

  let image = {
    url: "/img/map/orange_marker_sm.png",
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
      onMouseOver={handleMouseOverMarker}
      onMouseOut={handleMouseOut}
      onClick={handleClickMarker}
      // visible={categories.some((el) => selectedCategories.has(el))} //check for if category matches selected categories
    />
  );
});

export default memo(MyMarker);
