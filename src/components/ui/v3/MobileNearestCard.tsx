import { Listing } from "@/db/Types";
import { css } from "@styled/css";
import React, { Dispatch, SetStateAction } from "react";

interface MobileNearestCardProps {
    listing: Listing | null;
    setactiveListing: Dispatch<SetStateAction<any>>;
    setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

/**
 * The Immediate Opportunity
 * A dynamic, bottom-aligned single card indicating the immediate closest location.
 * Positioned just above the MobileNav.
 */
export const MobileNearestCard = ({
    listing,
    setactiveListing,
    setisDrawerOpen,
}: MobileNearestCardProps) => {
    if (!listing) return null;

    const handleOpenDetails = () => {
        setactiveListing(listing);
        setisDrawerOpen(true);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (navigator.share) {
            navigator.share({
                title: `Check out ${listing.name} on The MOBB`,
                text: listing.description || `I found ${listing.name} on The Map of Black Businesses!`,
                url: window.location.href, // Or a specific deep link if implemented
            }).catch(console.error);
        } else {
            // Fallback copy to clipboard
            navigator.clipboard.writeText(`Check out ${listing.name} on The MOBB: ${window.location.href}`);
            alert("Link copied to clipboard!");
        }
    };

    return (
        <div
            onClick={handleOpenDetails}
            className={css({
                position: "fixed",
                bottom: "90px", // Just above the MobileNav (64px + 6px bottom offset + gap)
                left: "4",
                right: "4",
                zIndex: 40,
                display: { base: "flex", md: "none" },
                bg: "rgba(21, 21, 26, 0.95)", // More opaque to ensure legibility over map
                backdropFilter: "blur(24px)",
                borderRadius: "2xl",
                border: "1px solid",
                borderColor: "brand.orange/30", // Highlight to draw attention
                boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 -5px 20px rgba(255,90,0,0.15)",
                p: "3",
                gap: "3",
                alignItems: "center",
                cursor: "pointer",
                animation: "slideUp",
                _active: { transform: "scale(0.98)" },
                transition: "transform 0.2s",
                pointerEvents: "auto",
            })}
        >
            {/* Image Thumbnail */}
            <div
                className={css({
                    w: "14",
                    h: "14",
                    borderRadius: "xl",
                    bg: "gray.800",
                    border: "1px solid",
                    borderColor: "white/10",
                    overflow: "hidden",
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
                        <i className="ph-duotone ph-storefront text-2xl text-brand-orange"></i>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={css({ flex: 1, minW: 0 })}>
                <div className={css({ display: "flex", alignItems: "center", gap: "2", mb: "0.5" })}>
                    <span className={css({
                        fontSize: "9px",
                        fontFamily: "tech",
                        fontWeight: "bold",
                        color: "brand.orange",
                        bg: "brand.orangeMuted",
                        px: "1.5",
                        py: "0.5",
                        borderRadius: "sm",
                        letterSpacing: "wider",
                        border: "1px solid rgba(255,90,0,0.2)"
                    })}>
                        <i className="ph-fill ph-check-circle mr-1"></i>VERIFIED
                    </span>
                    {/* Distance indicator could go here if threaded through props */}
                </div>

                <h3
                    className={css({
                        fontWeight: "bold",
                        color: "white",
                        fontSize: "sm",
                        lineClamp: "1",
                        lineHeight: "tight",
                    })}
                >
                    {listing.name}
                </h3>

                <p className={css({
                    fontSize: "xs",
                    color: "gray.400",
                    lineClamp: "1",
                })}>
                    {(listing as any).category?.replace(/_/g, " ") || (listing.categories && listing.categories[0]?.replace(/_/g, " ")) || "Enterprise"}
                </p>
            </div>

            {/* Mission Actions */}
            <div className={css({ display: "flex", gap: "2", flexShrink: 0 })}>
                <button
                    onClick={handleShare}
                    className={css({
                        w: "10",
                        h: "10",
                        borderRadius: "full",
                        bg: "white/5",
                        border: "1px solid",
                        borderColor: "white/10",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "gray.300",
                        _hover: { color: "brand.orange", bg: "brand.orangeMuted" },
                    })}
                >
                    <i className="ph-bold ph-share-network text-lg"></i>
                </button>

                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(listing.address || listing.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()} // Prevent opening details drawer
                    className={css({
                        w: "10",
                        h: "10",
                        borderRadius: "full",
                        bg: "brand.orange",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "black",
                        boxShadow: "0 0 15px rgba(255,90,0,0.4)",
                    })}
                >
                    <i className="ph-fill ph-navigation-arrow text-lg"></i>
                </a>
            </div>
        </div>
    );
};
