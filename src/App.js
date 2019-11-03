import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { Grid } from "@material-ui/core";
import * as ACTIONS from "./actions/actionConstants";

import "./App.scss";
import AppMap from "./components/Map/AppMap";
import Nav from "./components/Nav/Nav.js";
import SideDrawer from "./components/SideDrawer/SideDrawer";

class App extends Component {
  componentDidMount() {
    this.props.getAllListings();
  }

  render() {
    const { listings, state } = this.props;
    const activeListing = state.listings.activeListing;

    return (
      <div className="App_wrapper">
        <SideDrawer activeListing={activeListing} />
        <Grid container>
          <Nav searchSuggestions={listings} />
          <AppMap listingsData={listings} />
        </Grid>
      </div>
    );
  }
}

//Connect
const mapStateToProps = state => ({
  state,
  listings: state.listings.byId
});

const mapDispatchToProps = dispatch => ({
  dispatch,
  getAllListings: () => dispatch({ type: ACTIONS.LISTINGS_API_REQUEST })
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(App);
