
import { AddLocation } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import { Dispatch, SetStateAction, memo, useState } from "react";
import { searchBusinesses } from "../../../app/actions/geo-search";
import { css } from "../../../styled-system/css";
import { Category, Listing } from "../../db/Types";
import { targetClient } from "../../util/functions";
import CategoryFilter from "./CategoryFilter";
import MyLocationButton from "./MyLocationButton";

interface OwnProps {
  listings: Listing[];
  categories: Category[];
  selectedCategories: Set<Category>;
  mapInstance: any;
  setSelectedCategories: Dispatch<SetStateAction<Set<Category>>>;
  setactiveListing: Dispatch<SetStateAction<any>>;
  setisDrawerOpen: Dispatch<SetStateAction<boolean>>;
}

const MapAutoComplete = ({
  listings,
  categories,
  selectedCategories,
  mapInstance,
  setSelectedCategories,
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
    } else if (listing.location) {
      const location = listing.location.split(",");
      locationObj = {
        lat: Number(location[0]),
        lng: Number(location[1]),
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

  return (
    <div className={css({
      position: "relative",
      zIndex: 1200,
      margin: "4",
      display: "flex",
      maxWidth: "23rem",
      backgroundColor: "rgba(255, 255, 255, 0.85)", // Light frosted glass
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderRadius: "xl",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
      border: "1px solid rgba(255, 255, 255, 0.2)",
      padding: "1",
      alignItems: "center",
    })}>
      <input
        className={css({
          marginLeft: "2",
          flex: "1",
          background: "transparent",
          border: "none",
          outline: "none",
          padding: "2",
          fontSize: "sm",
        })}
        placeholder={`Search ${count ? count + " " : ""}Listings...`}
        aria-label="Search The MOBB"
        onChange={onChange}
        onKeyDown={onKeyDown}
        value={input}
      />
      {isMenuOpen && (
        <div className={css({
          position: "absolute",
          top: "100%",
          left: "0",
          width: "100%",
          backgroundColor: "white",
          boxShadow: "lg",
          borderRadius: "md",
          marginTop: "1",
          maxHeight: "300px",
          overflowY: "auto",
        })}>
          {filtered.length > 0 ? (
            filtered.map((listing, index) => (
              <div
                key={listing._id}
                onClick={() => handleSelect(index)}
                className={css({
                  padding: "2",
                  cursor: "pointer",
                  backgroundColor: index === active ? "rgba(251, 176, 59, 0.2)" : "transparent",
                  _hover: { backgroundColor: "rgba(251, 176, 59, 0.1)" },
                })}
              >
                {listing.name}
              </div>
            ))
          ) : (
             <div className={css({ padding: "2", fontSize: "xs", color: "gray.500" })}>
               {input.length > 2 ? "Not Found..." : `Enter ${3 - input.length} more character`}
             </div>
          )}
        </div>
      )}
      <button className={css({ padding: "2", background: "transparent", border: "none", cursor: "pointer", color: "brand.grey" })}>
        <SearchIcon />
      </button>
      <button className={css({ padding: "2", background: "transparent", border: "none", cursor: "pointer", color: "brand.grey" })}>
        <AddLocation />
      </button>
      <div className={css({ width: "1px", height: "7", backgroundColor: "gray.300", margin: "1" })} />
      <CategoryFilter
        listings={listings}
        categories={categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      <div className={css({ width: "1px", height: "7", backgroundColor: "gray.300", margin: "1" })} />
      <MyLocationButton listings={listings} mapInstance={mapInstance} />
    </div>
  );
};

export default memo(MapAutoComplete);
