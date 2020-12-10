import React, { useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Drawer, Button, Grid, Typography } from "@material-ui/core";
import DirectionsIcon from "@material-ui/icons/Directions";
import ListingImage from "../ListingImage";
import { Listing } from '../../db/Types';
import { placesSearch } from '../../util/functions';

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
  isOpen: boolean,
  setOpen: () => boolean
}
const SideDrawer = ({ activeListing, isOpen, setOpen }: OwnProps) => {
  const classes = useStyles();

  useEffect(() => {
    if (!activeListing.google_id) {
      //if no google_id, get one and update document.
      placesSearch({name: activeListing.name, location: activeListing.location})
      //
    } else {
      //if has google id, get placeDetails and set as prop.
    }
  }, []);

  const toggleDrawer = (open) => event => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setOpen(open);
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
  const sideList = ({ image, url, address, description, name, phone }) => (
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
  );

    return (
      <Drawer
        anchor="left"
        open={isOpen}
        onClose={toggleDrawer(false)}
      >
        {sideList("left", activeListing)}
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
