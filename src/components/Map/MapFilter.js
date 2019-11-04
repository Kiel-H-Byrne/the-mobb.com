import React from "react";
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

const useStyles = makeStyles({
  root: {}
});

const MapFilter = ({ listings, categories }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const selected_categories = useSelector(
    state => state.categories.selected_categories
  );

  const handleChange = event => {
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
    dispatch({
      type: ACTIONS.UPDATE_SELECTED_CATEGORIES,
      payload: event.target.value
    });
  };
  if (!categories) {
    return <LinearProgress />;
  }

  return (
    <div>
      <FormControl className={classes.root}>
        <InputLabel id="demo-mutiple-checkbox-label">Category</InputLabel>
        <Select
          id="demo-mutiple-checkbox"
          multiple
          value={selected_categories}
          onChange={handleChange}
          input={<Input />}
          renderValue={selected => (
            <div className={classes.chips}>
              {`Selected: ${selected.length}`}
              {/* {selected.map(value => (
                <Chip key={value} label={value} className={classes.chip} />
              ))} */}
            </div>
          )}
        >
          {categories.map(({ name }) => (
            <MenuItem key={name} value={name}>
              <Checkbox checked={selected_categories.indexOf(name) > -1} />
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
