import { Listing } from "@/db/Types";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { memo, useEffect, useState } from "react";

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
    <AdvancedMarker
      ref={setMarker}
      position={locObj}
      onClick={handleClickMarker}
      onMouseEnter={handleMouseOverMarker}
      onMouseLeave={handleMouseOut}
    >
      <img src="/img/map/orange_marker_sm.png" alt="Marker" width={32} height={32} />
    </AdvancedMarker>
  );
};

export default memo(MyMarker);
