import { Grid, LinearProgress } from "@mui/material";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import AppMap from "../src/components/Map/AppMap";
import Nav from "../src/components/Nav/Nav";
import style from "../src/style/Home.module.scss";

import { fetchAllCollection } from "../src/db/mlab";

const Home = React.memo(() => {
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
    <>
      <Head>
        <head>
          <meta charSet="utf-8" />
          <title>MOBB</title>

          <meta
            name="viewport"
            content="width=device-width, shrink-to-fit=no, minimal-ui"
          />
          <meta name="format-detection" content="telephone=no" />
          <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

          {/* NATIVE MOBILE UI SETTINGS  */}
          <meta name="HandheldFriendly" content="true" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black" />
          <meta name="apple-mobile-web-app-title" content="MOBB" />

          {/* OPENGRAPH XML FOR FACEBOOK PREVIEW  */}
          <meta property="og:title" content="MOBB" />
          <meta property="og:type" content="website" />
          <meta
            property="og:image"
            content="https://mobb.kielbyrne.com/img/Logo_MOBBx1024.jpg"
          />
          <meta
            property="og:image:secure_url"
            content="https://mobb.kielbyrne.com/img/Logo_MOBBx1024.jpg"
          />
          <meta property="og:image:type" content="image/jpeg" />
          <meta property="og:image:width" content="1024" />
          <meta property="og:image:height" content="1024" />
          <meta property="og:image:alt" content="The MOBB Logo" />
          <meta property="og:url" content="https://mobb.kielbyrne.com" />
          <meta
            property="og:description"
            content="The Map of 'Black' Businesses. Give your dollar the choice to make a difference... Just MOBB It."
          />
          <meta property="og:determiner" content="the" />
          <meta property="og:locale" content="en_US" />
          <meta property="og:site_name" content="MOBB" />
          <meta property="fb:app_id" content="235091633613282" />
          <meta
            name="google-site-verification"
            content="OJEUZfTeTwEUiclFV1wP8-_pr29LuzIbx1ldaX5jdK4"
          />

          {/* Real-Favicon Generated FOR FACEBOOK PREVIEW  */}
          <meta name="theme-color" content="#ed7e0e" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <meta name="msapplication-TileColor" content="#ed7e0e" />
          <meta
            name="msapplication-TileImage"
            content="/img/icons/mstile-144x144.png"
          />
          <link
            rel="manifest"
            type="application/manifest+json"
            href="/app_manifest.json"
          />
          {/*  ICONS  */}
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/img/icons/favicon-32x32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/img/icons/favicon-16x16.png"
          />
          <link
            rel="apple-touch-icon"
            href="/img/icons/apple-touch-icon-180x180.png"
          />
          <link rel="apple-touch-startup-image" href="/img/Logo_MOBB-2.jpg" />
          <link
            rel="mask-icon"
            href="/img/icons/safari-pinned-tab.svg"
            color="#ed7e0e"
          />
          {/*  FONTS  */}
          <link
            rel="preload"
            href="https://fonts.googleapis.com/icon?family=Material+Icons"
            as="style"
            onLoad={() => "this.rel='stylesheet'"}
          />

          <link
            href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond&family=Fira+Sans&family=Quicksand&display=swap"
            rel="stylesheet"
            crossOrigin="anonymous"
          />

          <noscript>
            <style>
              return{" "}
              {`body {
          font-size: 52px;
          text-align: center;
          line-height: 100vh;
          margin: 0;
          padding: 0;
        }
        body:after {
          /*white-space: pre;*/
          content: "Please enable Javascript to properly use this site.";
        }`}
            </style>
          </noscript>
        </head>
      </Head>

      <main className={style.main}>
        {listings?.length === 0 ? (
          <LinearProgress />
        ) : (
          <div>
            <Grid container>
              <Nav listings={listings} map={mapInstance} />
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

      <footer className={style.footer}></footer>
    </>
  );
});
export default Home;
