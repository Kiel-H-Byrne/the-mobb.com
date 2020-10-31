import React from "react";
import {
  Avatar,
  Select,
  Button,
  Menu,
  MenuProps,
  MenuItem,
  FormControl,
} from "@material-ui/core";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";

import { withStyles } from "@material-ui/core/styles";

import { useAuth0 } from "@auth0/auth0-react";
import { ExitToAppTwoTone, InfoTwoTone, ShareOutlined, ShareTwoTone } from "@material-ui/icons";
interface Props {}


const Mavatar = (props: Props) => {
  const {
    loginWithRedirect,
    isAuthenticated,
    user,
    logout,
    error,
    isLoading,
  } = useAuth0();
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
  if (isLoading) {
    console.log("loading...");
  }
  if (isAuthenticated) {
    console.log(user);
  }

  return (
    <div>
      <Button
        aria-controls="customized-menu"
        aria-haspopup="true"
        variant="contained"
        color="primary"
        onClick={handleClick}
      >
        {
          /* {if logged in, profile foto else avatar } */
          !isLoading && isAuthenticated ? (
            <Avatar src={user.picture} alt={user.name} />
          ) : (
            <Avatar alt={"LOGIN"} onClick={() => loginWithRedirect()} />
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
          <ListItemIcon><ShareTwoTone /> </ListItemIcon>
          <ListItemText primary="Share" />
        </MenuItem>
        <MenuItem onClick={() => logout()}>
          <ListItemIcon><ExitToAppTwoTone /></ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
        <MenuItem>
          <ListItemIcon><InfoTwoTone /></ListItemIcon>
          <ListItemText primary="About" />
        </MenuItem>
      </Menu>
    </div>
  );
};

export default Mavatar;
