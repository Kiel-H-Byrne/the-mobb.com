"use client";

import Head from "next/head";
import React, { useEffect, useState } from "react";
import AppMap from "../src/components/Map/AppMap";
import Nav from "../src/components/Nav/Nav";
import { css } from "../styled-system/css";

import { fetchAllCategories, fetchAllListings } from "./actions/geo-search";
import { SAMPLE_CATEGORIES, SAMPLE_LISTINGS } from "../src/db/SampleListings";

import { Category, Listing } from "../src/db/Types";

const Home = React.memo(() => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);
  useEffect(() => {
    async function fetchListings() {
      setListings(
        (await fetchAllListings()) ??
          SAMPLE_LISTINGS
      );
    }
    async function fetchCategories() {
      let categories =
        (await fetchAllCategories()) ??
        SAMPLE_CATEGORIES;
      // categories = categories.map((el) => el.name);
      setCategories(categories);
    }
    fetchListings();
    fetchCategories();
  }, []);
  return (
    <>
      <main className={css({ height: "100vh", width: "100vw" })}>
        {!listings || listings.length === 0 ? (
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
          <div className={css({ height: "100%", width: "100%" })}>
            <div
              className={css({
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
              })}
            >
              <Nav listings={listings} map={mapInstance} />
              <div
                className={css({
                  flex: "1",
                  position: "relative",
                  width: "100%",
                })}
              >
                <AppMap
                  listings={listings}
                  setListings={setListings}
                  categories={categories || []}
                  setMapInstance={setMapInstance}
                  mapInstance={mapInstance}
                  browserLocation={null}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className={css({ height: "0" })}></footer>
    </>
  );
});
export default Home;
