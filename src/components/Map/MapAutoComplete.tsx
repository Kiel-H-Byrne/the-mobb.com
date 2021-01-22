import React, { Dispatch, SetStateAction, useState } from "react";
// import { Autocomplete } from "@react-google-maps/api";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import InputBase from "@material-ui/core/InputBase";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";

import SearchIcon from "@material-ui/icons/Search";
import MyLocationButton from "./MyLocationButton";
import CategoryFilter from "./CategoryFilter";
import { colors, Modal } from "@material-ui/core";
import { Autocomplete } from "mui-rff";
import { Listing } from "../../db/Types";
import { Form } from "react-final-form";
import { AddLocationOutlined, AddLocationTwoTone } from "@material-ui/icons";
import AddListing from "../Forms/AddListing";

interface OwnProps {
  listings: Listing[];
  categories: string[];
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
    width: 170,
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
  const [open, setOpen] = useState(false);
  let count = listings.length;
  const autoCompleteOptions = listings.map((el) => ({
    label: el.name,
    value: el._id,
  }));

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <Paper className={classes.root}>
      <div className={classes.flexItem}>
        <Form
          id="search-mobb"
          onSubmit={() => console.log("automplete submitted")}
          render={({ handleSubmit, values }) => (
            <Autocomplete
              name="autocomplete"
              label={`Search ${count} Listings...`}
              className={classes.input}
              options={autoCompleteOptions}
              getOptionValue={(option) => option.value}
              getOptionLabel={(option) => option.label}
              // placeholder={`Search ${count} Listings...`}
              fullWidth
            />
          )}
        />

        <IconButton className={classes.iconButton} aria-label="Search">
          <SearchIcon />
        </IconButton>
        <IconButton className={classes.iconButton} aria-label="Search" onClick={handleClick} >
          <AddLocationOutlined />
        </IconButton>

          <Modal
            open={open}
            onClose={handleClick}
            aria-labelledby="simple-modal-title"
            aria-describedby="simple-modal-description"
          >
            <Paper style={{ width: "50%" }}>
              <AddListing all_listings={listings} mapInstance={mapInstance} />
            </Paper>
          </Modal>
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
  );
};

export default MapAutoComplete;
