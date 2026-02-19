import React, { useState } from "react";
import { getOG } from "../util/functions";
import { Listing } from '../db/Types';
import { css } from "../../styled-system/css";

const DEFAULT_IMAGE = "http://placeimg.com/89/50/arch";

const ListingImage = ({ image, name, url, className }: Partial<Listing & { className?: string }>) => {
  const [ogImage, setogImage] = useState("");

  const handleImageError = async (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    img.onerror = null;
    !url
      ? setogImage(DEFAULT_IMAGE)
      : await getOG(url).then((data) => setogImage(data));
  };

  return image ? (
    <img
      src={ogImage || image.url}
      onError={handleImageError}
      alt={name}
      title={name}
      className={css({
        width: "100%",
        display: "block",
        objectFit: "cover",
      }) + (className ? ` ${className}` : "")}
    />
  ) : null;
};

export default ListingImage;
