import React from "react";
import { Autocomplete } from "@react-google-maps/api";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";

import MenuIcon from "@material-ui/icons/Menu";
import SearchIcon from "@material-ui/icons/Search";
import DirectionsIcon from "@material-ui/icons/Directions";
import MyLocationButton from "./MyLocationButton";

const useStyles = makeStyles({
  root: {
    position: "relative",
    zIndex: 1100,
    margin: "6px 0",
    padding: "1px 3px",
    display: "flex",
    alignItems: "center",
    width: "23rem",
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: 10,
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4,
  },
});

const MapAutoComplete = ({ listings, mapInstance }) => {
  const classes = useStyles();
  let count = listings.length;

  return (
    <Autocomplete style={{  }}>
      <Paper className={classes.root}>
        <IconButton className={classes.iconButton} aria-label="Menu">
          <MenuIcon />
        </IconButton>
        <InputBase
          className={classes.input}
          placeholder={`Search ${count} Listings...`}
          inputProps={{ "aria-label": "Search The MOBB" }}
        />
        <IconButton className={classes.iconButton} aria-label="Search">
          <SearchIcon />
        </IconButton>
        <Divider className={classes.divider} />
        <IconButton
          color="inherit"
          className={classes.iconButton}
          aria-label="Directions"
        >
          <DirectionsIcon />
        </IconButton>
        <Divider className={classes.divider} />
        <MyLocationButton listings={listings} mapInstance={mapInstance} />
      </Paper>
    </Autocomplete>
  );
};

export default MapAutoComplete;
