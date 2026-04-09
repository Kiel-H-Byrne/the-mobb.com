"use client";

import AppMap from "@/components/Map/AppMap";
import { css } from "@styled/css";
import React, { useEffect } from "react";

import { Listing } from "@/db/Types";

// Store
import { useAppStore } from "@/store/useAppStore";

// Components
import AddListingDrawer from "@/components/Map/AddListingDrawer";
import { ActivePulsePanel } from "@/components/ui/v3/ActivePulsePanel";
import EcosystemToggle from "@/components/ui/v3/EcosystemToggle";
import GlobalGrid from "@/components/ui/v3/GlobalGrid";
import { ListingDetailPanel3D } from "@/components/ui/v3/ListingDetailPanel3D";
import { MobileClosestListingsPanel } from "@/components/ui/v3/MobileClosestListingsPanel";
import { MobileNearestCard } from "@/components/ui/v3/MobileNearestCard";
import { MobileSavedListingsPanel } from "@/components/ui/v3/MobileSavedListingsPanel";
import { MobileTopSearch } from "@/components/ui/v3/MobileTopSearch";
import OnlineOrbit from "@/components/ui/v3/OnlineOrbit";
import SidebarHUD from "@/components/ui/v3/SidebarHUD";

import { findBusinessesNearby, fetchGlobalListings, fetchOnlineOnlyListings } from "./actions/geo-search";

import { PlusIcon } from "@phosphor-icons/react";

// --- Wrappers for Atomic Rendering --- //

const RadarOverlay = () => {
  const isMapActive = useAppStore((state) => state.isMapActive);
  return (
    <div className={css({ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "800px", height: "800px", opacity: isMapActive ? 0.3 : 0.05, transition: "opacity 1s", pointerEvents: "none" })}>
      <div className={css({ position: "absolute", top: "0", left: "0", w: "full", h: "full", borderRadius: "full", background: "conic-gradient(from 0deg, transparent 70%, rgba(255, 90, 0, 0.4) 100%)", animation: isMapActive ? "radarSpin" : "none", pointerEvents: "none" })} />
    </div>
  );
};

const AddListingContainer = () => {
  const isAddListingOpen = useAppStore((s) => s.isAddListingOpen);
  const setIsAddListingOpen = useAppStore((s) => s.setIsAddListingOpen);
  return <AddListingDrawer isOpen={isAddListingOpen} setOpen={setIsAddListingOpen} />;
};

const DetailPanelContainer = () => {
  const activeListing = useAppStore((s) => s.activeListing);
  const isDrawerOpen = useAppStore((s) => s.isDrawerOpen);
  const setIsDrawerOpen = useAppStore((s) => s.setIsDrawerOpen);
  const savedListings = useAppStore((s) => s.savedListings);
  const setSavedListings = useAppStore((s) => s.setSavedListings);

  if (!activeListing) return null;

  return (
    <ListingDetailPanel3D
      listing={activeListing}
      isOpen={isDrawerOpen}
      setOpen={setIsDrawerOpen}
      savedListings={savedListings}
      setSavedListings={setSavedListings}
    />
  );
};

const NearestCardContainer = () => {
  const userLocation = useAppStore((s) => s.userLocation);
  const closestListing = useAppStore((s) => s.closestListing);
  const setActiveListing = useAppStore((s) => s.setActiveListing);
  const setIsDrawerOpen = useAppStore((s) => s.setIsDrawerOpen);

  if (!userLocation) return null;

  return (
    <MobileNearestCard
      listing={closestListing}
      setactiveListing={setActiveListing}
      setisDrawerOpen={setIsDrawerOpen}
    />
  );
};

const FloatingAddButton = () => {
  const setIsAddListingOpen = useAppStore(s => s.setIsAddListingOpen);
  return (
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
  );
};

