import MapAutoComplete from "@/components/Map/MapAutoComplete";
import CategoryFilter from "@/components/Map/CategoryFilter";
import { Category, Listing } from "@/db/Types";
import { css } from "@styled/css";
import { Dispatch, SetStateAction } from "react";

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
            <div className={css({ 
                pointerEvents: "auto", 
                w: "full", 
                display: "flex", 
                alignItems: "center", 
                gap: "2" 
            })}>
                <div className={css({ flex: 1, position: "relative" })}>
                    <MapAutoComplete
                        listings={listings}
                        categories={categories}
                        mapInstance={mapInstance}
                        setactiveListing={setactiveListing}
                        setisDrawerOpen={setisDrawerOpen}
                    />
                </div>
                
                <div className={css({ width: "1px", height: "8", bg: "white/10" })}></div>
                
                <CategoryFilter 
                    listings={listings}
                    categories={categories}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                />
            </div>
        </div>
    );
};
