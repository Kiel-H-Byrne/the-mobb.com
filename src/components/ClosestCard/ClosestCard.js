import React from 'react'
import PropTypes from 'prop-types'
import { Card, Button } from '@material-ui/core';
import DirectionsIcon from "@material-ui/icons/DirectionsTwoTone";
import "./ClosestCard.scss";

const ClosestCard = ({closestListing}) => {
  //onclick  set openlisting to this id. 
  //pan to location of listing on map
  //onClick of button, open directions to this listing.
  const {address, city, state, url, phone, name, location} = closestListing;

  return (
    <div>
      <Card id="card_closest">
        <h6 className="card-title center-align">{name}</h6>
        <p className="center-align address">
          {address ? (
            <span>{address}</span>
          ) : (
            <span>
              {city}, {state}{" "}
            </span>
          )}
        </p>
        <div className="footer">
          {url && (
            <a
              className=""
              target="_blank"
              rel="noopener noreferrer"
              title="Website"
              href={url}
            >
              <i className="material-icons">link</i>
            </a>
          )}
          {phone && (
            <a className="" href={`tel:+1${phone}`}>
              <i className="material-icons">phone</i>
            </a>
          )}
          <Button>
            <i className="material-icons">info_outline</i>
          </Button>
        </div>
        <Button size="large" color="primary" onClick={() => window.open(`https://www.google.com/maps/dir/Current+Location/${location}`) }>
          <DirectionsIcon className="large material-icons">directions</DirectionsIcon>
        </Button>
      </Card>
    </div>
  );
}

ClosestCard.propTypes = {
  closestListing: PropTypes.object
}

export default ClosestCard
