import React, { useEffect, useState } from "react";
import {
  Drawer,
  Button,
  Grid,
  Typography,
  Fab,
  Divider,
  Snackbar,
} from "@material-ui/core";
import DirectionsIcon from "@material-ui/icons/DirectionsTwoTone";
import CallIcon from "@material-ui/icons/CallTwoTone";
import PublicIcon from "@material-ui/icons/PublicTwoTone";
import LinkIcon from "@material-ui/icons/LinkTwoTone";
import EditIcon from "@material-ui/icons/EditTwoTone";
import FingerprintIcon from "@material-ui/icons/FingerprintTwoTone";
import ShareIcon from "@material-ui/icons/ShareTwoTone";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUserTwoTone";
import WatchLaterIcon from "@material-ui/icons/WatchLaterTwoTone";
import StarIcon from "@material-ui/icons/StarTwoTone";
import RateReviewIcon from "@material-ui/icons/RateReviewTwoTone";
import ListingImage from "../ListingImage";
import FavoriteStar from "../FavoriteStar";
import { Listing } from "../../db/Types";
import { getGDetails } from "../../util/functions";
import { mCache } from "../../db/mlab";
import { Alert } from "@material-ui/lab";
import style from "./SideDrawer.module.scss";

interface ISideDrawer {
  activeListing: Listing;
  isOpen: boolean;
  mapInstance: any;
  setOpen: (prevOpen) => boolean;
}

const SideGrid = ({activeListing}) => {
  const {url, name, image, description, phone, address} = activeListing;
  return (
    <Grid container direction="column" className={style.root}>
      <Grid item>
        <a
          href={url}
          title="Listing Image"
          rel="noopener noreferrer"
          target="blank"
        >
          <ListingImage
            image={image}
            name={name}
            url={url}
            className="listing-image"
          />
        </a>
      </Grid>
      <Divider />
      <Grid item>
        <article className="card-title">
          <Typography variant="h3">{name}</Typography>
          <Typography variant="overline">{description}</Typography>
          <address className="card-content">
            <a href={`tel:${phone}`}>{phone}</a>
            <Typography variant="body1">{address}</Typography>
          </address>
        </article>
        <div>Hours if</div>
        <Fab color="primary" className="button_get-directions">
          <DirectionsIcon />
        </Fab>
      </Grid>
      <Divider />
      <Grid item className="inline-list actionBar">
      MoBB Actions      </Grid>
      <Divider />
      <Grid item>MoBB Actions</Grid>
      <Divider />
      <Grid item>Photos if</Grid>
      <Grid item>Reviews if</Grid>
    </Grid>
  );
}

const SideDrawer = ({
  activeListing,
  isOpen,
  setOpen,
  mapInstance,
}: ISideDrawer) => {
  

  const toggleDrawer = (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setOpen((prevOpen) => !prevOpen);
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

  return (
    <Drawer
      anchor="left"
      open={isOpen}
      onClose={(e) => toggleDrawer(e)}
    >
      {/* <SideList activeListing={activeListing} mapInstance={mapInstance} /> */}
      {/* <LegacyDrawer activeListing={activeListing} /> */}
      <SideGrid activeListing={activeListing} />
    </Drawer>
  );
};

const sliderPhoto = (photo) => {};
const openHours = () => true;
const verifyUI = () => {};
const authUser = () => true;
const isOwner = () => false;


export default SideDrawer;

/* <CarouselPhoto >
  <div class="place_photo carousel-item" style="background-image: url({getImgUrl photo_reference})">
    <img alt="image" src="/img/transparent.png" alt=""/>
  </div>
</CarouselPhoto>

<CarouselPhoto2 >
  <a class="place_photo carousel-item" style="">
    <img alt="image" src="{this}" />
  </a>
</CarouselPhoto2>

<SliderPhoto >
  <li>
        <img alt="image" src="{getImgUrl photo_reference}" />

  </li>  
</SliderPhoto> */