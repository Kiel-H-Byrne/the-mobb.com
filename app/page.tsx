"use client";

import React, { useEffect, useState } from "react";
import AppMap from "../src/components/Map/AppMap";
import { css } from "../styled-system/css";

import { SAMPLE_CATEGORIES, SAMPLE_LISTINGS } from "../src/db/SampleListings";
import { fetchAllCategories, fetchAllListings } from "./actions/geo-search";

import { Category, Listing } from "../src/db/Types";

const Home = React.memo(() => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  console.log('listings', listings);
  useEffect(() => {
    async function fetchListings() {
      let listings = await fetchAllListings();
      if (!listings || listings.length === 0) {
        listings = SAMPLE_LISTINGS;
      }
      setListings(listings);
    }
    async function fetchCategories() {
      let categories = await fetchAllCategories();
      if (!categories || categories.length === 0) {
        categories = SAMPLE_CATEGORIES;
      }
      setCategories(categories);
    }
    fetchListings();
    fetchCategories();
  }, []);
  console.log(listings);
  return (
    <>
      <main className={css({ height: "100vh", width: "100vw" })}>
        {!listings || !categories ? (
          <div className={css({
            width: "100%",
            height: "4px",
            backgroundColor: "rgba(251, 176, 59, 0.2)",
            position: "relative",
            overflow: "hidden",
          })}>
             <div className={css({
               position: "absolute",
               height: "100%",
               backgroundColor: "brand.orange",
               width: "30%",
               left: "-30%",
               animation: "linearProgress 2s infinite linear",
             })} />
          </div>
        ) : (
          <div className={css({ height: "100%", width: "100%", position: "relative" })}>
            <AppMap
              listings={listings}
              setListings={setListings}
              categories={categories || []}
              setMapInstance={setMapInstance}
              mapInstance={mapInstance}
              browserLocation={null}
            />
          </div>
        )}
      </main>

      <footer className={css({ height: "0" })}></footer>
    </>
  );
});
export default Home;
