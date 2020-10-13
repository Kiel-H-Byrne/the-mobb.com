import React from "react";
import PropTypes from "prop-types";
import { InfoWindow } from "@react-google-maps/api";
import ListingImage from "../ListingImage";
import { LinearProgress } from "@material-ui/core";

const ListingInfoWindow = ({ activeListing }) => {
  if (!activeListing) {
    return <LinearProgress />
  }
  const { name, image, url, description, location } = activeListing;
  let loc = location.split(",");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };
  const iwOptions = {
    pixelOffset: { height: -30, width: 0 },
  }
  return (
    <InfoWindow
      position={locObj}
      options={iwOptions}
    >
      <div className="App-infowindow">
        <h5>{name}</h5>
        <ListingImage image={image} name={name} url={url}/>
        {description}
      </div>
    </InfoWindow>
  );
};

ListingInfoWindow.propTypes = {
  activeListing: PropTypes.object,
};

export default ListingInfoWindow;
