import { Listing } from "@/db/Types";
import { CheckCircleIcon, NavigationArrowIcon, ShareNetworkIcon, XIcon } from "@phosphor-icons/react";
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
    const [isDismissed, setIsDismissed] = React.useState(false);

    if (!listing || isDismissed) return null;

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
            className={css({
                position: "fixed",
                bottom: "6", // Moved to bottom since MobileNav is gone
                left: "4",
                right: "4",
                zIndex: 40,
                display: { base: "flex", md: "none" },
                pointerEvents: "auto",
            })}
        >
            <div
                onClick={handleOpenDetails}
                className={css({
                    w: "100%",
                    display: "flex",
                    bg: "rgba(21, 21, 26, 0.95)",
                    backdropFilter: "blur(24px)",
                    borderRadius: "2xl",
                    border: "1px solid",
                    borderColor: "brand.orange/30",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5), 0 -5px 20px rgba(255,90,0,0.15)",
                    p: "3",
                    gap: "3",
                    alignItems: "center",
                    cursor: "pointer",
                    animation: "slideUp",
                    _active: { transform: "scale(0.98)" },
                    transition: "transform 0.2s",
                })}
            >
                {/* Bump out dismiss button */}
                <button
                    onClick={(e) => { e.stopPropagation(); setIsDismissed(true); }}
                    className={css({
                        position: "absolute",
                        top: "-12px",
                        right: "-12px",
                        w: "28px",
                        h: "28px",
                        borderRadius: "full",
                        bg: "gray.800",
                        border: "1px solid",
                        borderColor: "white/20",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "gray.400",
                        boxShadow: "0 4px 10px rgba(0,0,0,0.5)",
                        _hover: { color: "white", bg: "gray.700" },
                        zIndex: 10,
                    })}
                >
                    <XIcon weight="bold" size={14} />
                </button>
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
                            {/* <i className="ph-duotone ph-storefront text-2xl text-brand-orange"></i> */}
                            <img src="/images/mobb_placeholder.png" alt="" />
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
                            <CheckCircleIcon weight="fill" size={10} className="mr-1 inline-block vertical-align-middle" />VERIFIED
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
                        {(listing as any).category?.replace(/_/g, " ") || (listing.categories && listing.categories[0]?.replace(/_/g, " ")) || "Business"}
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
                        <ShareNetworkIcon weight="bold" size={18} />
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
                        <NavigationArrowIcon weight="fill" size={18} />
                    </a>
                </div>
            </div>
        </div>
    );
};
