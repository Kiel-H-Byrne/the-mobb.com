import React, { Component } from "react";
import { compose } from "redux";
import { connect } from "react-redux";

import { Grid, LinearProgress } from "@material-ui/core";
import * as ACTIONS from "./actions/actionConstants";

import "./App.scss";
import AppMap from "./components/Map/AppMap";
import Nav from "./components/Nav/Nav.js";
import SideDrawer from "./components/SideDrawer/SideDrawer";

class App extends Component {
  componentDidMount() {
    //CALLS AND PLACES IN STORE
    this.props.getAllListings();
    this.props.getAllCategories();
  }

  render() {
    const { listings, state, categories } = this.props;
    const activeListing = state.listings.activeListing;
    if (!listings)
      return (
        <div>
          <LinearProgress />
        </div>
      );

    return (
      <div className="App_wrapper">
        <SideDrawer activeListing={activeListing} />
        <Grid container>
          <Nav listings={listings} categories={categories} />
          <AppMap listings={listings} />
        </Grid>
      </div>
    );
  }
}

//Connect
const mapStateToProps = state => ({
  state,
  listings: state.listings.byId,
  categories: state.categories.byId
});

const mapDispatchToProps = dispatch => ({
  dispatch,
  getAllListings: () => dispatch({ type: ACTIONS.LISTINGS_API_REQUEST }),
  getAllCategories: () => dispatch({ type: ACTIONS.CATEGORIES_API_REQUEST })
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(App);
