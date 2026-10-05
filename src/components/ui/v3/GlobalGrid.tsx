import { css } from "@styled/css";
import { useState, useMemo } from "react";
import { Listing, Category } from "@/db/Types";
import { useAppStore } from "@/store/useAppStore";
import { ListingCard3D } from "./ActivePulsePanel";
import CategoryFilter from "@/components/Map/CategoryFilter";

export const GlobalGrid = ({ listings }: { listings: Listing[] }) => {
  // Localized filtering state for Grid View
  const globalCategories = useAppStore(s => s.categories) || [];
  const [selectedFilters, setSelectedFilters] = useState<Set<Category>>(new Set());

  const mapInstance = useAppStore(s => s.mapInstance);
  const setActiveListing = useAppStore(s => s.setActiveListing);
  const setIsDrawerOpen = useAppStore(s => s.setIsDrawerOpen);

  const gridData = useMemo(() => {
    return listings.filter((listing) => {
      const hasMatch =
        listing.categories &&
        listing.categories.some((el: Category) => selectedFilters.has(el));
      const noCategories = !listing.categories || listing.categories.length === 0;
      return selectedFilters.size === 0 || hasMatch || (selectedFilters.has("Uncategorized" as any) && noCategories);
    });
  }, [listings, selectedFilters]);
  return (
    <div
      className={css({
        position: "absolute",
        inset: 0,
        zIndex: 5,
        overflowY: "auto",
        pt: "24",
        pb: "32",
        px: { base: "4", md: "12" },
        bg: "#0B0B0E",
        pointerEvents: "auto",
      })}
    >
      <div className={css({ maxW: "7xl", mx: "auto" })}>
        <h1
          className={css({
            fontSize: { base: "4xl", md: "6xl" },
            fontFamily: "tech",
            fontWeight: "bold",
            color: "white",
            mb: "4",
          })}
        >
          The Global <span className={css({ color: "brand.orange" })}>Directory</span>
        </h1>
        <p className={css({ color: "gray.400", mb: "12", maxW: "2xl", fontSize: "lg" })}>
          Explore the entire MOBB ecosystem without physical boundaries. Use our advanced masonry grid to discover verified Black-owned businesses across the world.
        </p>

        {/* Localized Filter Controls */}
        <div className={css({ 
          display: "flex", 
          alignItems: "center", 
          gap: "4", 
          mb: "8",
          pb: "4",
          borderBottom: "1px solid",
          borderColor: "white/5"
        })}>
          <CategoryFilter
            listings={gridData} // count logic will be scoped to loaded data
            categories={globalCategories as Category[]}
            selectedCategories={selectedFilters}
            setSelectedCategories={setSelectedFilters}
          />
          {selectedFilters.size > 0 && (
            <span className={css({ color: "gray.400", fontSize: "sm", fontFamily: "tech" })}>
              {gridData.length} records matched
            </span>
          )}
        </div>

        {/* Responsive Grid */}
        <div className={css({
          display: "grid",
          gridTemplateColumns: { base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" },
          gap: "6"
        })}>
          {gridData.map((listing, i) => (
            <div key={listing._id || i} className={css({ h: "100px" })}>
              <ListingCard3D
                listing={listing}
                mapInstance={mapInstance}
                setactiveListing={setActiveListing}
                setisDrawerOpen={setIsDrawerOpen}
                distance={"Global"}
              />
            </div>
          ))}
        </div>


      </div>
    </div>
  );
};

export default GlobalGrid;

