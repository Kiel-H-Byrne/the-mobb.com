import React from "react";
import { Card, Button } from "@mui/material";
import DirectionsIcon from "@mui/icons-material/DirectionsTwoTone";
import style from "./ClosestCard.module.scss";

const ClosestCard = ({ closestListing }) => {
  //onclick  set openlisting to this id.
  //pan to location of listing on map
  //onClick of button, open directions to this listing.
  const {
    address,
    city,
    state,
    url,
    phone,
    name,
    location,
    image,
  } = closestListing;
  const divStyle = {
    background: `radial-gradient(circle at top left, rgba(22, 15, 77, 0.6), rgba(086,082,080, 0.6)), url(${image.url})`,
  };
  
  return (
    <div className={style.root}>
      <Card className={style.card_closest} style={divStyle}>
        <h6 className="card-title center-align">{name}</h6>
        <p className="center-align address">
          {address ? (
            <span>{address}</span>
          ) : (
            <span>
              {city}, {state}
            </span>
          )}
        </p>
        <div className={style.footer}>
          {url && (
            <a
              target="_blank"
              rel="noopener noreferrer"
              title="Website"
              href={url}
            >
              <i className="material-icons">link</i>
            </a>
          )}
          {phone && (
            <a href={`tel:+1${phone}`}>
              <i className="material-icons">phone</i>
            </a>
          )}
          <Button>
            <i className="material-icons">info_outline</i>
          </Button>
        </div>
        <Button
          size="large"
          color="primary"
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/Current+Location/${location}`
            )
          }
        >
          <DirectionsIcon className="large material-icons" />
        </Button>
      </Card>
    </div>
  );
};

export default ClosestCard;
