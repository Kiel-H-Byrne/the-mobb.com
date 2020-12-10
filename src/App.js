import React, { useEffect, useState } from "react";
import { Grid, LinearProgress } from "@material-ui/core";

import { fetchCollection } from "./db/mlab";
import AppMap from "./components/Map/AppMap";
import Nav from "./components/Nav/Nav";
import "./App.scss";

const App = React.memo(() => {
  const [mapInstance, setMapInstance] = useState(null);
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState(null);
  // const [selectedCategories, setSelectedCategories] = useState([])
  useEffect(() => {
    async function fetchListings() {
      setListings(await fetchCollection({collection: "listings", method: "GET"}));
    }
    async function fetchCategories() {
      let categories = await fetchCollection({collection: "categories", method: "GET"})
      categories = categories.map(el => el.name)
      setCategories(categories);
    }
    fetchListings();
    fetchCategories();
  }, []);
  return (
    <div className="App_wrapper">
      {!categories || !listings ? (
        <LinearProgress />
      ) : (
        <div>
          <Grid container>
            <Nav listings={listings} map={mapInstance} className="" />
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
