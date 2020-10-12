import React from "react";
import {
  MenuItem,
  Menu,
  IconButton,
  Switch,
  Badge,
  LinearProgress,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import LocationOffIcon from "@material-ui/icons/LocationOffTwoTone";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { useContext } from "react";
import { AppContext } from "../AppProvider";

const useStyles = makeStyles({
  root: {
    // width: "300px",
    // margin: "1rem",
  },
  badge: { float: "right" },
});

const CategoryFilter = React.memo(() => {
  const classes = useStyles();
  const [context, setContext] = useContext(AppContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const { listings, categories, selected_categories } = context;
  const handleChange = (event) => {
    setContext({
      ...context,
      selected_categories: {
        ...context.selected_categories,
        [event.target.name]: event.target.checked,
      },
    });
  };
  const handleFilterMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleFilterMenuClose = () => {
    setAnchorEl(null);
  };
  const catCount = (name) => {
    return listings.filter((el) => el.categories?.includes(name)).length;
  };
  return (
    <div>
      <IconButton
        aria-label="show 17 new notifications"
        color="inherit"
        onClick={handleFilterMenuOpen}
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
        onClose={handleFilterMenuClose}
      >
        {!categories ? (
          <LinearProgress />
        ) : (
          categories.map(({ name }) => (
            <MenuItem key={name} value={name}>
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch
                      checked={selected_categories[name] || false}
                      onChange={handleChange}
                      name={name}
                    />
                  }
                  label={name}
                />
              </FormGroup>
              <Badge
              color="primary"
              badgeContent={catCount(name)}
              max={999}
              className={classes.badge}
            />
            </MenuItem>
          ))
        )}
      </Menu>
    </div>
  );
});

export default CategoryFilter;
