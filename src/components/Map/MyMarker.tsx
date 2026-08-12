import { Listing } from "@/db/Types";
import { AdvancedMarker } from "@vis.gl/react-google-maps";
import { memo, useEffect, useState } from "react";

interface MyMarkerProps {
  data: Listing;
  locationData?: any;
  clusterer?: any;
  setisDrawerOpen: (open: boolean) => void;
  setisInfoWindowOpen: (open: boolean) => void;
  setactiveListing: (listing: Listing) => void;
}

const MyMarker = ({
  data,
  locationData,
  clusterer,
  setisDrawerOpen,
  setisInfoWindowOpen,
  setactiveListing,
}: MyMarkerProps) => {
  let coordinatesToUse = locationData?.coordinates || data.coordinates;

  // Fallback to places_details location if available
  if (!coordinatesToUse && (data.places_details as any)?.location) {
    const loc = (data.places_details as any).location;
    if (loc.lat && loc.lng) {
      coordinatesToUse = {
        type: "Point",
        coordinates: [loc.lng, loc.lat], // Convert to [lng, lat] format
      };
    }
  }

  const _id = data._id;

  if (
    !coordinatesToUse ||
    !coordinatesToUse.coordinates ||
    coordinatesToUse.coordinates.length < 2
  ) {
    return null;
  }

  const locObj = {
    lat: coordinatesToUse.coordinates[1],
    lng: coordinatesToUse.coordinates[0],
  };

  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (!marker || !clusterer) return;

    // Add marker without triggering immediate redraw
    clusterer.addMarker(marker, true);
    
    // Debounce the clusterer render to prevent O(n) repaints when rendering many markers
    if ((window as any).clustererTimeout) {
      clearTimeout((window as any).clustererTimeout);
    }
    (window as any).clustererTimeout = setTimeout(() => {
      clusterer.render();
    }, 50);

    return () => {
      clusterer.removeMarker(marker, true);
      if ((window as any).clustererTimeout) {
        clearTimeout((window as any).clustererTimeout);
      }
      (window as any).clustererTimeout = setTimeout(() => {
        clusterer.render();
      }, 50);
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
