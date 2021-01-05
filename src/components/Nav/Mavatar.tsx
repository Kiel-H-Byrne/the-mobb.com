import React from "react";
import { Avatar, Button, Menu, MenuItem } from "@material-ui/core";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { makeStyles } from "@material-ui/core/styles";

import { useAuth0 } from "@auth0/auth0-react";
import { InfoTwoTone, ShareTwoTone } from "@material-ui/icons";
import { theme } from "../../styles/myTheme";

const useStyles = makeStyles({
  root: {
    display: "flex",
    justifyContent: "space-evenly",
  },
  image: { height: "1rem", display: "flex" },
  menu: {
    backgroundColor: theme.palette.grey[700],
  },
});

const Mavatar = () => {
  const {
    // loginWithRedirect,
    // loginWithPopup,
    isAuthenticated,
    user,
    // logout,
    error,
    isLoading,
  } = useAuth0();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (error) {
    console.error(error);
  }

  if (isAuthenticated) {
    console.log(user);
  }

  return (
    <div>
      <Button
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="text"
        color="primary"
        onClick={handleClick}
      >
        {
          /* {if logged in, profile foto else avatar } */
          !isLoading && isAuthenticated ? (
            <Avatar src={user.picture} alt={user.name} />
          ) : (
            <img src="img/Logo_MOBB-banner.png" alt={"MOBB"} />
          )
        }
      </Button>
      <Menu
        elevation={0}
        getContentAnchorEl={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        id="customized-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem>
          <ListItemIcon>
            <ShareTwoTone />
          </ListItemIcon>
          {/* <ListItemText primary="Share" /> */}
          <ListItemText className={classes.root}>
            <a
              className="link-share"
              href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2FMOBB%2Ekielbyrne%2Ecom&amp;title=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%2E"
              target="_blank"
              rel="noreferrer noopener"
              title="Share on Facebook"
            >
              <img
                src="/img/fbook-share.png"
                alt="Share on Facebook"
                className={classes.image}
              />
            </a>
            <a
              className="link-share"
              href="https://www.linkedin.com/shareArticle?mini=true&amp;url=https%3A%2F%2FMOBB%2Ekielbyrne%2Ecom&amp;title=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%2E&amp;source=mobb%2Ekielbyrne%2Ecom"
              target="_blank"
              rel="noreferrer noopener"
              title="Share on LinkedIn"
            >
              <img
                src="/img/linkedin-share.png"
                alt="Share on LinkedIn"
                className={classes.image}
              />
            </a>
            <a
              className="link-share"
              href="https://twitter.com/intent/tweet?text=Locate%2C+Promote%2C+%26+Support+a+Business+Owned+By+Us%3A+MOBB%2Ekielbyrne%2Ecom"
              target="_blank"
              rel="noreferrer noopener"
              title="Share on Twitter"
            >
              <img
                src="/img/twitter-share.png"
                alt="Share on Twitter"
                className={classes.image}
              />
            </a>
          </ListItemText>
        </MenuItem>
        {/* <MenuItem
          onClick={() => (isAuthenticated ? logout() : loginWithPopup())}
        >
          <ListItemIcon>
            <ExitToAppTwoTone />
          </ListItemIcon>
          <ListItemText primary={isAuthenticated ? "Sign Out" : "Sign In"} />
        </MenuItem>
         */}
        <MenuItem>
          <ListItemIcon>
            <InfoTwoTone />
          </ListItemIcon>
          <ListItemText primary="About" />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Mavatar;
