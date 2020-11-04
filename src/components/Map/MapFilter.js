import React from "react";
import {
  MenuItem,
  Checkbox,
  ListItemText,
  Menu,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import LocationOffIcon from "@material-ui/icons/LocationOffTwoTone";
import { memo } from "react";

const useStyles = makeStyles({
  root: {
    // width: "300px",
    // margin: "1rem",
  },
});

const MapFilter = memo(({ listings, categories, selectedCategories, setSelectedCategories }) => {
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const handleChange = (event) => {
    //update selected_categories array (push/pop?)
    // let cat_name = event.target.value;

    // let idx = selected_categories.findIndex(({ name }) => name === cat_name);
    // console.log(cat_name);
    // let newArray = [...selected_categories];
    // console.log(newArray)
    // if (idx === -1) {
    //   newArray = [...newArray,]
    // } else {
    //   newArray.splice(idx, 1);
    // }
    // console.log(newArray);
    setSelectedCategories(event.target.value);
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
          value={selectedCategories}
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
        > */}
      <IconButton
        aria-label="show 17 new notifications"
        color="inherit"
        onClick={(e) => handleFilterMenuOpen(e)}
      >
        <LocationOffIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        id={"map-filter-menu"}
        className={classes.root}
        keepMounted
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        open={isMenuOpen}
        onClose={() => handleFilterMenuClose()}
      >
        {categories.map(({ name }) => (
          <MenuItem key={name} value={name}>
            <Checkbox checked={selectedCategories.indexOf(name) > -1} onChange={(e) => handleChange(e)}/>
            <ListItemText primary={name} />
          </MenuItem>
        ))}
      </Menu>
      {/* </Select>
      </FormControl> */}
    </>
  );
});

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
