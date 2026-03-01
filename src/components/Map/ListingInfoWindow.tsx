import { css } from "@styled/css";
import { InfoWindow } from "@vis.gl/react-google-maps";
import React from "react";
import CondensedCard from "./CondensedCard";

const ListingInfoWindow = ({ activeListing }) => {
  const { coordinates } = activeListing;
  let loc = coordinates.coordinates;
  let locObj = { lat: loc[1], lng: loc[0] };

  return (
    <InfoWindow
      position={locObj}
      pixelOffset={[0, -30]}
    >
      {activeListing ? (
        <div className={css({
          height: "250px",
          maxWidth: "250px",
          color: "black",
          padding: "0",
        })}>
          <CondensedCard activeListing={activeListing} />
        </div>
      ) : (
        <div className={css({
          width: "100%",
          height: "4px",
          backgroundColor: "rgba(251, 176, 59, 0.2)",
          position: "relative",
          overflow: "hidden",
        })}>
          <div className={css({
            position: "absolute",
            height: "100%",
            backgroundColor: "brand.orange",
            width: "30%",
            left: "-30%",
            animation: "linearProgress 2s infinite linear",
          })} />
        </div>
      )}
    </InfoWindow>
  );
};

export default React.memo(ListingInfoWindow);
