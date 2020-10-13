import React from "react";

import { Marker } from "@react-google-maps/api";
import { useGlobalState } from "../../state";

const MyMarker = React.memo(({
  data,
  clusterer,
  setIsInfoWindowOpen,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useGlobalState('isDrawerOpen')
  const [active_listing, setActiveListing] = useGlobalState('active_listing')

  let loc;
  const { location, _id } = data;
  location ? (loc = location.split(",")) : (loc = "50.60982,-1.34987");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  let image = {
    url: "img/map/orange_marker_sm.png",
  };

  const handleMouseOverMarker = () => {
    setActiveListing(data);
    setIsInfoWindowOpen(true);
  };
  const handleMouseOut = () => {
    setIsInfoWindowOpen(false)
  }
  const handleClickMarker = () => {
    if (!isDrawerOpen) {
      setActiveListing(data);
    setIsDrawerOpen(true);
    } 
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
