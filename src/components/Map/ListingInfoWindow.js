import React, { useState, memo } from "react";
import PropTypes from "prop-types";
import { InfoWindow } from "@react-google-maps/api";
import { makeStyles } from "@material-ui/core";
import { getOG } from "../../util/functions";

const defaultStyles = {
  root: {
    maxHeight: "5rem",
    width: "100%",
    // paddingTop: "56.25%"
  },
};
const DEFAULT_IMAGE = "http://placeimg.com/89/50/arch";

const ListingInfoWindow = memo(({ activeListing }) => {
  const [ogImage, setogImage] = useState(null);
  const classes = makeStyles(defaultStyles);
  if (!activeListing) {
    return null;
  }
  const handleImageError = (e) => {
    // modify db to remove the image url for this listing _id
    //get opengraph image and save src instead
    // setogImage("./img/loading.gif");
    let img = e;
    img.onerror = null;
    !url
      ? setogImage(DEFAULT_IMAGE)
      : getOG(url).then((data) => {
          setogImage(data);
        });
  };
  const { name, image, url, description, location } = activeListing;
  if (!location) {
    return null;
  }
  let loc = location.split(",");
  let locObj = { lat: parseFloat(loc[0]), lng: parseFloat(loc[1]) };

  const hasImage = (image) => {
    return !image ? DEFAULT_IMAGE : ogImage || image?.url;
  };

  return (
    <InfoWindow
      position={locObj}
      options={{ pixelOffset: { height: -30, width: 0 } }}
    >
      <div className="App-infowindow">
        <h5>{name}</h5>
        <div className={classes.root}>
          <img
            src={hasImage(image)}
            onError={handleImageError}
            alt={name}
          />
        </div>
        {description}
      </div>
    </InfoWindow>
  );
});

ListingInfoWindow.propTypes = {
  activeListing: PropTypes.object,
};

export default ListingInfoWindow;
