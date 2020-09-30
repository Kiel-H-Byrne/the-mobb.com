import React, { useEffect, useState } from "react";
import { Grid, LinearProgress } from "@material-ui/core";

import { getCollection } from "./db/mlab";
import AppMap from "./components/Map/AppMap";
import Nav from "./components/Nav/Nav.js";
import SideDrawer from "./components/SideDrawer/SideDrawer";
import "./App.scss";

const App = () => {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    async function fetchListings() {
      setListings(await getCollection("listings"));
    }
    async function fetchCategories() {
      setCategories(await getCollection("categories"));
    }
    fetchListings();
    fetchCategories();
  }, []);
  return (
    <div className="App_wrapper">
      {!listings ? (
        <LinearProgress />
      ) : (
        <div>
          <SideDrawer activeListing={listings.activeListing} />
          <Grid container>
            <Nav listings={listings} categories={categories} />
            <AppMap listings={listings} categories={categories} />
          </Grid>
        </div>
      )}
    </div>
  );
};

export default App;
