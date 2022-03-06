import React, {
  Dispatch,
  KeyboardEvent,
  SetStateAction,
  useRef,
  useState,
} from "react";
import { GoogleMapProps } from "@react-google-maps/api";

import makeStyles from "@mui/styles/makeStyles";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";

import SearchIcon from "@mui/icons-material/Search";
import MyLocationButton from "./MyLocationButton";
import { Listing, Category } from "../../db/Types";
import CategoryFilter from "./CategoryFilter";
import {
  Button,
  colors,
  Input,
  Menu,
  MenuItem,
  MenuList,
  TextField,
} from "@mui/material";
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
    // display: "flex",
    maxWidth: "23rem",
    backgroundColor: colors.orange[100],
  },
  flexItem: {
    display: "flex",
  },
  input: {
    // marginLeft: 8,
    // flex: 1,
    // sx={{ width: "50%", margin: "auto 0", flex: "flex-grow" }}
  },
  iconButton: {
    padding: "1rem",
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
    console.log(e);
    //find the tabindex and pass it to setActive
    let index = e.currentTarget.tabIndex;
    //pan map to location and open sidebar
    // let location = filtered[active].location?.split(",");
    // let locationObj = location && {
    //   lat: Number(location[0]),
    //   lng: Number(location[1]),
    // };
    // location && targetClient(mapInstance, locationObj);
    // console.log(filtered[index].name);
    // setactiveListing(filtered[index]);
    // setisDrawerOpen(true);
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

  const order = (a, b) => (a < b ? -1 : a > b ? 1 : 0);

  return (
    <div>
      <Paper className={classes.root}>
        <div className={classes.flexItem}>
          <Autocomplete
            freeSolo
            disableClearable
            options={listings.map((option) => option).sort(order)}
            sx={{ width: "50%" }}
            renderInput={(params) => (
              <TextField
                className={classes.input}
                onClick={onClick}
                {...params}
                label="Search The MOBB"
                placeholder={`Search ${count ? count + " " : ""}Listings...`}
                InputProps={{
                  ...params.InputProps,
                  type: "search",
                }}
              />
            )}
          />

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
