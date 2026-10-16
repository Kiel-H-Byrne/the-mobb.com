import { Listing } from "@/db/Types";
import { BookmarkIcon, BookmarksIcon, XIcon } from "@phosphor-icons/react";
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
                        bg: { base: "rgba(255, 255, 255, 0.95)", _dark: "rgba(21, 21, 26, 0.9)" },
                        backdropFilter: "blur(12px)",
                        border: "1px solid",
                        borderColor: { base: "rgba(0, 0, 0, 0.15)", _dark: "white/20" },
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
                        boxShadow: { base: "-4px 0 16px rgba(0,0,0,0.1)", _dark: "-5px 0 20px rgba(0,0,0,0.5)" },
                        cursor: "pointer",
                        transition: "all 0.2s",
                        _hover: { pr: "2", bg: { base: "rgba(255, 255, 255, 1)", _dark: "rgba(21, 21, 26, 1)" } },
                    })}
                >
                    <BookmarksIcon weight="fill" size={20} className={css({ color: "brand.orange" })} />
                    <span
                        className={css({
                            writingMode: "vertical-rl",
                            textOrientation: "mixed",
                            color: "text.main",
                            fontFamily: "tech",
                            fontSize: "10px",
                            fontWeight: "bold",
                            letterSpacing: "widest",
                            transform: "rotate(180deg)",
                        })}
                    >
                        SAVED
                    </span>
                    <div className={css({ w: "6px", h: "6px", borderRadius: "full", bg: "brand.orange", animation: "pulseSlow" })}></div>
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
                        alignItems: "flex-end", // Align panel to bottom
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
                            width: "100%",
                            height: "60dvh",
                            bg: "bg.glassCard",
                            borderTop: "1px solid",
                            borderColor: "border.light",
                            borderTopRadius: "3xl",
                            boxShadow: "0 -10px 40px rgba(0,0,0,0.3)",
                            display: "flex",
                            flexDirection: "column",
                            animation: "slideUp",
                            marginTop: "auto",
                        })}
                    >
                        {/* Bump out dismiss button */}
                        <button
                            onClick={() => setIsOpen(false)}
                            className={css({
                                position: "absolute",
                                top: "-16px",
                                right: "16px",
                                w: "36px",
                                h: "36px",
                                borderRadius: "full",
                                bg: { base: "white", _dark: "gray.800" },
                                border: "1px solid",
                                borderColor: "border.light",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "text.main",
                                boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
                                _hover: { color: "brand.orange", bg: { base: "gray.100", _dark: "gray.700" } },
                                zIndex: 10,
                            })}
                        >
                            <XIcon weight="bold" size={18} />
                        </button>

                        <div className={css({
                            p: "4",
                            borderBottom: "1px solid",
                            borderColor: "border.light",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            bg: { base: "rgba(255, 255, 255, 0.9)", _dark: "rgba(11, 11, 14, 0.8)" },
                            borderTopRadius: "3xl",
                        })}>
                            <h2 className={css({ color: "text.main", fontFamily: "tech", fontSize: "sm", fontWeight: "bold", letterSpacing: "widest" })}>
                                SAVED BOOKMARKS
                            </h2>
                        </div>

                        <div className={css({
                            flex: "1",
                            overflowY: "auto",
                            p: "4",
                            display: "flex",
                            flexDir: "column",
                            gap: "4",
                        })}>
                            {listings?.length > 0 ? (
                                <>
                                    <p className={css({ fontSize: "xs", color: "text.muted", mb: "2" })}>
                                        You have {listings.length} saved business{listings.length !== 1 && 'es'}.
                                    </p>

                                    {listings.map((listing: Listing, i: number) => (
                                        <div key={i} onClick={() => setIsOpen(false)}>
                                            <ListingCard3D
                                                listing={listing}
                                                mapInstance={mapInstance}
                                                setactiveListing={setactiveListing}
                                                setisDrawerOpen={setisDrawerOpen}
                                            />
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <div className={css({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", h: "full", textAlign: "center", color: "text.muted", gap: "4", px: "6" })}>
                                    <div className={css({ w: "16", h: "16", borderRadius: "full", bg: { base: "black/5", _dark: "white/5" }, display: "flex", alignItems: "center", justifyContent: "center", color: "text.muted" })}>
                                        <BookmarksIcon weight="duotone" size={32} />
                                    </div>
                                    <p className={css({ fontSize: "sm", lineHeight: "relaxed", color: "text.main" })}>
                                        You haven't saved any businesses yet.
                                    </p>
                                    <div className={css({ fontSize: "xs", bg: { base: "black/4", _dark: "rgba(255,255,255,0.03)" }, p: "3", borderRadius: "lg", border: "1px solid", borderColor: "border.light", display: "flex", alignItems: "center", justifyContent: "center", gap: "1", color: "text.muted" })}>
                                        Tap the <BookmarkIcon weight="bold" size={14} className={css({ color: "brand.orange" })} /> bookmark icon on any business profile to save it here for quick access later.
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
