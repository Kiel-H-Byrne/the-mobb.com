import MapAutoComplete from "@/components/Map/MapAutoComplete";
import { Category, Listing } from "@/db/Types";
import { countCategories, toggleCategory } from "@/util/categories";
import { css } from "@styled/css";
import { Dispatch, SetStateAction, useCallback, useMemo } from "react";
import CategoryPills from "./CategoryPills";

interface MobileTopSearchProps {
  listings: Listing[];
  categories: Category[];
  selectedCategories: Set<Category>;
  setSelectedCategories: Dispatch<SetStateAction<Set<Category>>>;
  mapInstance: any;
  setactiveListing: Dispatch<SetStateAction<any>>;
  setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * The Seeker
 * A floating search pill at the top of the mobile map,
 * including a horizontally scrollable "Quick Needs" row.
 */
export const MobileTopSearch = ({
  listings,
  categories,
  selectedCategories,
  setSelectedCategories,
  mapInstance,
  setactiveListing,
  setisDrawerOpen,
}: MobileTopSearchProps) => {
  const categoryCounts = useMemo(() => countCategories(listings), [listings]);
  const handleToggle = useCallback(
    (name: string) =>
      setSelectedCategories(toggleCategory(selectedCategories, name)),
    [selectedCategories, setSelectedCategories],
  );
  const handleClear = useCallback(
    () => setSelectedCategories(new Set()),
    [setSelectedCategories],
  );

  return (
    <div
      className={css({
        position: "fixed",
        top: "4",
        left: "4",
        right: "4",
        zIndex: 50,
        display: { base: "flex", md: "none" },
        flexDirection: "column",
        gap: "4",
        pointerEvents: "none", // Let clicks pass through empty space
      })}
    >
      <div
        className={css({
          pointerEvents: "auto",
          w: "full",
          display: "flex",
          alignItems: "center",
          gap: "2",
        })}
      >
        <div className={css({ flex: 1, position: "relative" })}>
          <MapAutoComplete
            categories={categories}
            mapInstance={mapInstance}
            setactiveListing={setactiveListing}
            setisDrawerOpen={setisDrawerOpen}
          />
        </div>
      </div>

      {/* Swipeable category pills (a single row, so it only covers a thin strip of the map) */}
      <div className={css({ pointerEvents: "auto", mx: "-4", px: "4" })}>
        <CategoryPills
          categories={categoryCounts}
          selected={selectedCategories}
          onToggle={handleToggle}
          onClear={handleClear}
          variant="floating"
          collapsedCount={10}
        />
      </div>
    </div>
  );
};
