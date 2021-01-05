import React, { useState, useEffect } from "react";
import Head from "next/head";
import { Grid, LinearProgress } from "@material-ui/core";
import styles from "../styles/Home.module.scss";
import "../styles/App.scss";
import Nav from "../components/Nav/Nav";
import AppMap from "../components/Map/AppMap";

import { fetchAllCollection } from "../db/mlab";




export default React.memo(() => {
  const [mapInstance, setMapInstance] = useState(null);
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState(null);
  // const [selectedCategories, setSelectedCategories] = useState([])
  useEffect(() => {
    async function fetchListings() {
      setListings(await fetchAllCollection({ collection: "listings" }));
    }
    async function fetchCategories() {
      let categories =
        (await fetchAllCollection({ collection: "categories" })) || [];
      categories = categories.map((el) => el.name);
      setCategories(categories);
    }
    fetchListings();
    fetchCategories();
  }, []);
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {listings.length === 0 ? (
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
                browserLocation={null}
              />
            </Grid>
          </div>
        )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
});
