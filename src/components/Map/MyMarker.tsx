import { Marker } from "@vis.gl/react-google-maps";
import { memo, useEffect, useState } from "react";
import { Listing } from "@/db/Types";

interface MyMarkerProps {
  data: Listing;
  clusterer?: any;
  setisDrawerOpen: (open: boolean) => void;
  setisInfoWindowOpen: (open: boolean) => void;
  setactiveListing: (listing: Listing) => void;
  visible: boolean;
}

const MyMarker = ({
  data,
  clusterer,
  setisDrawerOpen,
  setisInfoWindowOpen,
  setactiveListing,
  visible,
}: MyMarkerProps) => {
  const { location, coordinates, _id } = data;
  let locObj: { lat: number; lng: number };

  if (coordinates && coordinates.coordinates && coordinates.coordinates.length > 1) {
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

  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (!marker || !clusterer) return;
    
    if (visible) {
      clusterer.addMarker(marker);
    } else {
      clusterer.removeMarker(marker);
    }
    
    return () => {
      clusterer.removeMarker(marker);
    };
  }, [marker, clusterer, visible]);

  if (!visible) return null;

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
      ref={setMarker}
      position={locObj}
      onMouseOver={handleMouseOverMarker}
      onMouseOut={handleMouseOut}
      onClick={handleClickMarker}
      icon={{ url: "/img/map/orange_marker_sm.png" }}
    />
  );
};

export default memo(MyMarker);
