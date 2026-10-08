"use client";

import AppMap from "@/components/Map/AppMap";
import { css } from "@styled/css";
import React, { useEffect, useMemo } from "react";

import { Category, Listing } from "@/db/Types";

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
import { ReportListingModal } from "@/components/ui/v3/ReportListingModal";
import SidebarHUD from "@/components/ui/v3/SidebarHUD";
import { UserAuthModal } from "@/components/ui/v3/UserAuthModal";

import { listingMatchesCategories } from "@/util/categories";
import { nearestListings } from "@/util/location";

import { PlusIcon } from "@phosphor-icons/react";

// --- Wrappers for Atomic Rendering --- //

const RadarOverlay = () => {
  const isMapActive = useAppStore((state) => state.isMapActive);
  return (
    <div
      className={css({
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "800px",
        height: "800px",
        opacity: isMapActive ? 0.3 : 0.05,
        transition: "opacity 1s",
        pointerEvents: "none",
      })}
    >
      <div
        className={css({
          position: "absolute",
          top: "0",
          left: "0",
          w: "full",
          h: "full",
          borderRadius: "full",
          background:
            "conic-gradient(from 0deg, transparent 70%, rgba(255, 90, 0, 0.4) 100%)",
          animation: isMapActive ? "radarSpin" : "none",
          pointerEvents: "none",
        })}
      />
    </div>
  );
};

