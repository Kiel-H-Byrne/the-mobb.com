import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { alpha, AppBar, Toolbar, IconButton, colors } from "@mui/material";
import makeStyles from '@mui/styles/makeStyles';
import MAvatar from "./Mavatar";
import AddLocationIcon from "@mui/icons-material/AddLocationTwoTone";
// import "./Nav.scss";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: alpha(colors.grey[700], 0.85),
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
  //   paddingLeft: `calc(1em + ${theme.spacing(4)})`,
  //   transition: theme.transitions.create("width"),
  //   width: "100%",
  //   [theme.breakpoints.up("md")]: {
  //     width: "20ch",
  //   },
  // },
}));


const Nav = ({listings, map, ...rest}) => {
  const classes = useStyles();
  const { isAuthenticated } = useAuth0();

  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar>
        <div className={classes.sectionDesktop}>
          {isAuthenticated ? (
            <IconButton aria-label="Add A Listing" color="inherit" size="large">
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
