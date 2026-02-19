import React from "react";
import { InfoWindow } from "@react-google-maps/api";
import CondensedCard from "./CondensedCard";
import { css } from "../../../styled-system/css";

const ListingInfoWindow = ({ activeListing }) => {
  const { location } = activeListing;
  let loc = location.split(",");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };

  return (
    //@ts-ignore
    <InfoWindow
      position={locObj}
      options={{
        pixelOffset: { height: -30, width: 0, equals: () => false } as any,
        disableAutoPan: false,
      }}
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
