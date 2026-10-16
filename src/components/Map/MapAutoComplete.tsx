import { Listing } from "@/db/Types";
import { trackSearchExecuted } from "@/util/analytics";
import { targetClient } from "@/util/functions";
import { searchBusinesses } from "@app/actions/geo-search";
import { MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import React, {
  Dispatch,
  SetStateAction,
  memo,
  useEffect,
  useRef,
  useState,
} from "react";

interface OwnProps {
  categories?: any[];
  mapInstance: any;
  setactiveListing: Dispatch<SetStateAction<any>>;
  setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

const MapAutoComplete = ({
  mapInstance,
  setactiveListing,
  setisDrawerOpen,
}: OwnProps) => {
  const [active, setActive] = useState(0);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [input, setInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Decided after mount so server and client render the same hint first.
  useEffect(() => {
    const platform =
      (navigator as any).userAgentData?.platform || navigator.platform || "";
    setIsMac(/mac|iphone|ipad|ipod/i.test(platform));
  }, []);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value;
    setInput(input);

    if (input.length > 2) {
      try {
        const results = await searchBusinesses(input);
        setFiltered(results);
        setIsMenuOpen(true);
        trackSearchExecuted({
          searchTerm: input,
          searchType: "text",
          resultCount: results.length,
        });
      } catch (error) {
        console.error("Error searching businesses:", error);
      }
    } else {
      setFiltered([]);
      setIsMenuOpen(false);
    }
    setActive(0);
  };

  const handleSelect = (index: number) => {
    const listing = filtered[index];
    if (listing) {
      trackSearchExecuted({
        searchTerm: listing.name,
        searchType: "text",
        resultCount: 1,
      });
    }
    setActive(index);
    setFiltered([]);
    setInput("");
    setIsMenuOpen(false);

    let locationObj;
    if (listing.coordinates && listing.coordinates.coordinates) {
      locationObj = {
        lat: listing.coordinates.coordinates[1],
        lng: listing.coordinates.coordinates[0],
      };
    }

    locationObj && targetClient(mapInstance, locationObj);
    setactiveListing(listing);
    setisDrawerOpen(true);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsMenuOpen(false);
      inputRef.current?.blur();
    } else if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(active);
    } else if (e.key === "ArrowUp") {
      setActive((prev) => (prev === 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === "ArrowDown") {
      setActive((prev) => (prev === filtered.length - 1 ? 0 : prev + 1));
    }
  };

  // ⌘K (Mac) / Ctrl+K (Windows/Linux) focuses search. The search box is
  // rendered twice (desktop panel + mobile top bar, one hidden by CSS), so each
  // instance only responds when its own input is actually visible.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.key.toLowerCase() !== "k")
        return;
      const input = inputRef.current;
      if (
        !input ||
        input.getClientRects().length === 0 ||
        getComputedStyle(input).visibility === "hidden"
      )
        return;
      e.preventDefault(); // keep the browser's own Ctrl+K (address bar search)
      input.focus();
      input.select();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className={`group ${css({ position: "relative", w: "full", zIndex: 1200 })}`}>
      <div className={css({
        position: "absolute", inset: 0, bg: "brand.orange/20", borderRadius: "2xl",
        filter: "blur(8px)", opacity: 0, _groupHover: { opacity: 1 }, transition: "opacity 0.5s"
      })}></div>

      <div className={css({
        position: "relative",
        display: "flex", alignItems: "center",
        bg: { base: "rgba(255, 255, 255, 0.95)", _dark: "#15151A" },
        borderRadius: "2xl",
        border: "1px solid",
        borderColor: "border.light",
        boxShadow: { base: "0 4px 20px rgba(0,0,0,0.06)", _dark: "none" },
        px: "4", py: "3",
        _focusWithin: { borderColor: "brand.orange" },
        transition: "all 0.2s"
      })}>
        <MagnifyingGlassIcon size={20} className={css({ color: "brand.orange", mr: 3 })} />
        <input
          ref={inputRef}
          className={css({
            flex: "1", bg: "transparent", border: "none", outline: "none",
            color: "text.main", fontFamily: "body", fontSize: "sm",
            _placeholder: { color: { base: "gray.500", _dark: "gray.500" } }
          })}
          placeholder={`Search all businesses...`}
          aria-label="Search The MOBB"
          aria-keyshortcuts="Meta+K Control+K"
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={input}
          autoComplete="off"
        />
        <div className={css({
          display: { base: "none", md: "flex" }, alignItems: "center", gap: "2", fontSize: "xs",
          fontFamily: "tech",
          color: { base: "gray.600", _dark: "gray.400" },
          bg: { base: "black/5", _dark: "white/5" },
          border: "1px solid",
          borderColor: { base: "black/10", _dark: "white/10" },
          px: "2", py: "1", borderRadius: "md"
        })}>
          {isMac ? (
            <>
              <span>⌘</span>
              <span>K</span>
            </>
          ) : (
            <span>Ctrl K</span>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className={css({
          position: "absolute", top: "calc(100% + 8px)", left: "0", width: "100%",
          backgroundColor: { base: "#FFFFFF", _dark: "#15151A" },
          border: "1px solid",
          borderColor: "border.light",
          boxShadow: { base: "0 10px 30px rgba(0,0,0,0.12)", _dark: "glow" },
          borderRadius: "xl", overflow: "hidden", zIndex: 1300
        })}>
          <div className={css({ maxHeight: "300px", overflowY: "auto" })}>
            {filtered.length > 0 ? (
              filtered.map((listing, index) => (
                <div
                  key={listing._id}
                  onClick={() => handleSelect(index)}
                  className={css({
                    padding: "3", cursor: "pointer",
                    color: "text.main",
                    display: "flex", alignItems: "center", gap: "3",
                    borderBottom: "1px solid",
                    borderColor: { base: "black/5", _dark: "white/5" },
                    backgroundColor: index === active ? { base: "rgba(194, 65, 12, 0.1)", _dark: "rgba(255, 90, 0, 0.15)" } : "transparent",
                    _hover: { backgroundColor: { base: "rgba(194, 65, 12, 0.15)", _dark: "rgba(255, 90, 0, 0.2)" } },
                    transition: "background 0.2s"
                  })}
                >
                  <MapPinIcon weight="fill" size={16} className={css({ color: "brand.orange" })} />
                  <span className={css({ flex: 1, fontWeight: "500", fontSize: "sm" })}>{listing.name}</span>
                </div>
              ))
            ) : (
              <div className={css({ padding: "4", fontSize: "sm", color: { base: "gray.600", _dark: "gray.400" }, textAlign: "center" })}>
                {input.length > 2 ? "No matching entities found." : `Enter ${3 - input.length} more character${(3 - input.length) > 1 ? 's' : ''}`}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MapAutoComplete);
