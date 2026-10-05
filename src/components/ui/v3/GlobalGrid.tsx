import { Listing } from "@/db/Types";
import { useAppStore } from "@/store/useAppStore";
import { distanceMiles, formatMiles } from "@/util/location";
import { css } from "@styled/css";
import { useCallback } from "react";
import { ListingCard3D } from "./ActivePulsePanel";
import DirectoryView, { DirectoryCardContext } from "./DirectoryView";

export const GlobalGrid = () => {
  const mapInstance = useAppStore((s) => s.mapInstance);
  const setActiveListing = useAppStore((s) => s.setActiveListing);
  const setIsDrawerOpen = useAppStore((s) => s.setIsDrawerOpen);

  const renderCard = useCallback(
    (listing: Listing, { location }: DirectoryCardContext) => {
      // In radius searches, show how far each listing is from the origin.
      const coords = listing.coordinates?.coordinates;
      const distance =
        location?.kind === "radius" && coords?.length === 2
          ? formatMiles(
              distanceMiles(location, { lat: coords[1], lng: coords[0] }),
            )
          : "Global";
      return (
        <ListingCard3D
          listing={listing}
          mapInstance={mapInstance}
          setactiveListing={setActiveListing}
          setisDrawerOpen={setIsDrawerOpen}
          distance={distance}
          fullWidth
        />
      );
    },
    [mapInstance, setActiveListing, setIsDrawerOpen],
  );

  return (
    <DirectoryView
      scope="all"
      noun="businesses"
      enableLocation
      renderCard={renderCard}
      header={
        <>
          <h1
            className={css({
              fontSize: { base: "4xl", md: "6xl" },
              fontFamily: "tech",
              fontWeight: "bold",
              color: "white",
              mb: "4",
            })}
          >
            The Global{" "}
            <span className={css({ color: "brand.orange" })}>Directory</span>
          </h1>
          <p
            className={css({
              color: "gray.400",
              mb: "8",
              maxW: "2xl",
              fontSize: { base: "md", md: "lg" },
            })}
          >
            Explore the entire MOBB ecosystem without physical boundaries.
            Discover verified Black-owned businesses across the world.
          </p>
        </>
      }
    />
  );
};

export default GlobalGrid;
