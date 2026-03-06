import { Listing } from "@/db/Types";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { memo, useEffect, useState } from "react";

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
  const { coordinates, _id } = data;

  if (
    !coordinates ||
    !coordinates.coordinates ||
    coordinates.coordinates.length < 2
  ) {
    return null;
  }

  const locObj = {
    lat: coordinates.coordinates[1],
    lng: coordinates.coordinates[0],
  };

  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (!marker || !clusterer) return;

    clusterer.addMarker(marker);

    return () => {
      clusterer.removeMarker(marker);
    };
  }, [marker, clusterer]);

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
      <img
        src="/img/map/orange_marker_sm.png"
        alt="Marker"
        width={32}
        height={32}
      />
    </AdvancedMarker>
  );
};

export default memo(MyMarker);
