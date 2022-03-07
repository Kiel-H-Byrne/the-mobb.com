import React from "react";
import { Avatar, Button, Menu, MenuItem } from "@mui/material";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { useSession, signOut, signIn } from "next-auth/react";

import makeStyles from "@mui/styles/makeStyles";

import {
  ExitToAppTwoTone,
  InfoTwoTone,
  ShareTwoTone,
} from "@mui/icons-material";
import { theme } from "../../style/myTheme";

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
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { data: session, status } = useSession();

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (session) {
    console.log(session.user);
  } else {
    console.log(status);
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

          status == "loading" && session ? (
            <Avatar src={session.user.picture} alt={session.user.name} />
          ) : (
            <img height="50rem" src="img/Logo_MOBB-banner.png" alt={"MOBB"} />
          )
        }
      </Button>
      <Menu
        elevation={0}
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
        <MenuItem onClick={() => (session ? signOut() : signIn())}>
          <ListItemIcon>
            <ExitToAppTwoTone />
          </ListItemIcon>
          <ListItemText primary={session ? "Sign Out" : "Sign In"} />
        </MenuItem>

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
