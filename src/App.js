import React, { Component } from 'react';
import { compose } from "redux";
import { connect } from "react-redux";

import * as ACTIONS from "./actions/actionConstants";

import './App.scss';
import AppMap from './components/Map/AppMap';
import PrimarySearchAppBar from './components/Nav/Nav.js';


class App extends Component { 
  componentDidMount() {
  }
  
  render() {
    // const { listings, state } = this.props;
    return (
        <div className="App"> 
        <PrimarySearchAppBar />
        <AppMap />
        </div>
    );
  }
}

//Connect
const mapStateToProps = state => ({
  state,
  // listings: state.listings.byId
});

const mapDispatchToProps = dispatch => ({
  dispatch
});

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )
)(App);