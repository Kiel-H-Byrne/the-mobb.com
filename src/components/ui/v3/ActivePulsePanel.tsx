import CategoryFilter from "@/components/Map/CategoryFilter";
import MapAutoComplete from "@/components/Map/MapAutoComplete";
import { Category, Listing } from "@/db/Types";
import { targetClient } from "@/util/functions";
import {
  BookmarksIcon,
  CrosshairIcon,
  GlobeHemisphereEastIcon,
  NavigationArrowIcon,
  PlusIcon,
  TargetIcon,
} from "@phosphor-icons/react";
import { css } from "@styled/css";
import Image from "next/image";
import React, { Dispatch, SetStateAction, useMemo } from "react";

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
  }: ListingCard3DProps & { distance?: string }) => {
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
          bg: "rgba(21, 21, 26, 0.8)",
          backdropFilter: "blur(24px)",
          borderRadius: "2xl",
          border: "1px solid",
          borderColor: "white/5",
          p: "5",
          cursor: "pointer",
          transition: "all 0.3s",
          position: "relative",
          overflow: "hidden",
          flexShrink: 0,
          width: { base: "85%", md: "100%" },
          _hover: {
            transform: "translateY(-5px) scale(1.02)",
            borderColor: "rgba(255,90,0,0.4)",
            boxShadow: "0 20px 40px rgba(255,90,0,0.1)",
          },
        })}`}
      >
        <div
          className={css({
            position: "absolute",
            inset: 0,
            bg: "linear-gradient(to right, rgba(255,90,0,0.1), transparent)",
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
              bg: "gray.800",
              border: "1px solid",
              borderColor: "white/10",
              overflow: "hidden",
              position: "relative",
              flexShrink: 0,
            })}
          >
            {listing.image || listing.og_image ? (
              <Image
                src={
                  typeof listing.image === "string"
                    ? listing.image
                    : (listing.image as any)?.url || listing.og_image || ""
                }
                fill
                className={css({
                  objectFit: "cover",
                  opacity: 0.8,
                  mixBlendMode: "luminosity",
                  _groupHover: { mixBlendMode: "normal" },
                  transition: "all 0.5s",
                })}
                alt={listing.name || listing.og_title || "Listing Image"}
              />
            ) : (
              <div
                className={css({
                  w: "full",
                  h: "full",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                })}
              >
                {/* <i className="ph-duotone ph-image text-2xl text-gray-600"></i> */}
                <Image
                  src="/images/mobb_placeholder.png"
                  alt=""
                  fill
                  className={css({ objectFit: "cover" })}
                />
              </div>
            )}
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
                  color: "white",
                  fontSize: "lg",
                  lineHeight: "tight",
                  lineClamp: "2",
                  _groupHover: {
                    color: "brand.glow",
                    textShadow: "0 0 20px rgba(255, 90, 0, 0.6)",
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
                color: "gray.400",
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
                  color: "gray.500",
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
                    borderColor: "white/10",
                    color: "gray.400",
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
    const visibleListings = useMemo(() => {
      let filtered = listings.filter((listing: Listing) => {
        if (isSavedMode) return true; // Don't filter saved listings by category

        const hasMatch =
          listing.categories &&
          listing.categories.some((el: Category) => selectedCategories.has(el));
        const noCategories =
          !listing.categories || listing.categories.length === 0;
        return hasMatch || noCategories;
      });

      if (filtered.length > 0) {
        if (userLocation && window.google?.maps?.geometry) {
          const routingCenter = new window.google.maps.LatLng(userLocation);
          return filtered
            .map((listing: Listing) => {
              const coords = listing.coordinates?.coordinates;
              let dist = Infinity;
              let formattedDist = "";

              if (coords && coords.length > 1) {
                try {
                  const posObj = new window.google.maps.LatLng({
                    lat: coords[1],
                    lng: coords[0],
                  });
                  const distanceMeters =
                    window.google.maps.geometry.spherical.computeDistanceBetween(
                      posObj,
                      routingCenter,
                    );
                  dist = distanceMeters;

                  // Convert to miles and format
                  const miles = distanceMeters * 0.000621371;
                  formattedDist =
                    miles < 0.1 ? "<0.1 mi" : `${miles.toFixed(1)} mi`;
                } catch (e) {
                  console.error("Error computing spherical distance", e);
                }
              }

              return {
                ...listing,
                _distance: dist,
                _formattedDistance: formattedDist,
              };
            })
            .sort((a: any, b: any) => a._distance - b._distance);
        }
      }
      return filtered;
    }, [listings, selectedCategories, userLocation]);

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
            borderColor: "white/5",
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
                  color: "white",
                  letterSpacing: "tight",
                })}
              >
                {isSavedMode ? "Saved Bookmarks " : "Explore "}
                <span className={css({ color: "brand.orange" })}>.</span>
              </h1>
              <div
                className={css({
                  fontSize: "sm",
                  color: "gray.400",
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

          <div
            className={css({
              position: "relative",
              w: "full",
              display: "flex",
              alignItems: "center",
              gap: "2",
            })}
          >
            <div className={css({ flex: 1 })}>
              <MapAutoComplete
                categories={categories}
                mapInstance={mapInstance}
                setactiveListing={setactiveListing}
                setisDrawerOpen={setisDrawerOpen}
              />
            </div>
            <div
              className={css({ width: "1px", height: "8", bg: "white/10" })}
            ></div>
            <CategoryFilter
              listings={listings}
              categories={categories}
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
            />
          </div>
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
                className={css({ color: "brand.orange", mb: 4, opacity: 0.7 })}
              />
              <h3
                className={css({
                  color: "white",
                  fontSize: "xl",
                  fontWeight: "bold",
                  mb: 2,
                })}
              >
                Location Access Needed
              </h3>
              <p
                className={css({
                  color: "gray.400",
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
                  color: "black",
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
                  boxShadow: "glow",
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
                  bg: "white/5",
                  border: "1px solid",
                  borderColor: "white/10",
                  color: "white",
                  px: "6",
                  py: "3",
                  borderRadius: "full",
                  fontSize: "sm",
                  fontWeight: "bold",
                  cursor: "pointer",
                  _hover: { bg: "white/10" },
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
                      opacity: 0.7,
                    })}
                  />
                  <h3
                    className={css({
                      color: "white",
                      fontSize: "lg",
                      fontWeight: "bold",
                      mb: 2,
                    })}
                  >
                    No Saved Businesses
                  </h3>
                  <p
                    className={css({
                      color: "gray.400",
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
                      opacity: 0.7,
                    })}
                  />
                  <h3
                    className={css({
                      color: "white",
                      fontSize: "lg",
                      fontWeight: "bold",
                      mb: 2,
                    })}
                  >
                    No Businesses Found
                  </h3>
                  <p
                    className={css({
                      color: "gray.400",
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
                      color: "black",
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
                      boxShadow: "glow",
                    })}
                  >
                    <PlusIcon weight="bold" size={18} className="mr-2" /> Add a
                    Business
                  </button>
                </>
              )}
            </div>
          ) : (
            visibleListings.map((listing: any, i: number) => (
              <ListingCard3D
                key={listing._id || i}
                listing={listing}
                mapInstance={mapInstance}
                setactiveListing={setactiveListing}
                setisDrawerOpen={setisDrawerOpen}
                distance={listing._formattedDistance}
              />
            ))
          )}
        </div>
      </section>
    );
  },
);
