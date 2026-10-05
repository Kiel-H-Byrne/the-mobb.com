import React, { useState } from "react";
import { getOG } from "@/util/functions";
import { Listing } from "@/db/Types";
import { css } from "@styled/css";

const DEFAULT_IMAGE = "/images/mobb_placeholder.png";

const ListingImage = ({ image, name, url, className }: Partial<Listing & { className?: string }>) => {
  const [ogImage, setogImage] = useState("");
  // Each fallback is tried once: listing image → OG lookup → placeholder.
  // Without this, a broken OG image re-triggers the lookup on every error.
  const [triedOG, setTriedOG] = useState(false);

  const handleImageError = async () => {
    if (ogImage === DEFAULT_IMAGE) return;
    if (!url || triedOG) {
      setogImage(DEFAULT_IMAGE);
      return;
    }
    setTriedOG(true);
    try {
      const data = await getOG(url);
      setogImage(typeof data === "string" && data ? data : DEFAULT_IMAGE);
    } catch {
      setogImage(DEFAULT_IMAGE);
    }
  };

  return image ? (
    <img
      src={ogImage || image.url || DEFAULT_IMAGE}
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
