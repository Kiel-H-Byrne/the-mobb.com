import React from "react";
import PropTypes from "prop-types";
import { Avatar } from "@material-ui/core";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import MapFilter from "../Map/MapFilter";

const navListings = ["About", "Add Business", "Login"];

const Nav = ({ listings, categories }) => {
  return (
    <AppBar position="static" className="App-header">
      <Toolbar>
        <Avatar />
        <ul>
          {navListings.map((listing, index) => (
            <li>{listing}</li>
          ))}
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
