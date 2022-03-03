import React from "react";
import { Card, Button, Icon, IconButton } from "@mui/material";
import DirectionsIcon from "@mui/icons-material/DirectionsTwoTone";
import style from "./ClosestCard.module.scss";
import {
  InfoOutlined,
  DirectionsTwoTone,
  PhoneTwoTone,
  LinkTwoTone,
} from "@mui/icons-material";

const ClosestCard = ({ closestListing }) => {
  //onclick  set openlisting to this id.
  //pan to location of listing on map
  //onClick of button, open directions to this listing.
  const { address, city, state, url, phone, name, location, image } =
    closestListing;
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
              <IconButton>
                <LinkTwoTone />
              </IconButton>
            </a>
          )}
          {phone && (
            <a href={`tel:+1${phone}`}>
              <IconButton>
                <PhoneTwoTone />
              </IconButton>
            </a>
          )}
          <IconButton>
            <InfoOutlined />
          </IconButton>
        </div>
        <IconButton
          size="large"
          color="primary"
          onClick={() =>
            window.open(
              `https://www.google.com/maps/dir/Current+Location/${location}`
            )
          }
        >
          <DirectionsIcon className="large material-icons" />
        </IconButton>
      </Card>
    </div>
  );
};

export default ClosestCard;
