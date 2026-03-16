import { Listing } from "@/db/Types";
import { css } from "@styled/css";
import { Dispatch, SetStateAction, useState } from "react";
import { ListingCard3D } from "./ActivePulsePanel";

interface MobileSavedListingsPanelProps {
    listings: Listing[];
    mapInstance: any;
    setactiveListing: Dispatch<SetStateAction<any>>;
    setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * The Saved Listings
 * An expanding right-side tab/drawer for the user's saved listings.
 * Positioned slightly lower than the Nearby tab.
 */
export const MobileSavedListingsPanel = ({
    listings,
    mapInstance,
    setactiveListing,
    setisDrawerOpen,
}: MobileSavedListingsPanelProps) => {
    const [isOpen, setIsOpen] = useState(false);

    // If no saved listings, don't show the tab
    if (!listings || listings.length === 0) return null;

    return (
        <>
            {/* The floating Tab */}
            <div
                className={css({
                    position: "fixed",
                    right: "0",
                    top: "calc(50% + 90px)", // Positioned below the NEARBY tab
                    transform: "translateY(-50%)",
                    zIndex: 45,
                    display: { base: "flex", md: "none" },
                    pointerEvents: "auto",
                })}
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className={css({
                        bg: "rgba(21, 21, 26, 0.9)",
                        backdropFilter: "blur(12px)",
                        border: "1px solid",
                        borderColor: "white/20",
                        borderRight: "none",
                        borderTopLeftRadius: "xl",
                        borderBottomLeftRadius: "xl",
                        py: "4",
                        px: "1",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "2",
                        boxShadow: "-5px 0 20px rgba(0,0,0,0.5)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        _hover: { pr: "2", bg: "rgba(21, 21, 26, 1)" },
                    })}
                >
                    <i className="ph-fill ph-bookmarks text-gray-300 text-xl"></i>
                    <span
                        className={css({
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                            color: "gray.300",
                            fontFamily: "tech",
                            fontSize: "10px",
                            fontWeight: "bold",
                            letterSpacing: "widest",
                            transform: "rotate(180deg)",
                        })}
                    >
                        SAVED
                    </span>
                    <div className={css({ w: "6px", h: "6px", borderRadius: "full", bg: "gray.300", animation: "pulseSlow" })}></div>
                </button>
            </div>

            {/* The Drawer View */}
            {isOpen && (
                <div
                    className={css({
                        position: "fixed",
                        inset: 0,
                        zIndex: 2000,
                        display: { base: "flex", md: "none" },
                        justifyContent: "flex-end",
                        pointerEvents: "auto",
                    })}
                >
                    {/* Backdrop */}
                    <div
                        onClick={() => setIsOpen(false)}
                        className={css({
                            position: "absolute",
                            inset: 0,
                            bg: "black/40",
                            backdropFilter: "blur(4px)",
                        })}
                    />

                    {/* Panel */}
                    <div
                        className={css({
                            position: "relative",
                            width: "85%", // Take up majority of screen but leave map visible on left
                            maxWidth: "400px",
                            height: "100dvh",
                            bg: "bg.glass",
                            borderLeft: "1px solid",
                            borderColor: "white/20",
                            boxShadow: "-10px 0 40px rgba(0,0,0,0.5)",
                            display: "flex",
                            flexDirection: "column",
                            animation: "slideInRight",
                        })}
                    >
                        <div className={css({
                            p: "4",
                            borderBottom: "1px solid",
                            borderColor: "white/10",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bg: "rgba(11, 11, 14, 0.8)",
                        })}>
                            <h2 className={css({ color: "white", fontFamily: "tech", fontSize: "sm", fontWeight: "bold", letterSpacing: "widest" })}>
                                SAVED BOOKMARKS
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className={css({
                                    w: "8", h: "8", borderRadius: "full", bg: "white/5",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "gray.400", _hover: { color: "white", bg: "white/10" },
                                })}
                            >
                                <i className="ph-bold ph-x"></i>
                            </button>
                        </div>

                        <div className={css({
                            flex: "1",
                            overflowY: "auto",
                            p: "4",
                            display: "flex",
                            flexDir: "column",
                            gap: "4",
                        })}>
                            <p className={css({ fontSize: "xs", color: "gray.400", mb: "2" })}>
                                You have {listings.length} saved business{listings.length !== 1 && 'es'}.
                            </p>

                            {listings.map((listing: Listing, i: number) => (
                                <div key={i} onClick={() => setIsOpen(false)}> {/* Close panel when selecting to view on map */}
                                    <ListingCard3D
                                        listing={listing}
                                        mapInstance={mapInstance}
                                        setactiveListing={setactiveListing}
                                        setisDrawerOpen={setisDrawerOpen}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