const MapContainer = ({ initialListings }: { initialListings: Listing[] }) => {
  const listings = useAppStore(s => s.listings);
  const setListings = useAppStore(s => s.setListings);
  const categories = useAppStore(s => s.categories);
  const mapInstance = useAppStore(s => s.mapInstance);
  const setMapInstance = useAppStore(s => s.setMapInstance);
  const activeListing = useAppStore(s => s.activeListing);
  const setActiveListing = useAppStore(s => s.setActiveListing);
  const selectedCategories = useAppStore(s => s.selectedCategories);
  const setSelectedCategories = useAppStore(s => s.setSelectedCategories);
  const setIsDrawerOpen = useAppStore(s => s.setIsDrawerOpen);
  const setIsInfoWindowOpen = useAppStore(s => s.setIsInfoWindowOpen);
  const setIsMapActive = useAppStore(s => s.setIsMapActive);
  const setClosestListing = useAppStore(s => s.setClosestListing);

  // Note: We deliberately EXCLUDE `isDrawerOpen` here so toggling the drawer doesn't re-render the map
  // AppMap's inner components only need `setisDrawerOpen` anyway!

  return (
    <AppMap
      listings={listings || initialListings || []}
      setListings={setListings}
      categories={categories || []}
      setMapInstance={setMapInstance}
      mapInstance={mapInstance}
      browserLocation={null}
      // Lifted State Handlers
      activeListing={activeListing}
      setactiveListing={setActiveListing}
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      isDrawerOpen={false} // Passes dummy value to avoid prop requirements or errors
      setisDrawerOpen={setIsDrawerOpen}
      isInfoWindowOpen={false} // Also pass dummy value to prevent atomic re-render
      setisInfoWindowOpen={setIsInfoWindowOpen}
      setIsMapActive={setIsMapActive}
      setClosestListing={setClosestListing}
    />
  );
};

// --- Main Page Client Component --- //

interface HomeClientProps {
  initialListings: Listing[];
  initialCategories: string[];
}

