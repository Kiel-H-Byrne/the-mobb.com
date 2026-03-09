import MapAutoComplete from "@/components/Map/MapAutoComplete";
import { Category, Listing } from "@/db/Types";
import { ToggleGroup } from "@ark-ui/react/toggle-group";
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
            <div className={css({ pointerEvents: "auto" })}>
                <MapAutoComplete
                    listings={listings}
                    categories={categories}
                    mapInstance={mapInstance}
                    setactiveListing={setactiveListing}
                    setisDrawerOpen={setisDrawerOpen}
                />
            </div>

            {/* Quick Needs Row */}
            <div className={css({ pointerEvents: "auto", w: "full" })}>
                <ToggleGroup.Root
                    multiple
                    value={Array.from(selectedCategories)}
                    onValueChange={(details) =>
                        setSelectedCategories(new Set(details.value as Category[]))
                    }
                    className={css({
                        display: "flex",
                        gap: "2",
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
                            borderRadius: "full",
                            fontSize: "xs",
                            fontWeight: "bold",
                            fontFamily: "tech",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                            transition: "colors",
                            border: "1px solid",
                            ...(selectedCategories.size === 0
                                ? {
                                    bg: "brand.orange",
                                    borderColor: "brand.orange",
                                    color: "black",
                                    boxShadow: "0 0 10px rgba(255,90,0,0.4)",
                                }
                                : {
                                    bg: "rgba(21, 21, 26, 0.8)",
                                    backdropFilter: "blur(24px)",
                                    borderColor: "white/10",
                                    color: "gray.300",
                                }),
                        })}
                    >
                        All Signal
                    </button>
                    {categories.slice(0, 10).map((cat: string) => {
                        const isSelected = selectedCategories.has(cat as Category);
                        return (
                            <ToggleGroup.Item
                                key={cat}
                                value={cat}
                                className={css({
                                    px: "4",
                                    py: "2",
                                    borderRadius: "full",
                                    fontSize: "xs",
                                    fontWeight: "bold",
                                    fontFamily: "tech",
                                    textTransform: "uppercase",
                                    whiteSpace: "nowrap",
                                    cursor: "pointer",
                                    transition: "colors",
                                    border: "1px solid",
                                    ...(isSelected
                                        ? {
                                            bg: "brand.orange",
                                            borderColor: "brand.orange",
                                            color: "black",
                                            boxShadow: "0 0 10px rgba(255,90,0,0.4)",
                                        }
                                        : {
                                            bg: "rgba(21, 21, 26, 0.8)",
                                            backdropFilter: "blur(24px)",
                                            borderColor: "white/10",
                                            color: "gray.300",
                                        }),
                                })}
                            >
                                {cat.replace(/_/g, " ")}
                            </ToggleGroup.Item>
                        );
                    })}
                </ToggleGroup.Root>
            </div>
        </div>
    );
};
