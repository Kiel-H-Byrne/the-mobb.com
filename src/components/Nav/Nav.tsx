import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  makeStyles,
  fade,
  AppBar,
  Toolbar,
  IconButton,
  colors,
} from "@material-ui/core";
import MAvatar from "./Mavatar";
import AddLocationIcon from "@material-ui/icons/AddLocationTwoTone";
// import "./Nav.scss";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: fade(colors.grey[700], 0.85),
  },
  sectionDesktop: {
    position: "fixed",
    padding: "0 .4rem",
    right: 0,
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
  // logo: {
  //   marginRight: theme.spacing(2),
  // },
  // title: {
  //   display: "none",
  //   [theme.breakpoints.up("sm")]: {
  //     display: "block",
  //   },
  // },
  // search: {
  //   position: "relative",
  //   borderRadius: theme.shape.borderRadius,
  //   backgroundColor: fade(colors.orange[200], 0.15),
  //   "&:hover": {
  //     backgroundColor: fade(theme.palette.common.white, 0.25),
  //   },
  //   marginRight: theme.spacing(2),
  //   marginLeft: 0,
  //   width: "100%",
  //   [theme.breakpoints.up("sm")]: {
  //     marginLeft: theme.spacing(3),
  //     width: "auto",
  //   },
  // },
  // searchIcon: {
  //   padding: theme.spacing(0, 2),
  //   height: "100%",
  //   position: "absolute",
  //   pointerEvents: "none",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  // },
  // inputRoot: {
  //   color: "inherit",
  // },
  // inputInput: {
  //   padding: theme.spacing(1, 1, 1, 0),
  //   // vertical padding + font size from searchIcon
  //   paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
  //   transition: theme.transitions.create("width"),
  //   width: "100%",
  //   [theme.breakpoints.up("md")]: {
  //     width: "20ch",
  //   },
  // },
}));


const Nav = () => {
  const classes = useStyles();
  const { isAuthenticated } = useAuth0();

  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar>
        <div className={classes.sectionDesktop}>
          {isAuthenticated ? (
            <IconButton aria-label="Add A Listing" color="inherit">
              <AddLocationIcon />
            </IconButton>
          ) : null}
          <MAvatar />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Nav;
