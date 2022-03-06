import React, {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { Autocomplete, GoogleMapProps } from "@react-google-maps/api";

import makeStyles from "@mui/styles/makeStyles";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import SearchIcon from "@mui/icons-material/Search";
import MyLocationButton from "./MyLocationButton";
import { Listing, Category } from "../../db/Types";
import CategoryFilter from "./CategoryFilter";
import { Button, colors, Input, Menu, MenuItem, MenuList } from "@mui/material";
import { targetClient } from "../../util/functions";
import { AddLocation } from "@mui/icons-material";
import { join } from "path";

interface OwnProps {
  listings: Listing[];
  categories: Category[];
  selectedCategories: Set<Object>;
  mapInstance: GoogleMapProps;
  setSelectedCategories: Dispatch<SetStateAction<Set<Category>>>;
  setactiveListing: Dispatch<SetStateAction<Set<Listing>>>;
  setisDrawerOpen: Dispatch<SetStateAction<Boolean>>;
}

const useStyles = makeStyles((theme) => ({
  root: {
    position: "relative",
    zIndex: 1100,
    margin: ".5rem",
    display: "flex",
    maxWidth: "23rem",
    backgroundColor: colors.orange[100],
  },
  flexItem: {
    display: "flex",
  },
  input: {
    marginLeft: 8,
    flex: 1,
  },
  iconButton: {
    padding: theme.spacing(1),
  },
  divider: {
    width: 1,
    height: 28,
    margin: 3,
    verticalAlign: "",
  },
  // hideDesktop: {
  //   flexShrink: 1,
  //   [theme.breakpoints.up("sm")]: {
  //     display: "none",
  //   },
  // },
  // hideMobile: {
  //   // flexGrow: 1,
  //   [theme.breakpoints.down("xs")]: {
  //     display: "none",
  //   },
  // },
}));

const MapAutoComplete = ({
  listings,
  categories,
  selectedCategories,
  mapInstance,
  setSelectedCategories,
  setactiveListing,
  setisDrawerOpen,
}: OwnProps) => {
  const classes = useStyles();
  let count = listings?.length;
  const [active, setActive] = useState(0);
  const [filtered, setFiltered] = useState([]);
  const [input, setInput] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const onChange = (e) => {
    const input = e.currentTarget.value;
    const newFilteredSuggestions =
      input.length > 2
        ? listings.filter(
            (listing) =>
              listing.name.toLowerCase().indexOf(input.toLowerCase()) > -1
          )
        : [];
    setActive(0);
    setFiltered(newFilteredSuggestions);
    setInput(e.currentTarget.value);
  };

  const onClick = (e) => {
    console.log(e.currentTarget.tabIndex);
    //find the tabindex and pass it to setActive
    let index = e.currentTarget.tabIndex;
    setActive(index);
    setFiltered([]);
    setInput("");
    setAnchorEl(!open);
    //pan map to location and open sidebar
    let location = filtered[active].location?.split(",");
    let locationObj = location && {
      lat: Number(location[0]),
      lng: Number(location[1]),
    };
    location && targetClient(mapInstance, locationObj);
    console.log(filtered[index].name);
    setactiveListing(filtered[index]);
    setisDrawerOpen(true);
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter") {
      console.log("hit enter key");
      setActive(0);
      setInput(filtered[active]);
    } else if (e.key === "ArrowUp") {
      return active === 0 ? null : setActive(active - 1);
    } else if (e.key === "ArrowDown") {
      return active - 1 === filtered.length ? null : setActive(active + 1);
    }
  };

  const renderAutoCompleteMenu = () => {
    if (open && input) {
      if (filtered.length) {
        return (
          <Menu
            open={open}
            style={{ maxHeight: "60%", maxWidth: "auto", overflowY: "scroll" }}
            anchorEl={anchorEl}
            disableAutoFocus={true}
            autoFocus={false}
            anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            onClick={anchorEl.focus()}
          >
            {filtered.map((listing, index) => {
              let className;
              if (index === active) {
                // className = "active";
              }
              // console.log(filtered[active].name);
              return (
                <MenuItem
                  className={className}
                  key={listing._id}
                  onClick={onClick}
                  tabIndex={index}
                >
                  {listing.name}
                </MenuItem>
              );
            })}
          </Menu>
        );
      } else {
        anchorEl.focus();
        return (
          <Menu
            open={open}
            anchorEl={anchorEl}
            disableAutoFocus={true}
            autoFocus={false}
          >
            {input.length > 2 ? (
              <MenuItem onClick={(e) => e.preventDefault()}>
                Not Found... <Button>Add One!</Button>
              </MenuItem>
            ) : (
              <MenuItem>{`Enter ${3 - input.length} more character`}</MenuItem>
            )}
          </Menu>
        );
      }
    }
    return <></>;
  };
  return (
    <div>
      <Paper className={classes.root}>
        <div className={classes.flexItem}>
          <InputBase
            className={classes.input}
            // ref={anchorRef}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            placeholder={`Search ${count ? count + " " : ""}Listings...`}
            inputProps={{ "aria-label": "Search The MOBB" }}
            onChange={onChange}
            onKeyDown={onKeyDown}
            value={input}
          />
          {renderAutoCompleteMenu()}
          <IconButton
            className={classes.iconButton}
            aria-label="Search"
            size="large"
          >
            <SearchIcon />
          </IconButton>
          <IconButton
            className={classes.iconButton}
            aria-label="Add"
            size="large"
          >
            <AddLocation />
          </IconButton>
          <Divider className={classes.divider} />
          {/* <CategoryFilter
            listings={listings}
            categories={categories || []}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            aria-label="Filter"
            //@ts-ignore
            className={classes.iconButton}
          /> */}
          <Divider className={classes.divider} />
          <MyLocationButton listings={listings} mapInstance={mapInstance} />
        </div>
      </Paper>
    </div>
  );
};

export default MapAutoComplete;
