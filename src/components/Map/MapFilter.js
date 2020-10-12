import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  MenuItem,
  Checkbox,
  ListItemText,
  Menu,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import LocationOffIcon from "@material-ui/icons/LocationOffTwoTone";

const useStyles = makeStyles({
  root: {
    // width: "300px",
    // margin: "1rem",
  },
});

const MapFilter = ({ listings, categories }) => {
  const classes = useStyles();
  const [selected_categories, setselected_categories] = useState([]);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);

  const handleChange = (event) => {
    //update selected_categories array (push/pop?)
    let cat_name = event.target.value;
    let idx = selected_categories.findIndex(({ name }) => name === cat_name);
    let newArray = [...selected_categories];
    if (idx === -1) {
      newArray = [...newArray,]
    } else {
      newArray.splice(idx, 1);
    }
    setselected_categories(newArray);
    console.log(newArray)
  };
  const handleFilterMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFilterMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      {/* <FormControl className={classes.root}>
        <InputLabel id="demo-mutiple-checkbox-label">Category</InputLabel>
        <Select
          id="demo-mutiple-checkbox"
          multiple
          value={selected_categories}
          onChange={handleChange}
          input={<Input />}
          renderValue={(selected) => (
            <div className={classes.chips}>
              {`Selected: ${selected.length}`}
              {*/
      /* selected.map(value => (
                <Chip key={value} label={value} className={classes.chip} />
              )) */
      /*}
            </div>
          )}
      </Select>
      </FormControl> */}
      <IconButton
        aria-label="show 17 new notifications"
        color="inherit"
        onClick={handleFilterMenuOpen}
      >
        <LocationOffIcon />
        <span>Filter</span>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        id={"map-filter-menu"}
        className={classes.root}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={isMenuOpen}
        onClose={handleFilterMenuClose}
      >
        {categories.map(({ name }) => (
          <MenuItem key={name} value={name}>
            <Checkbox
              checked={selected_categories.indexOf(name) > -1}
              onChange={handleChange}
            />
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

MapFilter.propTypes = {
  listings: PropTypes.array,
};

export default MapFilter;

/*
UI = dropdown list
-list of filters by category (switch & category name)

//get all listings & categories
//get count of listings per category
//onClick main switch, hide/show all markers (why?)
//onToggle category switch, hide all markers in category
//change background color of toggle depending on if hiding or showing markers
*/
