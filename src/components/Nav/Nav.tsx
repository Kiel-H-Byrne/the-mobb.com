import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  makeStyles,
  fade,
  AppBar,
  Toolbar,
  IconButton,
} from "@material-ui/core";
import MAvatar from "./Mavatar";
import AddLocationIcon from "@material-ui/icons/AddLocationTwoTone";
/**
 * 
  background-color: #282c34;
  height: 3rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  font-size: calc(110%);
  color: white;

 */
const useStyles = makeStyles((theme) => ({
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    display: "none",
    [theme.breakpoints.up("sm")]: {
      display: "block",
    },
  },
  search: {
    position: "relative",
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    "&:hover": {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginRight: theme.spacing(2),
    marginLeft: 0,
    width: "100%",
    [theme.breakpoints.up("sm")]: {
      marginLeft: theme.spacing(3),
      width: "auto",
    },
  },
  searchIcon: {
    padding: theme.spacing(0, 2),
    height: "100%",
    position: "absolute",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  inputRoot: {
    color: "inherit",
  },
  inputInput: {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
  sectionDesktop: {
    position: "fixed",
    padding: "0 .4rem",
    right: 0,
    [theme.breakpoints.up("md")]: {
      display: "flex",
    },
  },
}));

interface OwnProps {
  listings: object[];
  categories: object[];
  selectedCategories: object[];
  setSelectedCategories: () => object[];
}

const Nav = React.memo(
  ({ listings, categories, selectedCategories, setSelectedCategories }: OwnProps) => {
    const classes = useStyles();
    const { isAuthenticated } = useAuth0();

    return (
      <AppBar position="static" className={"App-header"}>
        <Toolbar>
          <div className={classes.sectionDesktop}>
            {isAuthenticated ? <IconButton aria-label="show 4 new mails" color="inherit">
              <AddLocationIcon />
            </IconButton> : null }
            <IconButton
              edge="end"
              aria-label="account of current user"
              color="inherit"
            >
              <MAvatar />
            </IconButton>
          </div>
        </Toolbar>
      </AppBar>
    );
  }
);

export default Nav;