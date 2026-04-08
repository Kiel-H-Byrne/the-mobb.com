import { ArrowUpRightIcon, GlobeIcon, TagIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import Image from "next/image";
import { memo, useEffect, useState } from "react";
import { Listing, Category } from "@/db/Types";
import { useAppStore } from "@/store/useAppStore";
import { fetchOnlineOnlyListings } from "@app/actions/geo-search";
import CategoryFilter from "@/components/Map/CategoryFilter";

const DigitalStorefrontCard = memo(({ listing, setactiveListing, setisDrawerOpen }: { listing: Listing, setactiveListing: any, setisDrawerOpen: any }) => {
  const handleClick = () => {
    setactiveListing(listing);
    setisDrawerOpen(true);
  };

  const coverImage = typeof listing.image === 'string' ? listing.image : (listing.image as any)?.url || listing.og_image;

  return (
    <div
      onClick={handleClick}
      className={`group ${css({
        breakInside: "avoid",
        mb: "6",
        bg: "rgba(20, 20, 25, 0.4)",
        backdropFilter: "blur(20px)",
        borderRadius: "3xl",
        border: "1px solid",
        borderColor: "white/5",
        overflow: "hidden",
        position: "relative",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        _hover: {
          transform: "translateY(-4px)",
          borderColor: "rgba(255,90,0,0.3)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 40px rgba(255,90,0,0.1)",
        }
      })}`}
    >
      <div
        className={css({
          h: { base: "200px", md: "260px" },
          w: "full",
          position: "relative",
          bg: "gray.900",
          overflow: "hidden"
        })}
      >
        {coverImage ? (
          <Image
            src={coverImage}
            alt={listing.name || "Storefront"}
            fill
            className={css({
              objectFit: "cover",
              opacity: 0.8,
              transition: "transform 1s cubic-bezier(0.16, 1, 0.3, 1)",
              _groupHover: { transform: "scale(1.05)", opacity: 1 }
            })}
          />
        ) : (
          <div className={css({
            w: "full", h: "full", display: "flex", alignItems: "center", justifyContent: "center",
            bg: "linear-gradient(135deg, #1A1A24 0%, #0B0B0E 100%)"
          })}>
            <GlobeIcon weight="duotone" size={64} className={css({ color: "white/10" })} />
          </div>
        )}

        {/* Glow Overlay */}
        <div className={css({
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #141419 0%, transparent 60%)"
        })} />

        {/* Online Badge */}
        <div className={css({
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
          backdropFilter: "blur(4px)"
        })}>
          <div className={css({ w: "1.5", h: "1.5", bg: "#00E676", borderRadius: "full", animation: "pulseSlow" })} />
          Online
        </div>
      </div>

      <div className={css({ p: "6", position: "relative", zIndex: 10 })}>
        <h3 className={css({
          fontSize: "2xl",
          fontWeight: "bold",
          fontFamily: "tech",
          color: "white",
          mb: "2",
          lineClamp: "1",
          transition: "color 0.3s",
          _groupHover: { color: "brand.orange" }
        })}>
          {listing.name}
        </h3>

        <p className={css({ color: "gray.400", fontSize: "sm", mb: "4", lineClamp: "2" })}>
          {listing.description || `Explore ${listing.name}'s digital storefront.`}
        </p>

        <div className={css({ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "4" })}>
          <div className={css({ display: "flex", gap: "2", flexWrap: "wrap", flex: 1 })}>
            {listing.categories?.slice(0, 1).map((cat, i) => (
              <span key={i} className={css({
                display: "flex", alignItems: "center", gap: "1",
                fontSize: "xs", color: "gray.300", bg: "white/5", px: "3", py: "1", borderRadius: "md",
                border: "1px solid", borderColor: "white/10"
              })}>
                <TagIcon /> {cat.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          <button className={css({
            w: "10", h: "10", borderRadius: "full", bg: "white/5",
            display: "flex", alignItems: "center", justifyContent: "center", color: "white",
            transition: "all 0.3s",
            _groupHover: { bg: "brand.orange", color: "black", transform: "scale(1.1)" }
          })}>
            <ArrowUpRightIcon weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );
});

export const OnlineOrbit = () => {
  const [orbitData, setOrbitData] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const globalCategories = useAppStore(s => s.categories) || [];
  const [selectedFilters, setSelectedFilters] = useState<Set<Category>>(new Set());

  const setActiveListing = useAppStore(s => s.setActiveListing);
  const setIsDrawerOpen = useAppStore(s => s.setIsDrawerOpen);

  useEffect(() => {
    setOrbitData([]);
    setPage(1);
  }, [selectedFilters]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const filtersArray = Array.from(selectedFilters);
        const newData = await fetchOnlineOnlyListings(page, 15, filtersArray);
        setOrbitData(prev => {
          // Prevent duplicates on React strict mode
          const newIds = new Set(newData.map(item => item._id));
          const cleanPrev = prev.filter(item => !newIds.has(item._id));
          return [...cleanPrev, ...newData];
        });
      } catch (e) {
        console.error(e);
      }
      setIsLoading(false);
    }
    loadData();
  }, [page, selectedFilters]);

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
      <div className={css({ maxW: "7xl", mx: "auto", textAlign: "center" })}>
        <h1
          className={css({
            fontSize: { base: "4xl", md: "7xl" },
            fontFamily: "tech",
            fontWeight: "bold",
            color: "white",
            mb: "4",
            letterSpacing: "tight",
            textShadow: "0 0 40px rgba(255, 90, 0, 0.2)"
          })}
        >
          The Digital <span className={css({ color: "brand.orange" })}>Orbit</span>
        </h1>
        <p className={css({ color: "gray.400", mb: "12", maxW: "2xl", mx: "auto", fontSize: "lg", lineHeight: "relaxed" })}>
          Discover global digital storefronts and online-only services built by the diaspora. No borders, just pure digital commerce.
        </p>

        {/* Localized Filter Controls */}
        <div className={css({
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "4",
          mb: "12",
          pb: "4",
          borderBottom: "1px solid",
          borderColor: "white/5",
          maxWidth: "700px",
          mx: "auto"
        })}>
          <CategoryFilter
            listings={orbitData} // count logic will be scoped to loaded data
            categories={globalCategories as Category[]}
            selectedCategories={selectedFilters}
            setSelectedCategories={setSelectedFilters}
          />
          {selectedFilters.size > 0 && (
            <span className={css({ color: "gray.400", fontSize: "sm", fontFamily: "tech" })}>
              {orbitData.length} active in orbit
            </span>
          )}
        </div>

        {/* Masonry Layout */}
        <div className={css({
          columnCount: { base: 1, md: 2, lg: 3 },
          columnGap: "6",
          textAlign: "left",
          px: "2"
        })}>
          {orbitData.map((listing, i) => (
            <DigitalStorefrontCard
              key={listing._id || i}
              listing={listing}
              setactiveListing={setActiveListing}
              setisDrawerOpen={setIsDrawerOpen}
            />
          ))}
        </div>

        {orbitData.length === 0 && !isLoading && (
          <div className={css({ color: "gray.500", p: "12", mx: "auto", fontSize: "xl" })}>
            Scanning orbit... no digital storefronts found yet.
          </div>
        )}

        {/* Load More Button */}
        {orbitData.length > 0 && (
          <div className={css({ mt: "16" })}>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={isLoading}
              className={css({
                bg: "white/5",
                color: "white",
                px: "10",
                py: "4",
                borderRadius: "full",
                fontFamily: "tech",
                fontSize: "lg",
                fontWeight: "bold",
                border: "1px solid",
                borderColor: "white/10",
                cursor: isLoading ? "not-allowed" : "pointer",
                _hover: { bg: "white/10", borderColor: "brand.orange" },
                transition: "all 0.3s",
                boxShadow: "0 10px 20px rgba(0,0,0,0.2)"
              })}
            >
              {isLoading ? "Downloading Data..." : "Load More Storefronts"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnlineOrbit;
