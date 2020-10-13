import React, { useState } from "react";
import PropTypes from "prop-types";
import { makeStyles, LinearProgress } from "@material-ui/core";
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
  const [imgError, setImgError] = useState(false);
  const handleImageError = (e) => {
    // modify db to remove the image url for this listing _id
    //get opengraph image and save src instead
    setogImage("https://www.wallies.com/filebin/images/loading_apple.gif")
    let img = e;
    img.onerror = null;
    !url? setogImage(DEFAULT_IMAGE) : getOG(url).then((data) => {setogImage(data); setImgError(false)});
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
  image: PropTypes.string | undefined,
  name: PropTypes.string,
  url: PropTypes.string
};

export default ListingImage;
