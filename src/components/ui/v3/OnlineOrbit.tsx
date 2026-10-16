import { ArrowUpRightIcon, GlobeIcon, TagIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import ListingCoverImage from "@/components/ListingCoverImage";
import { memo, useCallback } from "react";
import { Listing } from "@/db/Types";
import { trackClickThrough } from "@/util/analytics";
import { useAppStore } from "@/store/useAppStore";
import DirectoryView from "./DirectoryView";

const DigitalStorefrontCard = memo(
  ({
    listing,
    setactiveListing,
    setisDrawerOpen,
  }: {
    listing: Listing;
    setactiveListing: any;
    setisDrawerOpen: any;
  }) => {
    const handleClick = () => {
      setactiveListing(listing);
      setisDrawerOpen(true);
    };

    return (
      <div
        onClick={handleClick}
        className={`group ${css({
          h: "full",
          bg: { base: "rgba(255, 255, 255, 0.92)", _dark: "rgba(20, 20, 25, 0.4)" },
          backdropFilter: "blur(20px)",
          borderRadius: "3xl",
          border: "1px solid",
          borderColor: "border.light",
          boxShadow: { base: "0 4px 20px rgba(0,0,0,0.06)", _dark: "none" },
          overflow: "hidden",
          position: "relative",
          cursor: "pointer",
          transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          _hover: {
            transform: "translateY(-4px)",
            borderColor: "brand.orange",
            boxShadow: {
              base: "0 20px 40px rgba(0,0,0,0.1), 0 0 20px rgba(194,65,12,0.1)",
              _dark: "0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(255,90,0,0.1)",
            },
          },
        })}`}
      >
        <div
          className={css({
            h: { base: "200px", md: "260px" },
            w: "full",
            position: "relative",
            bg: { base: "gray.100", _dark: "gray.900" },
            overflow: "hidden",
          })}
        >
          <ListingCoverImage
            listing={listing}
            sizes="(max-width: 768px) 100vw, 400px"
            className={css({
              opacity: 0.8,
              transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)",
              _groupHover: { transform: "scale(1.05)", opacity: 1 },
            })}
            fallback={
              <div
                className={css({
                  w: "full",
                  h: "full",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bg: "linear-gradient(135deg, #1A1A24 0%, #0B0B0E 100%)",
                })}
              >
                <GlobeIcon
                  weight="duotone"
                  size={64}
                  className={css({ color: "white/10" })}
                />
              </div>
            }
          />

          {/* Glow Overlay */}
          <div
            className={css({
              position: "absolute",
              inset: 0,
              background: {
                base: "linear-gradient(to top, rgba(255,255,255,0.9) 0%, transparent 60%)",
                _dark: "linear-gradient(to top, #141419 0%, transparent 60%)",
              },
            })}
          />

          {/* Online Badge */}
          <div
            className={css({
              position: "absolute",
              top: "4",
              right: "4",
              bg: "rgba(0, 230, 118, 0.15)",
              color: "#00E676",
              px: "3",
              py: "1",
              borderRadius: "full",
              fontSize: "xs",
              fontWeight: "bold",
              border: "1px solid",
              borderColor: "rgba(0, 230, 118, 0.3)",
              display: "flex",
              alignItems: "center",
              gap: "1.5",
              backdropFilter: "blur(4px)",
            })}
          >
            <div
              className={css({
                w: "1.5",
                h: "1.5",
                bg: "#00E676",
                borderRadius: "full",
                animation: "pulseSlow",
              })}
            />
            Online
          </div>
        </div>

        <div className={css({ p: "6", position: "relative", zIndex: 10 })}>
          <h3
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              fontFamily: "tech",
              color: "text.main",
              mb: "2",
              lineClamp: "1",
              transition: "color 0.3s",
              _groupHover: { color: "brand.orange" },
            })}
          >
            {listing.name}
          </h3>

          <p
            className={css({
              color: "text.muted",
              fontSize: "sm",
              mb: "4",
              lineClamp: "2",
            })}
          >
            {listing.description ||
              `Explore ${listing.name}'s digital storefront.`}
          </p>

          <div
            className={css({
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: "4",
            })}
          >
            <div
              className={css({
                display: "flex",
                gap: "2",
                flexWrap: "wrap",
                flex: 1,
              })}
            >
              {listing.categories?.slice(0, 1).map((cat, i) => (
                <span
                  key={i}
                  className={css({
                    display: "flex",
                    alignItems: "center",
                    gap: "1",
                    fontSize: "xs",
                    color: { base: "gray.700", _dark: "gray.300" },
                    bg: { base: "black/5", _dark: "white/5" },
                    px: "3",
                    py: "1",
                    borderRadius: "md",
                    border: "1px solid",
                    borderColor: "border.light",
                  })}
                >
                  <TagIcon /> {cat.replace(/_/g, " ")}
                </span>
              ))}
            </div>

            <button
              onClick={(e) => {
                if (listing.url) {
                  e.stopPropagation();
                  trackClickThrough(listing, "website", listing.url);
                  window.open(listing.url, "_blank", "noopener,noreferrer");
                }
              }}
              title="Visit Digital Storefront"
              aria-label={`Visit ${listing.name} website`}
              className={css({
                w: "10",
                h: "10",
                borderRadius: "full",
                bg: { base: "black/5", _dark: "white/5" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.main",
                transition: "all 0.3s",
                _groupHover: {
                  bg: "brand.orange",
                  color: { base: "white", _dark: "black" },
                  transform: "scale(1.1)",
                },
              })}
            >
              <ArrowUpRightIcon weight="bold" />
            </button>
          </div>
        </div>
      </div>
    );
  },
);

export const OnlineOrbit = () => {
  const setActiveListing = useAppStore((s) => s.setActiveListing);
  const setIsDrawerOpen = useAppStore((s) => s.setIsDrawerOpen);

  const renderCard = useCallback(
    (listing: Listing) => (
      <DigitalStorefrontCard
        listing={listing}
        setactiveListing={setActiveListing}
        setisDrawerOpen={setIsDrawerOpen}
      />
    ),
    [setActiveListing, setIsDrawerOpen],
  );

  return (
    <DirectoryView
      scope="online"
      noun="storefronts"
      tallCards
      renderCard={renderCard}
      header={
        <>
          <h1
            className={css({
              fontSize: { base: "4xl", md: "7xl" },
              fontFamily: "tech",
              fontWeight: "bold",
              color: "text.main",
              mb: "4",
              letterSpacing: "tight",
            })}
          >
            The Digital{" "}
            <span className={css({ color: "brand.orange" })}>Orbit</span>
          </h1>
          <p
            className={css({
              color: "text.muted",
              mb: "8",
              maxW: "2xl",
              fontSize: { base: "md", md: "lg" },
              lineHeight: "relaxed",
            })}
          >
            Discover global digital storefronts and online-only services built
            by the diaspora. No borders, just pure digital commerce.
          </p>
        </>
      }
    />
  );
};

export default OnlineOrbit;
