import React from "react";
import PropTypes from "prop-types";
import { Avatar } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MapFilter from "../Map/MapFilter";

const Nav = ({ listings, categories }) => {
  // const categories = listings
  //   ? Object.values(listings).filter(el => el.categories)
  //   : [];
  return (
    <AppBar position="static" className="App-header">
      <Toolbar>
        <Avatar />
        <ul>
          <li>About</li>
          <li>Add Business</li>
          <li>Login</li>
        </ul>
        <MapFilter listings={listings} categories={categories} />
      </Toolbar>
    </AppBar>
  );
};

Nav.propTypes = {
  listings: PropTypes.object
};

export default Nav;