const HomeClient = React.memo(({ initialListings, initialCategories }: HomeClientProps) => {
  // Main Page level state subscriptions (only things needed for layout rendering)
  const listings = useAppStore((state) => state.listings);
  const categories = useAppStore((state) => state.categories);
  const setListings = useAppStore((state) => state.setListings);
  const setCategories = useAppStore((state) => state.setCategories);
  const selectedCategories = useAppStore((state) => state.selectedCategories);
  const setSelectedCategories = useAppStore((state) => state.setSelectedCategories);
  const mapInstance = useAppStore((state) => state.mapInstance);

  const viewMode = useAppStore((state) => state.viewMode);
  const setViewMode = useAppStore((state) => state.setViewMode);

  const activeNav = useAppStore((state) => state.activeNav);
  const setActiveNav = useAppStore((state) => state.setActiveNav);
  const isPanelVisible = useAppStore((state) => state.isPanelVisible);
  const setIsPanelVisible = useAppStore((state) => state.setIsPanelVisible);
  const setIsMapActive = useAppStore((state) => state.setIsMapActive);

  const userLocation = useAppStore((state) => state.userLocation);
  const setUserLocation = useAppStore((state) => state.setUserLocation);

  const setActiveListing = useAppStore((state) => state.setActiveListing);
  const setIsDrawerOpen = useAppStore((state) => state.setIsDrawerOpen);
  const setIsAddListingOpen = useAppStore((state) => state.setIsAddListingOpen);
  const savedListings = useAppStore((state) => state.savedListings);

  const handleNearMeClick = React.useCallback(async () => {
    setActiveNav("nearme");
    setIsPanelVisible(true);
    setViewMode("RADAR"); // Always jump back to map when grabbing location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });

          if (mapInstance) {
            mapInstance.panTo({ lat, lng });
            mapInstance.setZoom(12);
          }

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
        }
      );
    }
  }, [mapInstance, setActiveNav, setIsPanelVisible, setUserLocation, setListings, setViewMode]);

  const handleExploreClick = React.useCallback(() => {
    setActiveNav("explore");
    setIsPanelVisible(false);
    setIsMapActive(true);
    setViewMode("GRID");
  }, [setActiveNav, setIsPanelVisible, setIsMapActive, setViewMode]);

  useEffect(() => {
    // If listings don't exist yet, we initialize.
    // Also, respond to viewMode changes to act as true Global Provider.
    async function syncGlobalData() {
      if (viewMode === "GRID") {
        try {
          const freshGrid = await fetchGlobalListings(1, 100);
          setListings(freshGrid);
        } catch (e) {
          console.error(e);
        }
      } else if (viewMode === "ORBIT") {
        try {
          const freshOrbit = await fetchOnlineOnlyListings(1, 100);
          setListings(freshOrbit);
        } catch (e) {
          console.error(e);
        }
      } else if (viewMode === "RADAR") {
        if (!userLocation) {
          setListings(initialListings);
        } else {
          // Keep it to whatever userLocation was last nearby searched,
          // or just default to initialListings if we don't want to overfetch
        }
      }
    }
    syncGlobalData();
  }, [viewMode, initialListings, setListings, userLocation]);

  useEffect(() => {
    if (!categories) {
      setCategories(initialCategories);
      setSelectedCategories(new Set(initialCategories));
    }
  }, [initialCategories, categories, setCategories, setSelectedCategories]);

  // Determine structural visibility based on main toggle
  const showRadarUI = viewMode === "RADAR";

  return (
    <div className={css({ h: "100dvh", w: "100%", overflow: "hidden", display: "flex", flexDir: { base: "column", md: "row" }, gap: "6", p: { base: "4", md: "6" }, position: "relative", zIndex: 10, pointerEvents: "none" })}>

      <EcosystemToggle activeView={viewMode} setActiveView={setViewMode} />

      {viewMode === "GRID" && <GlobalGrid listings={listings || []} />}
      {viewMode === "ORBIT" && <OnlineOrbit listings={listings || []} />}

      {/* Immersive 3D Map Background - Remains mounted for API caching, just hidden visually */}
      <div
        className={css({
          position: "fixed",
          inset: "-24px",
          overflow: "hidden",
          pointerEvents: showRadarUI ? "auto" : "none",
          zIndex: 0,
          opacity: showRadarUI ? 1 : 0,
          transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)"
        })}
      >
        <MapContainer initialListings={initialListings} />
        <div className={css({ position: "absolute", inset: 0, background: "linear-gradient(to top, #0B0B0E, transparent, #0B0B0E)", pointerEvents: "none" })} />
        <RadarOverlay />
      </div>

      <div className={css({
        display: { base: "none", md: "block" },
        zIndex: 40,
        pointerEvents: showRadarUI ? "auto" : "none",
        opacity: showRadarUI ? 1 : 0,
        transition: "opacity 0.4s"
      })}>
        <SidebarHUD
          activeNav={activeNav}
          onNearMeClick={handleNearMeClick}
          onExploreClick={handleExploreClick}
          isPanelVisible={isPanelVisible}
          onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
        />
      </div>

      <div className={css({
        opacity: showRadarUI ? 1 : 0,
        pointerEvents: showRadarUI ? "auto" : "none",
        transition: "opacity 0.4s",
        position: "relative",
        zIndex: 30,
        w: "full",
        display: "flex",
        flexDir: "column",
        gap: "6"
      })}>
        <MobileTopSearch
          listings={listings || initialListings || []}
          categories={categories || initialCategories || []}
          selectedCategories={selectedCategories}
          setSelectedCategories={setSelectedCategories}
          mapInstance={mapInstance}
          setactiveListing={setActiveListing}
          setisDrawerOpen={setIsDrawerOpen}
        />

        <NearestCardContainer />

        <MobileClosestListingsPanel
          listings={listings || initialListings || []}
          mapInstance={mapInstance}
          setactiveListing={setActiveListing}
          setisDrawerOpen={setIsDrawerOpen}
          userLocation={userLocation}
          onRequestLocation={handleNearMeClick}
        />

        <MobileSavedListingsPanel
          listings={savedListings}
          mapInstance={mapInstance}
          setactiveListing={setActiveListing}
          setisDrawerOpen={setIsDrawerOpen}
        />
      </div>

      <main className={css({
        flex: 1,
        display: { base: "none", md: "flex" },
        flexDir: { base: "column", md: "row" },
        gap: "6",
        h: "full",
        overflow: "hidden",
        pointerEvents: showRadarUI ? "none" : "none",
        opacity: showRadarUI ? 1 : 0,
        transition: "opacity 0.4s"
      })}>
        {((listings || initialListings) && (categories || initialCategories) && isPanelVisible && showRadarUI) && (
          <ActivePulsePanel
            listings={listings || initialListings}
            categories={categories || initialCategories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            mapInstance={mapInstance}
            setactiveListing={setActiveListing}
            setisDrawerOpen={setIsDrawerOpen}
            setIsAddListingOpen={setIsAddListingOpen}
            userLocation={userLocation}
            onRequestLocation={handleNearMeClick}
          />
        )}
      </main>

      <DetailPanelContainer />
      <FloatingAddButton />
      <AddListingContainer />

    </div>
  );
});

export default HomeClient;
