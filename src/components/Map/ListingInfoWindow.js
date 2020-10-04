import React from "react";
import PropTypes from "prop-types";
import { InfoWindow } from "@react-google-maps/api";
const ListingInfoWindow = ({ activeListing, position }) => {
  let loc = position.split(",");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  const { name, image } = activeListing;

  return (
    <InfoWindow
      position={locObj}
      options={{
        pixelOffset: { height: -30, width: 0 }
      }}
    >
      <div className="App-infowindow">
        <h5>{name}</h5>
        <img
          src={image ? image.url : "http://placeimg.com/89/50/arch"}
          height="50px"
          alt={name}
        />
      </div>
    </InfoWindow>
  );
};

ListingInfoWindow.propTypes = {
  activeListing: PropTypes.object,
  position: PropTypes.string
};

export default ListingInfoWindow;
