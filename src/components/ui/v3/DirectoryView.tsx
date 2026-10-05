import {
  DirectoryScope,
  countGlobalListings,
  fetchCategoryCounts,
  fetchGlobalListings,
  fetchOnlineOnlyListings,
} from "@app/actions/geo-search";
import { Listing } from "@/db/Types";
import { CategoryCount } from "@/util/categories";
import { DirectoryLocation } from "@/util/location";
import { ArrowUpIcon, SpinnerGapIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import CategoryPills from "./CategoryPills";
import LocationFilter from "./LocationFilter";

const PAGE_SIZE = 24; // divisible by 1/2/3 columns so rows stay full
const EXIT_MS = 220; // keep in sync with the `cardOut` animation
const STAGGER_MS = 35;
const MAX_STAGGER_STEPS = 12;

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

const gridClass = css({
  display: "grid",
  gridTemplateColumns: {
    base: "1fr",
    md: "repeat(2, minmax(0, 1fr))",
    lg: "repeat(3, minmax(0, 1fr))",
  },
  gap: { base: "4", md: "5" },
});

const SkeletonCard = ({ tall }: { tall?: boolean }) => (
  <div
    className={css({
      h: tall ? "80" : "36",
      borderRadius: "2xl",
      border: "1px solid",
      borderColor: "white/5",
      bg: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer",
      _motionReduce: { animation: "none" },
    })}
  />
);

const fetchPage = (
  scope: DirectoryScope,
  page: number,
  filters: string[],
  location: DirectoryLocation | null,
): Promise<Listing[]> =>
  scope === "online"
    ? fetchOnlineOnlyListings(page, PAGE_SIZE, filters)
    : fetchGlobalListings(page, PAGE_SIZE, filters, location);

export type DirectoryCardContext = {
  /** Active location filter, e.g. to show distance from a radius origin. */
  location: DirectoryLocation | null;
};

type DirectoryViewProps = {
  /** Which listings this directory pages through. */
  scope: DirectoryScope;
  /** Heading content (title + intro). */
  header: ReactNode;
  /** Plural noun for the result summary, e.g. "businesses". */
  noun: string;
  renderCard: (listing: Listing, context: DirectoryCardContext) => ReactNode;
  /** Taller skeletons for image-heavy cards. */
  tallCards?: boolean;
  /** Show the location (near me / city / state) filter. */
  enableLocation?: boolean;
};

/**
 * Full-screen, server-paged listing directory with category pills, infinite
 * scroll, and enter/exit card animations. Used by Global Grid and Online Only.
 */
export const DirectoryView = ({
  scope,
  header,
  noun,
  renderCard,
  tallCards,
  enableLocation,
}: DirectoryViewProps) => {
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(
    new Set(),
  );
  const [location, setLocation] = useState<DirectoryLocation | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState<number | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<
    CategoryCount[] | undefined
  >();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [error, setError] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Index where the most recently appended page starts, so only new cards stagger in.
  const [pageStartIndex, setPageStartIndex] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const requestId = useRef(0);

  const hasMore = total === null || items.length < total;

  // Category totals for this scope/location are cached server-side.
  useEffect(() => {
    let cancelled = false;
    fetchCategoryCounts(scope, location)
      .then((counts) => !cancelled && setCategoryCounts(counts))
      .catch((e) => console.error("Error fetching category counts:", e));
    return () => {
      cancelled = true;
    };
  }, [scope, location]);

  // Filter changes: animate current cards out while page 1 loads, then swap.
  useEffect(() => {
    const id = ++requestId.current;
    const filters = Array.from(selectedFilters);
    const hadItems = items.length > 0;

    setError(false);
    if (hadItems) setIsExiting(true);
    else setIsInitialLoading(true);

    Promise.all([
      fetchPage(scope, 1, filters, location),
      countGlobalListings(filters, scope, location),
      hadItems ? wait(EXIT_MS) : Promise.resolve(),
    ])
      .then(([listings, count]) => {
        if (id !== requestId.current) return;
        setItems(listings);
        setTotal(count);
        setPage(1);
        setPageStartIndex(0);
        scrollRef.current?.scrollTo({ top: 0 });
      })
      .catch((e) => {
        if (id !== requestId.current) return;
        console.error("Error fetching directory:", e);
        setError(true);
      })
      .finally(() => {
        if (id !== requestId.current) return;
        setIsExiting(false);
        setIsInitialLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refetch only on filter change
  }, [selectedFilters, location]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || isInitialLoading || isExiting || !hasMore || error)
      return;
    const id = requestId.current;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    try {
      const listings = await fetchPage(
        scope,
        nextPage,
        Array.from(selectedFilters),
        location,
      );
      if (id !== requestId.current) return; // filters changed mid-flight
      setPageStartIndex(items.length);
      setItems((prev) => {
        const seen = new Set(prev.map((l) => l._id));
        return [...prev, ...listings.filter((l) => !seen.has(l._id))];
      });
      setPage(nextPage);
      // Guard against a stale total causing endless requests.
      if (listings.length < PAGE_SIZE) setTotal(items.length + listings.length);
    } catch (e) {
      console.error("Error loading more listings:", e);
      setError(true);
    } finally {
      setIsLoadingMore(false);
    }
  }, [
    isLoadingMore,
    isInitialLoading,
    isExiting,
    hasMore,
    error,
    page,
    selectedFilters,
    items.length,
    scope,
    location,
  ]);

  // Infinite scroll: load the next page as the sentinel nears the viewport.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore();
      },
      { root: scrollRef.current, rootMargin: "600px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadMore]);

  const handleScroll = () => {
    const top = scrollRef.current?.scrollTop ?? 0;
    setShowBackToTop((prev) => (prev ? top > 400 : top > 800));
  };

  const clearFilters = () => setSelectedFilters(new Set());
  const clearAll = () => {
    setSelectedFilters(new Set());
    setLocation(null);
  };
  const isFiltered = selectedFilters.size > 0 || location !== null;

  const toggleFilter = useCallback((name: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const isEmpty =
    !isInitialLoading && !isExiting && !error && items.length === 0;

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={css({
        position: "absolute",
        inset: 0,
        zIndex: 5,
        overflowY: "auto",
        pt: { base: "10", md: "28" },
        pb: "32",
        px: { base: "4", md: "12" },
        bg: "#0B0B0E",
        pointerEvents: "auto",
        animation: "fadeIn",
      })}
    >
      <div className={css({ maxW: "7xl", mx: "auto" })}>
        {header}

        {/* Sticky filter bar (sits below the fixed ecosystem toggle on desktop) */}
        <div
          className={css({
            position: "sticky",
            top: { base: "0", md: "24" },
            zIndex: 10,
            mx: { base: "-4", md: "-12" },
            px: { base: "4", md: "12" },
            py: "4",
            mb: "6",
            bg: "rgba(11, 11, 14, 0.85)",
            backdropFilter: "blur(16px)",
            borderBottom: "1px solid",
            borderColor: "white/5",
          })}
        >
          <div
            className={css({
              maxW: "7xl",
              mx: "auto",
              display: "flex",
              flexDir: "column",
              gap: "3",
            })}
          >
            <div
              className={css({
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                columnGap: "4",
                rowGap: "2",
              })}
            >
              {enableLocation && (
                <LocationFilter value={location} onChange={setLocation} />
              )}
              <span
                aria-live="polite"
                className={css({
                  color: "gray.400",
                  fontSize: "sm",
                  fontFamily: "tech",
                })}
              >
                {total === null
                  ? "Loading directory…"
                  : `Showing ${items.length.toLocaleString()} of ${total.toLocaleString()} ${
                      isFiltered ? "matches" : noun
                    }`}
              </span>
              {selectedFilters.size > 0 && (
                <button
                  onClick={clearFilters}
                  className={css({
                    fontSize: "xs",
                    fontWeight: "bold",
                    color: "brand.orange",
                    bg: "transparent",
                    border: "none",
                    cursor: "pointer",
                    _hover: { filter: "brightness(1.2)" },
                  })}
                >
                  Clear {selectedFilters.size} filter
                  {selectedFilters.size > 1 ? "s" : ""}
                </button>
              )}
            </div>
            <CategoryPills
              categories={categoryCounts}
              selected={selectedFilters}
              onToggle={toggleFilter}
            />
          </div>
        </div>

        {/* Results */}
        {isInitialLoading ? (
          <div className={gridClass}>
            {Array.from({ length: 9 }).map((_, i) => (
              <SkeletonCard key={i} tall={tallCards} />
            ))}
          </div>
        ) : isEmpty ? (
          <div
            className={css({
              py: "20",
              textAlign: "center",
              color: "gray.400",
              animation: "fadeIn",
            })}
          >
            <p className={css({ fontSize: "lg", color: "white", mb: "2" })}>
              No {noun} match these filters.
            </p>
            <button
              onClick={clearAll}
              className={css({
                mt: "4",
                px: "5",
                py: "2",
                borderRadius: "xl",
                bg: "brand.orangeMuted",
                color: "brand.orange",
                fontWeight: "bold",
                fontSize: "sm",
                border: "1px solid",
                borderColor: "brand.orange/40",
                cursor: "pointer",
              })}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className={gridClass}>
            {items.map((listing, i) => {
              const step = Math.min(
                Math.max(0, i - pageStartIndex),
                MAX_STAGGER_STEPS,
              );
              return (
                <div
                  key={listing._id || i}
                  className={css({
                    minW: 0,
                    animation: isExiting ? "cardOut" : "cardIn",
                    pointerEvents: isExiting ? "none" : "auto",
                    _motionReduce: { animation: "none" },
                  })}
                  style={{
                    animationDelay: isExiting
                      ? "0ms"
                      : `${step * STAGGER_MS}ms`,
                  }}
                >
                  {renderCard(listing, { location })}
                </div>
              );
            })}
            {isLoadingMore &&
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={`more-${i}`} tall={tallCards} />
              ))}
          </div>
        )}

        {/* Pagination footer: sentinel drives infinite scroll, button is the fallback */}
        <div ref={sentinelRef} aria-hidden className={css({ h: "1px" })} />
        {!isInitialLoading && !isEmpty && (
          <div
            className={css({
              display: "flex",
              justifyContent: "center",
              mt: "10",
            })}
          >
            {error ? (
              <button
                onClick={() => {
                  setError(false);
                  if (items.length === 0)
                    setSelectedFilters(new Set(selectedFilters));
                }}
                className={css({
                  px: "5",
                  py: "2",
                  borderRadius: "xl",
                  bg: "white/5",
                  border: "1px solid",
                  borderColor: "white/10",
                  color: "white",
                  fontSize: "sm",
                  cursor: "pointer",
                })}
              >
                Couldn&apos;t load more — retry
              </button>
            ) : hasMore ? (
              <button
                onClick={loadMore}
                disabled={isLoadingMore || isExiting}
                className={css({
                  display: "flex",
                  alignItems: "center",
                  gap: "2",
                  px: "5",
                  py: "2",
                  borderRadius: "xl",
                  bg: "white/5",
                  border: "1px solid",
                  borderColor: "white/10",
                  color: "white",
                  fontSize: "sm",
                  cursor: "pointer",
                  _hover: { borderColor: "brand.orange/50" },
                  _disabled: { opacity: 0.6, cursor: "default" },
                })}
              >
                {isLoadingMore && (
                  <SpinnerGapIcon
                    size={16}
                    className={css({ animation: "spin" })}
                  />
                )}
                {isLoadingMore ? "Loading…" : "Load more"}
              </button>
            ) : (
              items.length > PAGE_SIZE && (
                <span
                  className={css({
                    color: "gray.500",
                    fontSize: "sm",
                    fontFamily: "tech",
                  })}
                >
                  You&apos;ve reached the end.
                </span>
              )
            )}
          </div>
        )}
      </div>

      {/* Desktop: mask cards scrolling behind the fixed toggle, above the sticky bar */}
      <div
        aria-hidden
        className={css({
          display: { base: "none", md: "block" },
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          h: "24",
          zIndex: 9,
          bg: "#0B0B0E",
          pointerEvents: "none",
        })}
      />

      {showBackToTop && (
        <button
          aria-label="Back to top"
          onClick={() =>
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
          className={css({
            position: "fixed",
            bottom: { base: "24", md: "8" },
            left: { base: "6", md: "8" },
            zIndex: 20,
            w: "11",
            h: "11",
            borderRadius: "full",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bg: "rgba(21, 21, 26, 0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid",
            borderColor: "white/10",
            color: "white",
            cursor: "pointer",
            animation: "fadeIn",
            _hover: { borderColor: "brand.orange/50", color: "brand.orange" },
          })}
        >
          <ArrowUpIcon weight="bold" size={18} />
        </button>
      )}
    </div>
  );
};

export default DirectoryView;
