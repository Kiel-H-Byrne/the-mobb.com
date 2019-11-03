import React from "react";
import PropTypes from "prop-types";

import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";

const Nav = ({ searchSuggestions }) => {
  return (
    <AppBar position="static" className="App-header">
      <Toolbar>[LOGO] - - - [NavList] - [Filter] - [Search]</Toolbar>
    </AppBar>
  );
};

Nav.propTypes = {
  searchSuggestions: PropTypes.object
};

export default Nav;