const AddListingContainer = () => {
  const isAddListingOpen = useAppStore((s) => s.isAddListingOpen);
  const setIsAddListingOpen = useAppStore((s) => s.setIsAddListingOpen);
  return (
    <AddListingDrawer isOpen={isAddListingOpen} setOpen={setIsAddListingOpen} />
  );
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

const MOBILE_LIST_LIMIT = 40;

const NearestCardContainer = ({ listings }: { listings: Listing[] }) => {
  const userLocation = useAppStore((s) => s.userLocation);
  const setActiveListing = useAppStore((s) => s.setActiveListing);
  const setIsDrawerOpen = useAppStore((s) => s.setIsDrawerOpen);

  const closestListing = useMemo(
    () =>
      userLocation
        ? nearestListings(listings, userLocation, 1)[0] ?? null
        : null,
    [listings, userLocation],
  );

  if (!userLocation) return null;

  return (
    <MobileNearestCard
      listing={closestListing}
      setactiveListing={setActiveListing}
      setisDrawerOpen={setIsDrawerOpen}
    />
  );
};

// The detail sheet takes over the bottom of the screen on mobile, so the
// view toggle and the bottom stack step aside while it's open.
const useIsDetailSheetOpen = () => {
  const activeListing = useAppStore((s) => s.activeListing);
  const isDrawerOpen = useAppStore((s) => s.isDrawerOpen);
  return Boolean(activeListing && isDrawerOpen);
};

const ViewToggleContainer = () => {
  const viewMode = useAppStore((s) => s.viewMode);
  const setViewMode = useAppStore((s) => s.setViewMode);
  const isDetailSheetOpen = useIsDetailSheetOpen();
  return (
    <EcosystemToggle
      activeView={viewMode}
      setActiveView={setViewMode}
      hiddenOnMobile={isDetailSheetOpen}
    />
  );
};

/**
 * Mobile-only column that stacks the "+" button and nearest card directly
 * above the view toggle, so they never overlap it or each other.
 * Bottom offset = toggle's bottom (16px) + its height (~58px) + 12px gap.
 */
const MobileBottomStack = ({ children }: { children: React.ReactNode }) => {
  const isDetailSheetOpen = useIsDetailSheetOpen();
  return (
    <div
      className={css({
        position: "fixed",
        left: "4",
        right: "4",
        bottom: "86px",
        zIndex: 40,
        display: { base: "flex", md: "none" },
        flexDirection: "column",
        alignItems: "stretch",
        gap: "3",
        pointerEvents: "none",
        opacity: isDetailSheetOpen ? 0 : 1,
        visibility: isDetailSheetOpen ? "hidden" : "visible",
        transition: "opacity 0.3s, visibility 0.3s",
        "& > *": { pointerEvents: "auto" },
      })}
    >
      {children}
    </div>
  );
};

const FloatingAddButton = ({ inStack = false }: { inStack?: boolean }) => {
  const setIsAddListingOpen = useAppStore((s) => s.setIsAddListingOpen);
  return (
    <div
      className={
        inStack
          ? css({ alignSelf: "flex-end" })
          : css({
              display: { base: "none", md: "block" },
              position: "fixed",
              bottom: "6",
              right: "6",
              zIndex: 50,
              animation: "floatAnim",
              animationDelay: "1s",
              pointerEvents: "auto",
            })
      }
    >
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
  const listings = useAppStore((s) => s.listings);
  const categories = useAppStore((s) => s.categories);
  const mapInstance = useAppStore((s) => s.mapInstance);
  const setMapInstance = useAppStore((s) => s.setMapInstance);
  const activeListing = useAppStore((s) => s.activeListing);
  const setActiveListing = useAppStore((s) => s.setActiveListing);
  const selectedCategories = useAppStore((s) => s.selectedCategories);
  const setSelectedCategories = useAppStore((s) => s.setSelectedCategories);
  const setIsDrawerOpen = useAppStore((s) => s.setIsDrawerOpen);
  const setIsInfoWindowOpen = useAppStore((s) => s.setIsInfoWindowOpen);
  const setIsMapActive = useAppStore((s) => s.setIsMapActive);

  return (
    <AppMap
      listings={listings || initialListings || []}
      categories={categories || []}
      setMapInstance={setMapInstance}
      mapInstance={mapInstance}
      browserLocation={null}
      activeListing={activeListing}
      setactiveListing={setActiveListing}
      selectedCategories={selectedCategories}
      setSelectedCategories={setSelectedCategories}
      // isDrawerOpen={false}
      setisDrawerOpen={setIsDrawerOpen}
      // isInfoWindowOpen={false}
      setisInfoWindowOpen={setIsInfoWindowOpen}
      setIsMapActive={setIsMapActive}
    />
  );
};

// --- Main Page Client Component --- //

interface ClientHomeProps {
  initialListings: Listing[];
  initialCategories: Category[];
}

const ClientHome = React.memo(
  ({ initialListings, initialCategories }: ClientHomeProps) => {
    const listings = useAppStore((state) => state.listings);
    const categories = useAppStore((state) => state.categories);
    const setCategories = useAppStore((state) => state.setCategories);
    const selectedCategories = useAppStore((state) => state.selectedCategories);
    const setSelectedCategories = useAppStore(
      (state) => state.setSelectedCategories,
    );
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
    const setIsAddListingOpen = useAppStore(
      (state) => state.setIsAddListingOpen,
    );
    const savedListings = useAppStore((state) => state.savedListings);

    const handleNearMeClick = React.useCallback(async () => {
      setActiveNav("nearme");
      setIsPanelVisible(true);
      setViewMode("RADAR");
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setUserLocation({ lat, lng });

            // All map listings are already loaded; just focus the map here.
            // The side lists sort by distance from userLocation.
            if (mapInstance) {
              mapInstance.panTo({ lat, lng });
              mapInstance.setZoom(12);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
          },
        );
      }
    }, [
      mapInstance,
      setActiveNav,
      setIsPanelVisible,
      setUserLocation,
      setViewMode,
    ]);

    const handleExploreClick = React.useCallback(() => {
      setActiveNav("explore");
      setIsPanelVisible(false);
      setIsMapActive(true);
      setViewMode("RADAR");
    }, [setActiveNav, setIsPanelVisible, setIsMapActive, setViewMode]);

    const handleSavedClick = React.useCallback(() => {
      setActiveNav("saved");
      setIsPanelVisible(true);
      setIsMapActive(true);
    }, [setActiveNav, setIsPanelVisible, setIsMapActive]);

    // Global Grid and Online Only page their own data (see DirectoryView),
    // so the map's listings are never overwritten by those views.

    // An empty category selection means "show everything" (see listingMatchesCategories).
    useEffect(() => {
      if (!categories) setCategories(initialCategories);
    }, [initialCategories, categories, setCategories]);

    const mapListings = listings || initialListings || [];

    // Nearest matches for the mobile list (the desktop panel does the same).
    const mobileNearest = useMemo(() => {
      const matching = mapListings.filter((l) =>
        listingMatchesCategories(l, selectedCategories),
      );
      return {
        listings: userLocation
          ? nearestListings(matching, userLocation, MOBILE_LIST_LIMIT)
          : matching.slice(0, MOBILE_LIST_LIMIT),
        total: matching.length,
      };
    }, [mapListings, selectedCategories, userLocation]);

    const showRadarUI = viewMode === "RADAR";

    return (
      <div
        className={css({
          h: "100dvh",
          w: "100%",
          overflow: "hidden",
          display: "flex",
          flexDir: { base: "column", md: "row" },
          gap: "6",
          p: { base: "4", md: "6" },
          position: "relative",
          zIndex: 10,
          pointerEvents: "none",
        })}
      >
        <ViewToggleContainer />

        {viewMode === "GRID" && <GlobalGrid />}
        {viewMode === "ORBIT" && <OnlineOrbit />}

        <div
          className={css({
            position: "fixed",
            inset: "-24px",
            overflow: "hidden",
            pointerEvents: showRadarUI ? "auto" : "none",
            zIndex: 0,
            opacity: showRadarUI ? 1 : 0,
            transition: "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
          })}
        >
          <MapContainer initialListings={initialListings} />
          <div
            className={css({
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, #0B0B0E, transparent, #0B0B0E)",
              pointerEvents: "none",
            })}
          />
          <RadarOverlay />
        </div>

        <div
          className={css({
            display: { base: "none", md: "block" },
            zIndex: 40,
            pointerEvents: showRadarUI ? "auto" : "none",
            opacity: showRadarUI ? 1 : 0,
            visibility: showRadarUI ? "visible" : "hidden",
            transition: "opacity 0.4s, visibility 0.4s",
          })}
        >
          <SidebarHUD
            activeNav={activeNav}
            onNearMeClick={handleNearMeClick}
            onExploreClick={handleExploreClick}
            onSavedClick={handleSavedClick}
            isPanelVisible={isPanelVisible}
            onTogglePanel={() => setIsPanelVisible(!isPanelVisible)}
          />
        </div>

        {/* Mobile overlays are position:fixed and opt into pointer events
            themselves — no wrapper, so nothing takes layout space or blocks the map. */}
        {showRadarUI && (
          <>
            <MobileTopSearch
              listings={listings || initialListings || []}
              categories={categories || initialCategories || []}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              mapInstance={mapInstance}
              setactiveListing={setActiveListing}
              setisDrawerOpen={setIsDrawerOpen}
            />

            <MobileClosestListingsPanel
              listings={mobileNearest.listings}
              totalCount={mobileNearest.total}
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
          </>
        )}

        <main
          className={css({
            flex: 1,
            display: { base: "none", md: "flex" },
            flexDir: { base: "column", md: "row" },
            gap: "6",
            h: "full",
            overflow: "hidden",
            pointerEvents: "none",
            opacity: showRadarUI ? 1 : 0,
            transition: "opacity 0.4s",
          })}
        >
          {(listings || initialListings) &&
            (categories || initialCategories) &&
            isPanelVisible &&
            showRadarUI && (
              <ActivePulsePanel
                listings={
                  activeNav === "saved"
                    ? savedListings
                    : listings || initialListings
                }
                categories={categories || initialCategories}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                mapInstance={mapInstance}
                setactiveListing={setActiveListing}
                setisDrawerOpen={setIsDrawerOpen}
                setIsAddListingOpen={setIsAddListingOpen}
                userLocation={userLocation}
                onRequestLocation={handleNearMeClick}
                isSavedMode={activeNav === "saved"}
              />
            )}
        </main>

        <MobileBottomStack>
          <FloatingAddButton inStack />
          {showRadarUI && <NearestCardContainer listings={mapListings} />}
        </MobileBottomStack>

        <DetailPanelContainer />
        <FloatingAddButton />
        <AddListingContainer />
        <UserAuthModal />
        <ReportListingModal />
      </div>
    );
  },
);

export default ClientHome;
