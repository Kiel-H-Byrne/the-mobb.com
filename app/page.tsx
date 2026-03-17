"use client";

import AppMap from "@/components/Map/AppMap";
import { css } from "@styled/css";
import React, { useEffect, useState } from "react";

import { SAMPLE_CATEGORIES } from "@/db/SampleListings";
import { fetchAllCategories, fetchAllListings, findBusinessesNearby } from "./actions/geo-search";

import { Category, Listing } from "@/db/Types";

// Placeholder Components for modularity (to be extracted later)
import AddListingDrawer from "@/components/Map/AddListingDrawer";
import { ActivePulsePanel } from "@/components/ui/v3/ActivePulsePanel";
import { ListingDetailPanel3D } from "@/components/ui/v3/ListingDetailPanel3D";
import { MobileClosestListingsPanel } from "@/components/ui/v3/MobileClosestListingsPanel";
import { MobileNearestCard } from "@/components/ui/v3/MobileNearestCard";
import { MobileSavedListingsPanel } from "@/components/ui/v3/MobileSavedListingsPanel";
import { MobileTopSearch } from "@/components/ui/v3/MobileTopSearch";
import SidebarHUD from "@/components/ui/v3/SidebarHUD";

import { PlusIcon } from "@phosphor-icons/react";

const Home = React.memo(() => {
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [listings, setListings] = useState<Listing[] | null>(null);
  const [categories, setCategories] = useState<Category[] | null>(null);

  // States lifted from AppMap
  const [isDrawerOpen, setisDrawerOpen] = useState(false);
  const [isInfoWindowOpen, setisInfoWindowOpen] = useState(false);
  const [activeListing, setactiveListing] = useState<Listing | null>(null);
  const [closestListing, setClosestListing] = useState<Listing | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [isAddListingOpen, setIsAddListingOpen] = useState(false);
  const [savedListings, setSavedListings] = useState<Listing[]>([]);

  // Radar state
  const [isMapActive, setIsMapActive] = useState(true);

  // Navigation & Location state
  const [activeNav, setActiveNav] = useState<"nearme" | "explore" | "saved" | "curator">("nearme");
  const [isPanelVisible, setIsPanelVisible] = useState(true);
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Geolocation Handler
  const handleNearMeClick = React.useCallback(async () => {
    setActiveNav("nearme");
    setIsPanelVisible(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });

          if (mapInstance) {
            mapInstance.panTo({ lat, lng });
            mapInstance.setZoom(12); // zoom in closer for local results
          }

          // 20 miles is roughly 32000 meters
          try {
            const nearby = await findBusinessesNearby(lat, lng, 32000);
            if (nearby && nearby.length > 0) {
              setListings(nearby);
            }
          } catch (error) {
            console.error("Error fetching nearby businesses:", error);
          }
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Fallback handling or notification could go here
        }
      );
    }
  }, [mapInstance]);

  const handleExploreClick = React.useCallback(() => {
    setActiveNav("explore");
    setIsPanelVisible(false);
    setIsMapActive(true);
  }, []);

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
    <div className={css({ h: "100dvh", w: "100%", overflow: "hidden", display: "flex", flexDir: { base: "column", md: "row" }, gap: "6", p: { base: "4", md: "6" }, position: "relative", zIndex: 10, pointerEvents: "none" })}>

      {/* Immersive 3D Map Background */}
      <div className={css({ position: "fixed", inset: "-24px", overflow: "hidden", pointerEvents: "auto", zIndex: 0 })}>
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
          setClosestListing={setClosestListing}
        />
        {/* Holographic Radar Backdrop Overlay */}
        <div className={css({ position: "absolute", inset: 0, background: "linear-gradient(to top, #0B0B0E, transparent, #0B0B0E)", pointerEvents: "none" })} />
        <div className={css({ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", opacity: isMapActive ? 0.3 : 0.05, transition: "opacity 1s", pointerEvents: "none" })}>
          <div className={css({ position: "absolute", top: "0", left: "0", w: "full", h: "full", borderRadius: "full", background: "conic-gradient(from 0deg, transparent 70%, rgba(255, 90, 0, 0.4) 100%)", animation: isMapActive ? "radarSpin" : "none", pointerEvents: "none" })} />
        </div>
      </div>

      <div className={css({ display: { base: "none", md: "block" }, zIndex: 40, pointerEvents: "auto" })}>
        <SidebarHUD
          activeNav={activeNav}
          onNearMeClick={handleNearMeClick}
          onExploreClick={handleExploreClick}
          isPanelVisible={isPanelVisible}
          onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
        />
      </div>

      <MobileTopSearch
        listings={listings || []}
        categories={categories || []}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
        mapInstance={mapInstance}
        setactiveListing={setactiveListing}
        setisDrawerOpen={setisDrawerOpen}
      />

      {userLocation && (
        <MobileNearestCard
          listing={closestListing}
          setactiveListing={setactiveListing}
          setisDrawerOpen={setisDrawerOpen}
        />
      )}

      <MobileClosestListingsPanel
        listings={listings || []}
        mapInstance={mapInstance}
        setactiveListing={setactiveListing}
        setisDrawerOpen={setisDrawerOpen}
        userLocation={userLocation}
        onRequestLocation={handleNearMeClick}
      />

      <MobileSavedListingsPanel
        listings={savedListings}
        mapInstance={mapInstance}
        setactiveListing={setactiveListing}
        setisDrawerOpen={setisDrawerOpen}
      />

      <main className={css({ flex: 1, display: { base: "none", md: "flex" }, flexDir: { base: "column", md: "row" }, gap: "6", h: "full", overflow: "hidden", pointerEvents: "none" })}>
        {/* Active Pulse Panel (Hidden in Explore Mode or manually collapsed) */}
        {(listings && categories && isPanelVisible) && (
          <ActivePulsePanel
            listings={listings}
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            mapInstance={mapInstance}
            setactiveListing={setactiveListing}
            setisDrawerOpen={setisDrawerOpen}
            setIsAddListingOpen={setIsAddListingOpen}
            userLocation={userLocation}
            onRequestLocation={handleNearMeClick}
          />
        )}

      </main>

      {/* 2030 Listing Detail Panel overlay - Moved outside of main to ensure it displays on mobile */}
      {activeListing && (
        <ListingDetailPanel3D
          listing={activeListing}
          isOpen={isDrawerOpen}
          setOpen={setisDrawerOpen}
          savedListings={savedListings}
          setSavedListings={setSavedListings}
        />
      )}

      <div className={css({ position: "fixed", bottom: "6", right: "6", zIndex: 50, animation: "floatAnim", animationDelay: "1s", pointerEvents: "auto" })}>
        <button
          onClick={() => setIsAddListingOpen(true)}
          className={css({
            width: { base: "48px", md: "56px" },
            height: { base: "48px", md: "56px" },
            borderRadius: "full",
            bg: "brand.orange",
            border: "2px solid",
            borderColor: "rgba(255, 90, 0, 0.3)",
            boxShadow: "0 0 20px rgba(255,90,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "black",
            _hover: { transform: "scale(1.05)", filter: "brightness(1.1)" },
            transition: "all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          })}
        >
          <PlusIcon weight="bold" size={24} />
        </button>
      </div>

      <AddListingDrawer isOpen={isAddListingOpen} setOpen={setIsAddListingOpen} />
    </div>
  );
});

export default Home;

