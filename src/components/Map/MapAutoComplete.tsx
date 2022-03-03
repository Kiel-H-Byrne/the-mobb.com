import React, { Dispatch, SetStateAction, useState } from "react";
import { Autocomplete } from "@react-google-maps/api";

import makeStyles from "@mui/styles/makeStyles";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";

import SearchIcon from "@mui/icons-material/Search";
import MyLocationButton from "./MyLocationButton";
import { Listing, Category } from "../../db/Types";
import CategoryFilter from "./CategoryFilter";
import { colors, Menu, MenuItem } from "@mui/material";

interface OwnProps {
  listings: Listing[];
  categories: Category[];
  selectedCategories: Set<Object>;
  mapInstance: any;
  setSelectedCategories: Dispatch<SetStateAction<Set<Object>>>;
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
}: OwnProps) => {
  const classes = useStyles();
  let count = listings?.length;
  const [active, setActive] = useState(0);
  const [filtered, setFiltered] = useState([]);
  const [isShowing, setIsShowing] = useState(false);
  const [input, setInput] = useState("");

  const onChange = (e) => {
    const input = e.currentTarget.value;
    const newFilteredSuggestions = listings.filter((listing) => {
      listing.name.toLowerCase().indexOf(input.toLowerCase()) > -1;
    });
    setActive(0);
    setFiltered(newFilteredSuggestions);
    setIsShowing(true);
    setInput(e.currentTarget.value);
  };

  const onClick = (e) => {
    setActive(0);
    setFiltered([]);
    setIsShowing(false);
    setInput(e.currentTarget.innerText);
  };

  const onKeyDown = (e) => {
    if (e.keyCode === 13) {
      console.log("hit enter key");
      //enter key
      setActive(0);
      setIsShowing(false);
      setInput(filtered[active]);
    } else if (e.keyCode === 38) {
      // up arrow
      return active === 0 ? null : setActive(active - 1);
    } else if (e.keyCode === 40) {
      // down arrow
      return active - 1 === filtered.length ? null : setActive(active + 1);
    }
  };
  const renderAutoCompleteMenu = () => {
    if (isShowing && input) {
      if (filtered.length) {
        return (
          <Menu className="autocomplete" open={isShowing}>
            {filtered.map((suggestion, index) => {
              let className;
              if (index === active) {
                className = "active";
              }
              return (
                <MenuItem
                  className={className}
                  key={suggestion}
                  onClick={onClick}
                >
                  {suggestion}
                </MenuItem>
              );
            })}
          </Menu>
        );
        /**
         * 
         *      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem onClick={handleClose}>Profile</MenuItem>
        <MenuItem onClick={handleClose}>My account</MenuItem>
        <MenuItem onClick={handleClose}>Logout</MenuItem>
      </Menu>


         */
      } else {
        return (
          <Menu
            className="no-autocomplete"
            open={isShowing}
            anchorPosition={{ top: 30, left: 0 }}
          >
            <MenuItem>Not found</MenuItem>
          </Menu>
        );
      }
    }
    return <></>;
  };
  return (
    <Autocomplete>
      <Paper className={classes.root}>
        <div className={classes.flexItem}>
          <InputBase
            className={classes.input}
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
          <Divider className={classes.divider} />
          <CategoryFilter
            listings={listings}
            categories={categories || []}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            aria-label="Filter"
            //@ts-ignore
            className={classes.iconButton}
          />
          <Divider className={classes.divider} />
          <MyLocationButton listings={listings} mapInstance={mapInstance} />
        </div>
      </Paper>
    </Autocomplete>
  );
};

export default MapAutoComplete;
