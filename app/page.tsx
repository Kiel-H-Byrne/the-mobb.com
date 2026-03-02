"use client";

import AppMap from "@/components/Map/AppMap";
import { css } from "@styled/css";
import React, { useEffect, useState } from "react";

import { SAMPLE_CATEGORIES } from "@/db/SampleListings";
import { fetchAllCategories, fetchAllListings } from "./actions/geo-search";

import { Category, Listing } from "@/db/Types";

// Placeholder Components for modularity (to be extracted later)
import AddListingDrawer from "@/components/Map/AddListingDrawer";
import { ActivePulsePanel } from "@/components/ui/v3/ActivePulsePanel";
import { ListingDetailPanel3D } from "@/components/ui/v3/ListingDetailPanel3D";
import SidebarHUD from "@/components/ui/v3/SidebarHUD";

const Home = React.memo(() => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);

  // States lifted from AppMap
  const [isDrawerOpen, setisDrawerOpen] = useState(false);
  const [isInfoWindowOpen, setisInfoWindowOpen] = useState(false);
  const [activeListing, setactiveListing] = useState<Listing | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);

  // Radar state
  const [isMapActive, setIsMapActive] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      let fetchedListings = await fetchAllListings();
      setListings(fetchedListings || []);
    }
    async function fetchCategories() {
      let cats = await fetchAllCategories();
      if (!cats || cats.length === 0) {
        cats = SAMPLE_CATEGORIES;
      }
      setCategories(cats);
      setSelectedCategories(new Set(cats));
    }
    fetchListings();
    fetchCategories();
  }, []);

  return (
    <div className={css({ h: "100vh", w: "100vw", display: "flex", flexDir: { base: "column", md: "row" }, gap: "6", p: { base: "4", md: "6" }, position: "relative", zIndex: 10 })}>

      {/* Immersive 3D Map Background */}
      <div className={css({ position: "fixed", inset: "-24px", overflow: "hidden", pointerEvents: "none", zIndex: 0 })}>
        <AppMap
          listings={listings || []}
          setListings={setListings}
          categories={categories || []}
          setMapInstance={setMapInstance}
          mapInstance={mapInstance}
          browserLocation={null}
          // Lifted State Handlers
          activeListing={activeListing}
          setactiveListing={setactiveListing}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          isDrawerOpen={isDrawerOpen}
          setisDrawerOpen={setisDrawerOpen}
          isInfoWindowOpen={isInfoWindowOpen}
          setisInfoWindowOpen={setisInfoWindowOpen}
          setIsMapActive={setIsMapActive}
        />
        {/* Holographic Radar Backdrop Overlay */}
        <div className={css({ position: "absolute", inset: 0, background: "linear-gradient(to top, #0B0B0E, transparent, #0B0B0E)", pointerEvents: "none" })} />
        <div className={css({ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", opacity: isMapActive ? 0.3 : 0.05, transition: "opacity 1s" })}>
          <div className={css({ position: "absolute", top: "0", left: "0", w: "full", h: "full", borderRadius: "full", background: "conic-gradient(from 0deg, transparent 70%, rgba(255, 90, 0, 0.4) 100%)", animation: isMapActive ? "radarSpin" : "none" })} />
        </div>
      </div>

      <SidebarHUD />

      <main className={css({ flex: 1, display: "flex", flexDir: { base: "column", md: "row" }, gap: "6", h: "full", overflow: "hidden" })}>
        {!listings || !categories ? (
          <div className={css({ width: "100%", height: "4px", bg: "brand.orangeMuted", position: "relative", overflow: "hidden" })}>
            <div className={css({ position: "absolute", height: "100%", bg: "brand.orange", width: "30%", left: "-30%", animation: "linearProgress 2s infinite linear" })} />
          </div>
        ) : (
          <ActivePulsePanel
            listings={listings}
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            mapInstance={mapInstance}
            setactiveListing={setactiveListing}
            setisDrawerOpen={setisDrawerOpen}
            setIsAddListingOpen={setIsAddListingOpen}
          />
        )}

        {/* 2030 Listing Detail Panel overlay */}
        {activeListing && (
          <ListingDetailPanel3D
            listing={activeListing}
            isOpen={isDrawerOpen}
            setOpen={setisDrawerOpen}
          />
        )}
      </main>

      {/* Floating Action Button for Add Listing */}
      <div
        onClick={() => setIsAddListingOpen(true)}
        className={css({ position: "fixed", bottom: "6", right: "6", zIndex: 50, animation: "floatAnim", animationDelay: "1s" })}
      >
        <div className={css({ width: "56px", height: "56px", borderRadius: "full", bg: "brand.greyDark", border: "2px solid", borderColor: "brand.orange", boxShadow: "glow", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", _hover: { transform: "scale(1.1)" }, transition: "transform" })}>
          <i className="ph-fill ph-robot text-2xl text-brand-orange"></i>
        </div>
      </div>

      <AddListingDrawer isOpen={isAddListingOpen} setOpen={setIsAddListingOpen} />
    </div>
  );
});

export default Home;

