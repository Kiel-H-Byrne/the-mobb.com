import React from "react";
import { Autocomplete } from "@react-google-maps/api";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";

import SearchIcon from "@material-ui/icons/Search";
import MyLocationButton from "./MyLocationButton";
import CategoryFilter from "./CategoryFilter";
import MapFilter from "./MapFilter";

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 1100,
    margin: ".5rem",
    display: "flex",
    maxWidth: "23rem",
  },
  flexItem: {
    display: "flex",
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    // padding: 10,
  },
  divider: {
    width: 1,
    height: 28,
    margin: 3,
    verticalAlign: "",
  },
  hideDesktop: {
    flexShrink: 1,
    [theme.breakpoints.up("sm")]: {
      display: "none",
    },
  },
  hideMobile: {
    // flexGrow: 1,
    [theme.breakpoints.down("xs")]: {
      display: "none",
    },
  },
}));

const MapNav = ({
  categories,
  listings,
  mapInstance,
  selected_categories,
  setselected_categories,
}) => {
  const classes = useStyles();
  let count = listings.length;

  return (
    <Autocomplete>
      <Paper className={classes.root}>
        <div className={classes.flexItem}>
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
            aria-label="Filter"
          >
            {/* <MapFilter listings={listings} categories={categories} /> */}
            <CategoryFilter
              listings={listings}
              categories={categories}
              selected_categories={selected_categories}
              setselected_categories={setselected_categories}
            />
          </IconButton>
          <Divider className={classes.divider} />
          <MyLocationButton listings={listings} mapInstance={mapInstance} />
        </div>
      </Paper>
    </Autocomplete>
  );
};

export default MapNav;