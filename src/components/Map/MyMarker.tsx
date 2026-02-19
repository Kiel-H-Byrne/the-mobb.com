import React, { memo } from "react";
import { Marker } from "@react-google-maps/api";
import { Listing } from "../../db/Types";

interface MyMarkerProps {
  data: Listing;
  clusterer?: any;
  setisDrawerOpen: (open: boolean) => void;
  setisInfoWindowOpen: (open: boolean) => void;
  setactiveListing: (listing: Listing) => void;
}

const MyMarker = ({
  data,
  clusterer,
  setisDrawerOpen,
  setisInfoWindowOpen,
  setactiveListing,
}: MyMarkerProps) => {
  const { location, coordinates, _id } = data;
  let locObj: { lat: number; lng: number };

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

  const image = {
    url: "/img/map/orange_marker_sm.png",
  };

  const handleMouseOverMarker = () => {
    setactiveListing(data);
    setisInfoWindowOpen(true);
  };
  const handleMouseOut = () => {
    setisInfoWindowOpen(false);
  };
  const handleClickMarker = () => {
    setactiveListing(data);
    setisDrawerOpen(true);
  };

  return (
    <Marker
      key={_id}
      position={locObj}
      clusterer={clusterer}
      icon={image}
      onMouseOver={handleMouseOverMarker}
      onMouseOut={handleMouseOut}
      onClick={handleClickMarker}
    />
  );
};

export default memo(MyMarker);
