import React, { useEffect, useState } from "react";
import { Grid, LinearProgress } from "@material-ui/core";

import { getCollection } from "./db/mlab";
import AppMap from "./components/Map/AppMap";
import Nav from "./components/Nav/Nav.js";
import "./App.scss";

const App = React.memo(() => {
  const [mapInstance, setMapInstance] = useState(null);
  const [listings, getListings] = useState([]);
  const [categories, getCategories] = useState([]);
  useEffect(() => {
    async function fetchListings() {
      getListings(await getCollection("listings"));
    }
    async function fetchCategories() {
      getCategories(await getCollection("categories"));
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
          <Grid container>
            <Nav
              listings={listings}
              categories={categories}
              map={mapInstance}
            />
            <AppMap
              listings={listings}
              categories={categories}
              setMapInstance={setMapInstance}
              mapInstance={mapInstance}
            />
          </Grid>
        </div>
      )}
    </div>
  );
});

export default App;
