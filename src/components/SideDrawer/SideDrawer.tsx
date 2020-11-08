import React, { useEffect, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Drawer, Button, Grid, Typography } from "@material-ui/core";
import DirectionsIcon from "@material-ui/icons/Directions";
import ListingImage from "../ListingImage";
import { getPlaceDetails } from '../../util/functions';
import { Listing } from '../../db/Types';

const useStyles = makeStyles({
  root: {
    width: "16rem"
  },
  fullList: {
    padding: "1rem",
    width: "auto"
  },
  media: {
    // height: "11rem",
    width: "100%"
    // paddingTop: "56.25%"
  },
  button: {
    margin: "auto"
  }
});

interface OwnProps {
  activeListing: Listing,
  isOpen : boolean
  setOpen: (key) => boolean
}

const SideDrawer = ({ activeListing, isOpen, setOpen }: OwnProps) => {
  const classes = useStyles();
  const [listingDetails, setListingDetails] = useState(null)
  useEffect(() => {
    const details =
      activeListing.google_id && getPlaceDetails(activeListing.google_id);
    setListingDetails(details as any);
  }, []);
  const toggleDrawer = (isOpen: boolean) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setOpen(isOpen);
  };
  /*
address: "2729 Piatt St, Wichita, KS 67219"
categories: ["Health & Wellness"]
country: "US"
creator: "THQMGTjrvtYww8MvA"
description: "Want to help others make Total Life Changes?"
image: {url: "https://shop.totallifechanges.com/Content/images/Logos/footerlogo.png"}
location: "37.7332579,-97.3121848"
name: "Independent Total Life Changes Distributor"
phone: "3163904404"
submitted: {$date: "2017-09-04T22:49:18.696Z"}
url: "http://www.totallifechanges.com/6923871"
_id: "3Nh99P2JxxCpBGm5v"
*/
  const sideList = (activeListing: Listing) => {
    const { image, url, address, description, name, phone } = activeListing;
    return (
    <Grid
      container
      direction="column"
      alignContent="stretch"
      className={classes.root + " App_drawer"}
      role="presentation"
    >
      <Grid item>
        <a href={url}>
          <ListingImage image={image} name={name} url={url} />
        </a>
      </Grid>
      <Grid item>
        <article>
          <Typography variant="subtitle1">{name}</Typography>
          <Typography variant="caption">{description}</Typography>
          <address>
            <Typography variant="overline">{phone}</Typography>
            <Typography variant="body1">{address}</Typography>
          </address>
        </article>
      </Grid>
      <Grid item>
        <Button
          fullWidth
          className={classes.button}
          variant="contained"
          startIcon={<DirectionsIcon />}
        >
          Get Directions
        </Button>
      </Grid>
    </Grid>
  )};

    return (
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
      >
        {sideList(activeListing)}
      </Drawer>
    );
};

/* 
-image
-details
-socialmedia
-cta/directions
-actions(save,favorite,bookmark, )
-google place details (yelp details & others?)

*/

export default SideDrawer;
