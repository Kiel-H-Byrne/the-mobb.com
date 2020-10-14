import React, { useEffect, useState } from "react";
import { Grid, LinearProgress } from "@material-ui/core";

import { getCollection } from "./db/mlab";
import AppMap from "./components/Map/AppMap";
import Nav from "./components/Nav/Nav.js";
import "./App.scss";

const App = React.memo(() => {
  const [mapInstance, setMapInstance] = useState(null);
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
      {!listings? (
        <LinearProgress />
      ) : (
        <div>
          <Grid container>
            <Nav listings={listings} categories={categories} map={mapInstance} />
            <AppMap listings={(listings)} categories={categories} setMapInstance={setMapInstance} mapInstance={mapInstance} />
          </Grid>
        </div>
      )}
    </div>
  );
});

export default App;
