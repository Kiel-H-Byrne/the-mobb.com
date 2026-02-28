import React from "react";
import DirectionsIcon from "@mui/icons-material/DirectionsTwoTone";
import {
  InfoOutlined,
  PhoneTwoTone,
  LinkTwoTone,
} from "@mui/icons-material";
import { css } from "@styled/css";

const ClosestCard = ({ closestListing }) => {
  const { address, city, state, url, phone, name, location, image } =
    closestListing;
  
  const divStyle = {
    background: `radial-gradient(circle at top left, rgba(22, 15, 77, 0.6), rgba(86, 82, 80, 0.6)), url(${image.url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  };

  return (
    <div className={css({
      position: "fixed",
      bottom: "20",
      left: "50%",
      transform: "translateX(-50%)",
      width: "90%",
      maxWidth: "400px",
      zIndex: "1000",
    })}>
      <div 
        className={css({
          borderRadius: "lg",
          overflow: "hidden",
          color: "white",
          boxShadow: "xl",
          padding: "4",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        })}
        style={divStyle}
      >
        <h6 className={css({ fontSize: "lg", fontWeight: "bold", margin: "0" })}>{name}</h6>
        <p className={css({ fontSize: "sm", marginY: "2" })}>
          {address ? (
            <span>{address}</span>
          ) : (
            <span>
              {city}, {state}
            </span>
          )}
        </p>
        <div className={css({ display: "flex", gap: "2", marginTop: "2" })}>
          {url && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              title="Website"
              href={url}
              className={css({ color: "white" })}
            >
              <LinkTwoTone />
            </a>
          )}
          {phone && (
            <a href={`tel:+1${phone}`} className={css({ color: "white" })}>
              <PhoneTwoTone />
            </a>
          )}
          <div className={css({ cursor: "pointer" })}>
            <InfoOutlined />
          </div>
        </div>
        <button
          className={css({
            marginTop: "4",
            backgroundColor: "brand.orange",
            color: "white",
            border: "none",
            borderRadius: "full",
            padding: "3",
            cursor: "pointer",
            boxShadow: "md",
            _hover: { backgroundColor: "brand.orangeDark" },
          })}
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/Current+Location/${location}`
            )
          }
        >
          <DirectionsIcon />
        </button>
      </div>
    </div>
  );
};

export default ClosestCard;
