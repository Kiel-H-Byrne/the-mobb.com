import React, { useEffect } from "react";
import { Grid, LinearProgress } from "@material-ui/core";
import { useGlobalState } from "./state"
import AppMap from "./components/Map/AppMap";
import Nav from "./components/Nav/Nav.js";
import "./App.scss";
import { getCollection } from "./db/mlab";

export default React.memo(() => {
  const [listings, setListings] = useGlobalState("listings");
  const [categories, setCategories] = useGlobalState("categories");
  
  async function fetchAll() {
    setListings(await getCollection("listings"));
    setCategories(await getCollection("categories"));
  }
  useEffect(() => {
    console.log("fetching...");
    fetchAll();
  }, []);

  return (
    <div className="App_wrapper">
      {!listings ? (
        <LinearProgress />
      ) : (
        <div>
          <Grid container>
            <Nav listings={listings} categories={categories}/>
            <AppMap listings={listings} categories={categories} />
          </Grid>
        </div>
      )}
    </div>
  );
});
