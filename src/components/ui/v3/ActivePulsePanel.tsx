import MapAutoComplete from "@/components/Map/MapAutoComplete";
import { Category, Listing } from "@/db/Types";
import { targetClient } from "@/util/functions";
import { ToggleGroup } from "@ark-ui/react/toggle-group";
import { css } from "@styled/css";
import { Dispatch, SetStateAction } from "react";

interface ListingCard3DProps {
  listing: Listing;
  mapInstance: any;
  setactiveListing: Dispatch<SetStateAction<any>>;
  setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

export const ListingCard3D = ({
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
          {listing.image ? (
            <img
              src={typeof listing.image === 'string' ? listing.image : (listing.image as any)?.url || ''}
              className={css({
                w: "full",
                h: "full",
                objectFit: "cover",
                opacity: 0.8,
                mixBlendMode: "luminosity",
                _groupHover: { mixBlendMode: "normal" },
                transition: "all 0.5s",
              })}
              alt={listing.name}
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
              <i className="ph-duotone ph-image text-2xl text-gray-600"></i>
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
              <i className="ph-fill ph-navigation-arrow"></i> {distance ? distance : "Target"}
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
            {(listing as any).category?.replace(/_/g, " ") || "Enterprise"}
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
};

export const ActivePulsePanel = ({
  listings,
  categories,
  selectedCategories,
  setSelectedCategories,
  mapInstance,
  setactiveListing,
  setisDrawerOpen,
  setIsAddListingOpen,
}: any) => {
  // Filter listings based on selected categories
  let visibleListings = listings.filter((listing: Listing) => {
    const hasMatch =
      listing.categories &&
      listing.categories.some((el: Category) => selectedCategories.has(el));
    const noCategories = !listing.categories || listing.categories.length === 0;
    return hasMatch || noCategories;
  });

  // Calculate distances and sort dynamically
  if (mapInstance && visibleListings.length > 0) {
    const center = mapInstance.getCenter();
    if (center && window.google?.maps?.geometry) {
      visibleListings = visibleListings.map((listing: Listing) => {
        const coords = listing.coordinates?.coordinates;
        let dist = Infinity;
        let formattedDist = "";

        if (coords && coords.length > 1) {
          try {
            const posObj = new window.google.maps.LatLng({ lat: coords[1], lng: coords[0] });
            const distanceMeters = window.google.maps.geometry.spherical.computeDistanceBetween(posObj, center);
            dist = distanceMeters;

            // Convert to miles and format
            const miles = distanceMeters * 0.000621371;
            formattedDist = miles < 0.1 ? "<0.1 mi" : `${miles.toFixed(1)} mi`;
          } catch (e) {
            console.error("Error computing spherical distance", e);
          }
        }

        // Return an augmented object for sorting
        return { ...listing, _distance: dist, _formattedDistance: formattedDist };
      }).sort((a: any, b: any) => a._distance - b._distance);
    }
  }

  return (
    <section
      className={css({
        width: { base: "100%", md: "420px", lg: "480px" },
        height: { base: "auto", md: "100%" },
        maxHeight: { base: "60dvh", md: "100%" },
        marginTop: { base: "auto", md: "0" },
        background: "brand.glass",
        backdropFilter: "blur(24px)",
        border: "1px solid",
        borderColor: "border.light",
        boxShadow: "glass",
        borderRadius: "2xl",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        zIndex: 20,
        pointerEvents: "auto"
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
              Active Pulse{" "}
              <span className={css({ color: "brand.orange" })}>.</span>
            </h1>
            <p
              className={css({
                fontSize: "sm",
                color: "gray.400",
                mt: "1",
                display: "flex",
                alignItems: "center",
                gap: "2",
              })}
            >
              <i className="ph-fill ph-crosshair text-brand-orange"></i> Live
              Geolocation Sync
            </p>
          </div>
          <button
            className={css({
              w: "10",
              h: "10",
              borderRadius: "xl",
              bg: "white/5",
              border: "1px solid",
              borderColor: "white/10",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              _hover: {
                bg: "brand.orangeMuted",
                borderColor: "brand.orange/50",
              },
              transition: "colors",
            })}
          >
            <i className="ph ph-sliders-horizontal text-xl text-white"></i>
          </button>
        </div>

        <div className={css({ position: "relative", w: "full" })}>
          <MapAutoComplete
            listings={listings}
            categories={categories}
            mapInstance={mapInstance}
            setactiveListing={setactiveListing}
            setisDrawerOpen={setisDrawerOpen}
          />
        </div>

        {/* Category Pills */}
        <ToggleGroup.Root
          multiple
          value={Array.from(selectedCategories)}
          onValueChange={(details) => setSelectedCategories(new Set(details.value))}
          className={css({
            display: "flex",
            gap: "3",
            overflowX: "auto",
            pb: "2",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          })}
        >
          <button
            onClick={() => setSelectedCategories(new Set())}
            className={css({
              px: "4",
              py: "2",
              borderRadius: "xl",
              fontSize: "xs",
              fontWeight: "bold",
              whiteSpace: "nowrap",
              cursor: "pointer",
              transition: "colors",
              ...(selectedCategories.size === 0
                ? {
                  bg: "brand.orange",
                  color: "white",
                  boxShadow: "0 4px 20px rgba(255,90,0,0.3)",
                }
                : {
                  bg: "white/5",
                  border: "1px solid",
                  borderColor: "white/10",
                  color: "gray.300",
                  _hover: { bg: "white/10" },
                }),
            })}
          >
            All Categories
          </button>
          {categories.map((cat: string) => {
            const isSelected = selectedCategories.has(cat);
            return (
              <ToggleGroup.Item
                key={cat}
                value={cat}
                className={css({
                  px: "4",
                  py: "2",
                  borderRadius: "xl",
                  fontSize: "xs",
                  fontWeight: "bold",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "colors",
                  ...(isSelected
                    ? {
                      bg: "brand.orange",
                      color: "white",
                      boxShadow: "0 4px 20px rgba(255,90,0,0.3)",
                    }
                    : {
                      bg: "white/5",
                      border: "1px solid",
                      borderColor: "white/10",
                      color: "gray.300",
                      _hover: { bg: "white/10" },
                    }),
                })}
              >
                {cat.replace(/_/g, " ")}
              </ToggleGroup.Item>
            );
          })}
        </ToggleGroup.Root>
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

        {visibleListings.length === 0 && (
          <div
            className={css({
              p: 6,
              textAlign: "center",
              display: "flex",
              flexDir: "column",
              alignItems: "center",
              justifyContent: "center",
              h: "full",
            })}
          >
            <i className="ph-duotone ph-radar text-6xl text-brand-orange mb-4 opacity-70"></i>
            <h3
              className={css({
                color: "white",
                fontSize: "lg",
                fontWeight: "bold",
                mb: 2,
              })}
            >
              No Signal Detected
            </h3>
            <p className={css({ color: "gray.400", fontSize: "sm", mb: 6 })}>
              We couldn't locate any businesses matching these parameters in the
              current sector.
            </p>
            <button
              onClick={() => setIsAddListingOpen(true)}
              className={css({
                bg: "brand.orange",
                color: "white",
                px: "6",
                py: "3",
                borderRadius: "full",
                fontSize: "sm",
                fontWeight: "bold",
                cursor: "pointer",
                _hover: { filter: "brightness(1.1)", transform: "scale(1.05)" },
                transition: "all 0.2s",
                boxShadow: "glow",
              })}
            >
              <i className="ph-bold ph-plus mr-2"></i> Register Enterprise
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
