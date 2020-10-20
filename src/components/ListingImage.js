import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/core";
import { getOG } from "../util/functions";

const defaultStyles = {
  root: {
    maxHeight: "5rem",
    width: "100%",
    // paddingTop: "56.25%"
  }
};
const DEFAULT_IMAGE = "http://placeimg.com/89/50/arch";

const ListingImage = ({ image, name, url }) => {
  const classes = makeStyles(defaultStyles);
  const [ogImage, setogImage] = useState(null);
  const handleImageError = (e) => {
    // modify db to remove the image url for this listing _id
    //get opengraph image and save src instead
    let img = e;
    img.onerror = null;
    !url? setogImage(DEFAULT_IMAGE) : getOG(url).then((data) => setogImage(data));
  };
  return (
    <div className={classes.root}>
      <img
        src={!image ? DEFAULT_IMAGE : ogImage || (image && image.url)}
        onError={(e) => handleImageError(e)}
        alt={name}
      />
    </div>
  );
};

ListingImage.propTypes = {
  image: PropTypes.object,
  name: PropTypes.string,
  url: PropTypes.string
};

export default ListingImage;
