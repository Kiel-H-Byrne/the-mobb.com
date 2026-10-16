import ListingCoverImage from "@/components/ListingCoverImage";
import MapAutoComplete from "@/components/Map/MapAutoComplete";
import { Category, Listing } from "@/db/Types";
import {
  countCategories,
  listingMatchesCategories,
  toggleCategory,
} from "@/util/categories";
import { targetClient } from "@/util/functions";
import { nearestListings } from "@/util/location";
import {
  BookmarksIcon,
  CrosshairIcon,
  GlobeHemisphereEastIcon,
  NavigationArrowIcon,
  PlusIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import { css } from "@styled/css";
import React, { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import CategoryPills from "./CategoryPills";

const PANEL_LIST_LIMIT = 40;

interface ListingCard3DProps {
  listing: Listing;
  mapInstance: any;
  setactiveListing: Dispatch<SetStateAction<any>>;
  setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

export const ListingCard3D = React.memo(
  ({
    listing,
    mapInstance,
    setactiveListing,
    setisDrawerOpen,
    distance,
    fullWidth,
  }: ListingCard3DProps & { distance?: string; fullWidth?: boolean }) => {
    const handleClick = () => {
      let locationObj;
      if (listing.coordinates && listing.coordinates.coordinates) {
        locationObj = {
          lat: listing.coordinates.coordinates[1],
          lng: listing.coordinates.coordinates[0],
        };
        targetClient(mapInstance, locationObj);
      }
      setactiveListing(listing);
      setisDrawerOpen(true);
    };

    return (
      <div
        onClick={handleClick}
        className={`group ${css({
          bg: { base: "rgba(255, 255, 255, 0.92)", _dark: "rgba(21, 21, 26, 0.8)" },
          backdropFilter: "blur(24px)",
          borderRadius: "2xl",
          border: "1px solid",
          borderColor: "border.light",
          boxShadow: { base: "0 4px 16px rgba(0,0,0,0.06)", _dark: "none" },
          p: "5",
          cursor: "pointer",
          transition: "all 0.3s",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          width: fullWidth ? "100%" : { base: "85%", md: "100%" },
          height: fullWidth ? "100%" : "auto",
          _hover: {
            transform: "translateY(-5px) scale(1.02)",
            borderColor: "brand.orange",
            boxShadow: {
              base: "0 16px 36px rgba(194, 65, 12, 0.12), 0 4px 12px rgba(0,0,0,0.05)",
              _dark: "0 20px 40px rgba(255,90,0,0.1)",
            },
          },
        })}`}
      >
        <div
          className={css({
            position: "absolute",
            inset: 0,
            bg: {
              base: "linear-gradient(to right, rgba(194,65,12,0.06), transparent)",
              _dark: "linear-gradient(to right, rgba(255,90,0,0.1), transparent)",
            },
            transition: "opacity 0.3s",
            _groupHover: { opacity: 1 },
          })}
        ></div>
        <div
          className={css({
            position: "relative",
            zIndex: 10,
            display: "flex",
            gap: "4",
            alignItems: "center",
          })}
        >
          {/* Image Thumbnail */}
          <div
            className={css({
              w: "20",
              h: "20",
              borderRadius: "xl",
              bg: { base: "gray.100", _dark: "gray.800" },
              border: "1px solid",
              borderColor: "border.light",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            })}
          >
            <ListingCoverImage
              listing={listing}
              sizes="80px"
              className={css({
                opacity: 0.8,
                mixBlendMode: "luminosity",
                _groupHover: { mixBlendMode: "normal" },
                transition: "all 0.5s",
              })}
            />
            <div
              className={css({
                position: "absolute",
                top: "1",
                right: "1",
                w: "2",
                h: "2",
                borderRadius: "full",
                bg: "green.500",
                animation: "pulseSlow",
              })}
            ></div>
          </div>

          <div className={css({ flex: 1, minW: 0 })}>
            <div
              className={css({
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "2",
              })}
            >
              <h3
                className={css({
                  fontWeight: "bold",
                  color: "text.main",
                  fontSize: "lg",
                  lineHeight: "tight",
                  lineClamp: "2",
                  _groupHover: {
                    color: "brand.orange",
                  },
                  transition: "colors",
                })}
              >
                {listing.name}
              </h3>
              <span
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "1",
                  fontSize: "xs",
                  fontFamily: "tech",
                  color: "brand.orange",
                  bg: "brand.orangeMuted",
                  px: "2",
                  py: "1",
                  borderRadius: "md",
                  border: "1px solid",
                  borderColor: { base: "rgba(194, 65, 12, 0.2)", _dark: "transparent" },
                  flexShrink: 0,
                })}
              >
                <NavigationArrowIcon weight="fill" size={12} className="mr-1" />{" "}
                {distance ? distance : "Location"}
              </span>
            </div>
            <p
              className={css({
                fontSize: "xs",
                color: { base: "gray.600", _dark: "gray.400" },
                mt: "1",
                lineClamp: "1",
              })}
            >
              {(listing as any).category?.replace(/_/g, " ") || "Business"}
            </p>

            <div
              className={css({
                display: "flex",
                flexWrap: "wrap",
                gap: "2",
                mt: "3",
                alignItems: "center",
              })}
            >
              <span
                className={css({
                  fontSize: "10px",
                  color: { base: "gray.600", _dark: "gray.500" },
                  fontFamily: "tech",
                  textTransform: "uppercase",
                  letterSpacing: "wider",
                })}
              >
                Community Verified
              </span>
              {listing.categories?.slice(0, 1).map((cat, idx) => (
                <span
                  key={idx}
                  className={css({
                    fontSize: "10px",
                    px: "2",
                    py: "1",
                    borderRadius: "sm",
                    border: "1px solid",
                    borderColor: "border.light",
                    color: { base: "gray.700", _dark: "gray.400" },
                    bg: { base: "black/4", _dark: "transparent" },
                    ml: "auto",
                  })}
                >
                  {cat.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export const ActivePulsePanel = React.memo(
  ({
    listings,
    categories,
    selectedCategories,
    setSelectedCategories,
    mapInstance,
    setactiveListing,
    setisDrawerOpen,
    setIsAddListingOpen,
    userLocation,
    onRequestLocation,
    isSavedMode,
  }: any) => {
    // Every map listing is loaded, so the list shows the nearest few rather
    // than rendering hundreds of cards.
    const { visibleListings, matchingCount } = useMemo(() => {
      const filtered = listings.filter((listing: Listing) => {
        if (isSavedMode) return true; // Don't filter saved listings by category
        return listingMatchesCategories(listing, selectedCategories);
      });
      if (!userLocation) {
        return { visibleListings: filtered, matchingCount: filtered.length };
      }
      return {
        visibleListings: nearestListings(
          filtered,
          userLocation,
          isSavedMode ? Infinity : PANEL_LIST_LIMIT,
        ),
        matchingCount: filtered.length,
      };
    }, [listings, selectedCategories, userLocation, isSavedMode]);

    // Counts reflect what's loaded on the map, so they match the markers.
    const categoryCounts = useMemo(() => countCategories(listings), [listings]);
    const handleToggleCategory = useCallback(
      (name: string) =>
        setSelectedCategories(toggleCategory(selectedCategories, name)),
      [selectedCategories, setSelectedCategories],
    );
    const handleClearCategories = useCallback(
      () => setSelectedCategories(new Set()),
      [setSelectedCategories],
    );

    return (
      <section
        className={css({
          width: { base: "100%", md: "420px", lg: "480px" },
          height: { base: "auto", md: "100%" },
          maxHeight: { base: "60dvh", md: "100%" },
          marginTop: { base: "auto", md: "0" },
          bg: "bg.glass",
          backdropFilter: "blur(32px)",
          border: "1px solid",
          borderColor: "border.light",
          boxShadow: "glass",
          borderRadius: "2xl",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          zIndex: 20,
          pointerEvents: "auto",
        })}
      >
        <div
          className={css({
            p: { base: "4", md: "6" },
            borderBottom: "1px solid",
            borderColor: "border.light",
            display: "flex",
            flexDir: "column",
            gap: { base: "3", md: "6" },
          })}
        >
          <div
            className={css({
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            })}
          >
            <div>
              <h1
                className={css({
                  fontSize: "3xl",
                  fontFamily: "tech",
                  fontWeight: "bold",
                  color: "text.main",
                  letterSpacing: "tight",
                })}
              >
                {isSavedMode ? "Saved Bookmarks " : "Explore "}
                <span className={css({ color: "brand.orange" })}>.</span>
              </h1>
              <div
                className={css({
                  fontSize: "sm",
                  color: { base: "gray.600", _dark: "gray.400" },
                  mt: "1",
                  display: "flex",
                  alignItems: "center",
                  gap: "2",
                })}
              >
                {isSavedMode ? (
                  <>
                    <BookmarksIcon
                      weight="fill"
                      size={16}
                      className={css({ color: "brand.orange" })}
                    />
                    Your curated collection of businesses
                  </>
                ) : (
                  <>
                    <CrosshairIcon
                      weight="fill"
                      size={16}
                      className={css({ color: "brand.orange" })}
                    />
                    Find businesses near your location
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={css({ position: "relative", w: "full" })}>
            <MapAutoComplete
              categories={categories}
              mapInstance={mapInstance}
              setactiveListing={setactiveListing}
              setisDrawerOpen={setisDrawerOpen}
            />
          </div>
          {!isSavedMode && (
            <CategoryPills
              categories={categoryCounts}
              selected={selectedCategories}
              onToggle={handleToggleCategory}
              onClear={handleClearCategories}
              collapsedCount={8}
            />
          )}
        </div>

        <div
          className={css({
            flex: "1",
            overflowX: { base: "auto", md: "hidden" },
            overflowY: { base: "hidden", md: "auto" },
            px: { base: "4", md: "6" },
            py: "4",
            display: "flex",
            flexDir: { base: "row", md: "column" },
            gap: "4",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          })}
        >
          {!userLocation && !isSavedMode ? (
            <div
              className={css({
                p: 6,
                textAlign: "center",
                display: "flex",
                flexDir: "column",
                alignItems: "center",
                justifyContent: "center",
                h: "full",
                w: "full",
              })}
            >
              <GlobeHemisphereEastIcon
                weight="duotone"
                size={64}
                className={css({ color: "brand.orange", mb: 4, opacity: 0.8 })}
              />
              <h3
                className={css({
                  color: "text.main",
                  fontSize: "xl",
                  fontWeight: "bold",
                  mb: 2,
                })}
              >
                Location Access Needed
              </h3>
              <p
                className={css({
                  color: "text.muted",
                  fontSize: "sm",
                  mb: 6,
                  maxWidth: "300px",
                })}
              >
                Enable location services to discover verified Black-owned
                businesses near you.
              </p>
              <button
                onClick={onRequestLocation}
                className={css({
                  w: "full",
                  bg: "brand.orange",
                  color: { base: "white", _dark: "black" },
                  px: "6",
                  py: "3",
                  borderRadius: "full",
                  fontSize: "sm",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _hover: {
                    filter: "brightness(1.1)",
                    transform: "scale(1.02)",
                  },
                  transition: "all 0.2s",
                  boxShadow: { base: "0 4px 14px rgba(194, 65, 12, 0.35)", _dark: "glow" },
                  mb: 3,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2",
                })}
              >
                <TargetIcon weight="bold" size={18} /> Find Near Me
              </button>
              <button
                onClick={() => setIsAddListingOpen(true)}
                className={css({
                  w: "full",
                  bg: { base: "black/5", _dark: "white/5" },
                  border: "1px solid",
                  borderColor: "border.light",
                  color: "text.main",
                  px: "6",
                  py: "3",
                  borderRadius: "full",
                  fontSize: "sm",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _hover: { bg: { base: "black/10", _dark: "white/10" } },
                  transition: "all 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "2",
                })}
              >
                <PlusIcon weight="bold" size={18} /> Add a Business
              </button>
            </div>
          ) : visibleListings.length === 0 ? (
            <div
              className={css({
                p: 6,
                textAlign: "center",
                display: "flex",
                flexDir: "column",
                alignItems: "center",
                justifyContent: "center",
                h: "full",
                w: "full",
              })}
            >
              {isSavedMode ? (
                <>
                  <BookmarksIcon
                    weight="duotone"
                    size={64}
                    className={css({
                      color: "brand.orange",
                      mb: 4,
                      opacity: 0.8,
                    })}
                  />
                  <h3
                    className={css({
                      color: "text.main",
                      fontSize: "lg",
                      fontWeight: "bold",
                      mb: 2,
                    })}
                  >
                    No Saved Businesses
                  </h3>
                  <p
                    className={css({
                      color: "text.muted",
                      fontSize: "sm",
                      mb: 6,
                    })}
                  >
                    You haven't bookmarked any businesses yet.
                  </p>
                </>
              ) : (
                <>
                  <TargetIcon
                    weight="duotone"
                    size={64}
                    className={css({
                      color: "brand.orange",
                      mb: 4,
                      opacity: 0.8,
                    })}
                  />
                  <h3
                    className={css({
                      color: "text.main",
                      fontSize: "lg",
                      fontWeight: "bold",
                      mb: 2,
                    })}
                  >
                    No Businesses Found
                  </h3>
                  <p
                    className={css({
                      color: "text.muted",
                      fontSize: "sm",
                      mb: 6,
                    })}
                  >
                    We couldn't locate any businesses matching these parameters
                    in this area.
                  </p>
                  <button
                    onClick={() => setIsAddListingOpen(true)}
                    className={css({
                      bg: "brand.orange",
                      color: { base: "white", _dark: "black" },
                      px: "6",
                      py: "3",
                      borderRadius: "full",
                      fontSize: "sm",
                      fontWeight: "bold",
                      cursor: "pointer",
                      _hover: {
                        filter: "brightness(1.1)",
                        transform: "scale(1.05)",
                      },
                      transition: "all 0.2s",
                      boxShadow: { base: "0 4px 14px rgba(194, 65, 12, 0.35)", _dark: "glow" },
                    })}
                  >
                    <PlusIcon weight="bold" size={18} className="mr-2" /> Add a
                    Business
                  </button>
                </>
              )}
            </div>
          ) : (
            <>
              {!isSavedMode && (
                <p
                  aria-live="polite"
                  className={css({
                    display: { base: "none", md: "block" },
                    flexShrink: 0,
                    fontSize: "xs",
                    fontFamily: "tech",
                    color: { base: "gray.600", _dark: "gray.500" },
                  })}
                >
                  {visibleListings.length < matchingCount
                    ? `${visibleListings.length} nearest of ${matchingCount.toLocaleString()} businesses`
                    : `${matchingCount.toLocaleString()} businesses`}
                  {selectedCategories.size > 0 ? " in these categories" : ""}
                </p>
              )}
              {visibleListings.map((listing: any, i: number) => (
                <ListingCard3D
                  key={listing._id || i}
                  listing={listing}
                  mapInstance={mapInstance}
                  setactiveListing={setactiveListing}
                  setisDrawerOpen={setisDrawerOpen}
                  distance={listing._formattedDistance}
                />
              ))}
            </>
          )}
        </div>
      </section>
    );
  },
);
