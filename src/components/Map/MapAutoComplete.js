import React from "react";
import { useSelector } from 'react-redux';
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
    top: "3rem",
    margin: "3px",
    padding: "1px 3px",
    display: "flex",
    alignItems: "center",
    width: "23rem"
  },
  input: {
    marginLeft: 8,
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    width: 1,
    height: 28,
    margin: 4
  }
});

const MapAutoComplete = () => {
  const classes = useStyles();
  const listings = useSelector(state => state.listings)
  let count = listings.byId.length;

  return (
    <Autocomplete style={{ backgroundColor: "#fff" }}>
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
          color="disabled"
          className={classes.iconButton}
          aria-label="Directions">
          <DirectionsIcon />
        </IconButton>
        <Divider className={classes.divider} />
        <MyLocationButton />
      </Paper>
    </Autocomplete>
  );
};

export default MapAutoComplete;
