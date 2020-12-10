import React, { useRef, useState } from "react";
import {
  MenuItem,
  Menu,
  IconButton,
  Switch,
  Badge,
  LinearProgress,
  colors,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import LocationOffIcon from "@material-ui/icons/LocationOffTwoTone";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

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
}));

const CategoryFilter = ({
  listings,
  categories,
  selectedCategories,
  setSelectedCategories,
}) => {
  const classes = useStyles();
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(null);

  const handleChange = (event) => {
    const newSet = new Set(selectedCategories);
    if (selectedCategories.has(event.target.name)) {
      newSet.delete(event.target.name);
      setSelectedCategories(newSet);
    } else {
      newSet.add(event.target.name);
      setSelectedCategories(newSet);
    }
  };
  const handleFilterMenuToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };
  const handleFilterMenuClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false)
  };
  const catCount = (name) => {
    return Object.values(listings).filter((el) => el.categories?.includes(name))
      .length;
  };

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

      >
        <LocationOffIcon />
      </IconButton>
      <Menu
        anchorEl={anchorRef}
        anchorPosition={{ vertical: "center", horizontal: "left" }}
        id={"map-filter-menu"}
        className={classes.root}
        keepMounted
        open={open}
        onClose={(e) => handleFilterMenuClose(e)}
      >
        {categories?.length === 0 ? (
          <LinearProgress />
        ) : (
          categories.map((name) => (
            <MenuItem key={name} value={name}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      color="secondary"
                      checked={selectedCategories.has(name)}
                      onChange={(e) => handleChange(e)}
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
          ))
        )}
      </Menu>
    </>
  );
};

export default CategoryFilter;
