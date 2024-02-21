'use client'

import LocationOffIcon from "@mui/icons-material/LocationOffTwoTone";
import {
  Badge,
  FormControlLabel,
  FormGroup,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Switch,
  colors,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { memo, useMemo, useRef, useState } from "react";
import { Category, Listing } from "../../db/Types";

const useStyles = makeStyles((theme) => ({
  root: {
    // width: "300px",
    // margin: "1rem",
  },
  badge: {
    float: "right",
    marginLeft: "1em",
    backgroundColor: colors.teal["A200"],
  },
  switch: {},
}));

type CategoryFilterType = {
  listings: Listing[];
  categories: Category[];
  selectedCategories: Set<Category>;
  setSelectedCategories: any;
};

const CategoryFilter = ({
  listings,
  categories,
  selectedCategories,
  setSelectedCategories,
}: CategoryFilterType) => {
  const classes = useStyles();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  const handleChange = (event) => {
    console.log("we changing on reload??");
    /** MUST create a new set. Sets in state don't change, the inner parameters change and react can't see that */
    const newCategorySet = new Set(selectedCategories);
    const catName = event.target.name;
    // const size = catCount(name);
    // if (size > 100 && mapZoom > large) {
    //   //display some type of modal to zoom in
    //   return
    // }

    if (selectedCategories.has(catName)) {
      newCategorySet.delete(catName);
      setSelectedCategories(newCategorySet);
    } else {
      newCategorySet.add(catName);
      setSelectedCategories(newCategorySet);
    }
  };

  const handleFilterMenuToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleFilterMenuClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };
  const catCount = useMemo(
    () => (name: Category) => {
      return Object.values(listings).filter((el) =>
        el.categories?.includes(name)
      ).length;
    },
    [listings]
  );

  // const handleListKeyDown = (event) => {
  //   if (event.key === "Tab") {
  //     event.preventDefault();
  //     setOpen(false);
  //   }
  // };

  // return focus to the button when we transitioned from !open -> open
  const prevOpen = React.useRef(open);
  React.useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }

    prevOpen.current = open;
  }, [open]);

  return (
    <>
      <IconButton
        ref={anchorRef}
        aria-label="Filter by Category"
        color="inherit"
        onClick={() => handleFilterMenuToggle()}
        className={"icon-button"}
        size="large"
      >
        <LocationOffIcon />
      </IconButton>
      <Menu
        anchorEl={anchorRef.current}
        anchorReference={"anchorEl"}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        id={"map-filter-menu"}
        className={classes.root}
        keepMounted
        open={open}
        onClose={(e) => handleFilterMenuClose(e)}
      >
        {categories.length === 0 ? (
          <LinearProgress />
        ) : (
          categories.map((name) => {
            return (
              <MenuItem key={name} value={name}>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        color="secondary"
                        checked={selectedCategories.has(name)}
                        onChange={handleChange}
                        name={name}
                        className={classes.switch}
                      />
                    }
                    label={name}
                  />
                </FormGroup>
                <Badge
                  badgeContent={catCount(name)}
                  max={999}
                  className={classes.badge}
                  color="secondary"
                />
              </MenuItem>
            );
          })
        )}
      </Menu>
    </>
  );
};

export default memo(CategoryFilter);
