import React from "react";
import { InfoWindow } from "@react-google-maps/api";
import CondensedCard from "./CondensedCard";
import "./ListingInfoWindow.scss"
import { LinearProgress } from "@material-ui/core";

const ListingInfoWindow = ({ activeListing }) => {
  const { location } = activeListing;
  let loc = location.split(",");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };

  return (
    <InfoWindow
      position={locObj}
      options={{
        pixelOffset: { height: -30, width: 0 },
        disableAutoPan: true
      }}
    >
      {activeListing ? (
        <div className="App-infowindow">
          <CondensedCard activeListing={activeListing} />
        </div>
      ) : <LinearProgress/>}
    </InfoWindow>
  );
};


export default React.memo(ListingInfoWindow);
