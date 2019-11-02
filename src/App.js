import React, { Component } from 'react';
import { compose } from "redux";
import { connect } from "react-redux";

import * as ACTIONS from "./actions/actionConstants";

import './App.scss';
import AppMap from './components/Map/AppMap';
import PrimarySearchAppBar from './components/Nav/Nav.js';
import AppDrawer from './components/SideDrawer/SideDrawer'

class App extends Component { 
  
  componentDidMount() {
    this.props.getAllListings();
  }
  
  render() {
    const { listings, state } = this.props;
    return (
        <div className="App"> 
          <PrimarySearchAppBar suggestions={listings}/>
          <AppDrawer />
          <AppMap listingsData={listings} />
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
  getAllListings: () => dispatch({ type: ACTIONS.LISTINGS_API_REQUEST }),
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(App);