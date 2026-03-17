import { Listing } from "@/db/Types";
import { targetClient } from "@/util/functions";
import { searchBusinesses } from "@app/actions/geo-search";
import { MagnifyingGlassIcon, MapPinIcon } from "@phosphor-icons/react";
import { css } from "@styled/css";
import React, { Dispatch, SetStateAction, memo, useEffect, useState } from "react";

interface OwnProps {
  listings: Listing[];
  categories?: any[];
  mapInstance: any;
  setactiveListing: Dispatch<SetStateAction<any>>;
  setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

const MapAutoComplete = ({
  listings,
  mapInstance,
  setactiveListing,
  setisDrawerOpen,
}: OwnProps) => {
  let count = listings?.length ?? 0;
  const [active, setActive] = useState(0);
  const [filtered, setFiltered] = useState<Listing[]>([]);
  const [input, setInput] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value;
    setInput(input);

    if (input.length > 2) {
      try {
        const results = await searchBusinesses(input);
        setFiltered(results);
        setIsMenuOpen(true);
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
    if (e.key === "Enter" && filtered.length > 0) {
      handleSelect(active);
    } else if (e.key === "ArrowUp") {
      setActive((prev) => (prev === 0 ? filtered.length - 1 : prev - 1));
    } else if (e.key === "ArrowDown") {
      setActive((prev) => (prev === filtered.length - 1 ? 0 : prev + 1));
    }
  };

  // Keyboard shortcut listener for CMD+K / CTRL+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('mobb-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
        bg: "#15151A", borderRadius: "2xl",
        border: "1px solid", borderColor: "white/10",
        px: "4", py: "3",
        _focusWithin: { borderColor: "brand.orange/50" }, transition: "colors"
      })}>
        <MagnifyingGlassIcon size={20} className={css({ color: "brand.orange", mr: 3 })} />
        <input
          id="mobb-search-input"
          className={css({
            flex: "1", bg: "transparent", border: "none", outline: "none",
            color: "white", fontFamily: "body", fontSize: "sm",
            _placeholder: { color: "gray.500" }
          })}
          placeholder={`Search ${count ? count + " " : ""}businesses...`}
          aria-label="Search The MOBB"
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={input}
          autoComplete="off"
        />
        <div className={css({
          display: { base: "none", md: "flex" }, alignItems: "center", gap: "2", fontSize: "xs",
          fontFamily: "tech", color: "gray.500", bg: "white/5", px: "2", py: "1", borderRadius: "md"
        })}>
          <span>⌘</span><span>K</span>
        </div>
      </div>

      {isMenuOpen && (
        <div className={css({
          position: "absolute", top: "calc(100% + 8px)", left: "0", width: "100%",
          backgroundColor: "#15151A", border: "1px solid", borderColor: "white/10",
          boxShadow: "glow", borderRadius: "xl", overflow: "hidden", zIndex: 1300
        })}>
          <div className={css({ maxHeight: "300px", overflowY: "auto" })}>
            {filtered.length > 0 ? (
              filtered.map((listing, index) => (
                <div
                  key={listing._id}
                  onClick={() => handleSelect(index)}
                  className={css({
                    padding: "3", cursor: "pointer", color: "white", display: "flex", alignItems: "center", gap: "3",
                    borderBottom: "1px solid", borderColor: "white/5",
                    backgroundColor: index === active ? "rgba(255, 90, 0, 0.15)" : "transparent",
                    _hover: { backgroundColor: "rgba(255, 90, 0, 0.2)" }, transition: "background 0.2s"
                  })}
                >
                  <MapPinIcon weight="fill" size={16} className={css({ color: "brand.orange" })} />
                  <span className={css({ flex: 1, fontWeight: "500", fontSize: "sm" })}>{listing.name}</span>
                </div>
              ))
            ) : (
              <div className={css({ padding: "4", fontSize: "sm", color: "gray.500", textAlign: "center" })}>
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
