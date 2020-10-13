import React from "react";
import PropTypes from "prop-types";
import { InfoWindow } from "@react-google-maps/api";
import ListingImage from "../ListingImage";

const ListingInfoWindow = React.memo(({ activeListing} ) => {
  const { name, image, url, description, position } = activeListing;
  let loc = position.split(",");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };

  return (
    <InfoWindow
      position={locObj}
      options={{
        pixelOffset: { height: -30, width: 0 },
      }}
    >
      <div className="App-infowindow">
        <h5>{name}</h5>
        <ListingImage image={image} name={name} url={url}/>
        {description}
      </div>
    </InfoWindow>
  );
});

ListingInfoWindow.propTypes = {
  activeListing: PropTypes.object,
};

export default ListingInfoWindow;
