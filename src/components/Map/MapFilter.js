import React, { useEffect } from "react";
import PropTypes from "prop-types";
import {
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Checkbox,
  ListItemText,
  Input,
  LinearProgress
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useDispatch, useSelector } from "react-redux";

//Actions
import * as ACTIONS from "./../../actions/actionConstants";
//DB Functions
import { getCollection } from "./../../db/mlab";

const useStyles = makeStyles({
  root: {}
});

const MapFilter = ({ listings, categories }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const selectedCategories = useSelector(
    state => state.categories.selectedCategories
  );
  console.log(selectedCategories);

  const handleChange = event => {
    //update selectedCategories array (push/pop?)
    let cat_name = event.target.value;

    let idx = selectedCategories.findIndex(({ name }) => name === cat_name);
    console.log(idx);
    let newArray = [...selectedCategories];
    if (idx === -1) {
      newArray.push(cat_name);
    } else {
      newArray.splice(idx, 1);
    }
    console.log(newArray);
    dispatch({
      type: "UPDATE_SELECTED_CATEGORIES",
      payload: newArray
    });
  };
  if (!categories) {
    return <LinearProgress />;
  }

  return (
    <div>
      <FormControl className={classes.root}>
        <InputLabel id="demo-mutiple-checkbox-label">Tag</InputLabel>
        <Select
          labelId="demo-mutiple-checkbox-label"
          id="demo-mutiple-checkbox"
          multiple
          value={selectedCategories}
          onChange={handleChange}
          input={<Input />}
          renderValue={selected => {
            selected.join(", ");
          }}
        >
          {categories.map(({ name }) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={false} />
              <ListItemText primary={name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

MapFilter.propTypes = {
  listings: PropTypes.object
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
