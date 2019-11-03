import React from "react";
import PropTypes from "prop-types";
import { InfoWindow } from "@react-google-maps/api";
const ListingInfoWindow = ({ data, position }) => {
  let loc = position.split(",");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };

  return (
    <InfoWindow
      position={locObj}
      options={{
        pixelOffset: { height: -30, width: 0 }
      }}
    >
      <div className="App-infowindow">
        <h5>{data.name}</h5>
        <img
          src={data.image ? data.image.url : "http://placeimg.com/89/50/arch"}
          height="50px"
          alt={data.name}
        />
      </div>
    </InfoWindow>
  );
};

ListingInfoWindow.propTypes = {
  data: PropTypes.object,
  position: PropTypes.string
};

export default ListingInfoWindow;
