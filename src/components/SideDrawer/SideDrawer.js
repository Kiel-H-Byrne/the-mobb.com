import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { makeStyles } from "@material-ui/core/styles";

import { Drawer, Button, Grid, Typography } from "@material-ui/core";
import DirectionsIcon from "@material-ui/icons/Directions";

import * as ACTIONS from "../../actions/actionConstants";

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

const SideDrawer = ({ activeListing }) => {
  const classes = useStyles();
  // const [state, setState] = useState({
  //   left: false,
  //   bottom: false,
  //   right: false,
  // });
  const dispatch = useDispatch();
  const map = useSelector(state => state.map);
  // const router = useSelector(state => state.router);

  const toggleDrawer = (side, open) => event => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    // setState({ ...state, [side]: open });
    dispatch({ type: ACTIONS.SHOW_SIDEDRAWER, payload: false });
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
  const sideList = (
    side,
    { image, url, address, description, name, phone }
  ) => (
    <Grid
      container
      direction="column"
      alignContent="stretch"
      className={classes.root + " App_drawer"}
      role="presentation"
      onClick={toggleDrawer(side, false)}
      onKeyDown={toggleDrawer(side, false)}
    >
      <Grid item>
        <a href={url}>
          <img
            src={image ? image.url : "http://placeimg.com/89/50/arch"}
            className={classes.media}
            alt={name}
          />
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

  if (!!map.showSideDrawer) {
    return (
      <Drawer
        anchor="left"
        open={!!map.showSideDrawer}
        onClick={toggleDrawer()}
      >
        {sideList("left", map.showSideDrawer)}
      </Drawer>
    );
  } else {
    return null;
  }
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
