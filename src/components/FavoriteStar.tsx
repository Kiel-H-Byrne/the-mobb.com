import React, { useState } from "react";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { Snackbar } from "@mui/material";
import { Alert } from '@mui/material';

interface Props {
  _id: string;
}
const MOCK_AUTH_USER = {
  profile: {
    favorites: {},
  },
};
const usersUpdate = (uuid, query) => {};

const FavoriteStar = (props: Props) => {
  const { _id } = props;
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    //clicking on star.. add/remove or alert
    let docId = _id;
    let userId = 1; /* Auth.userId() */
    if (inFavorites("id")) {
      //remove from favs
      usersUpdate(userId, {
        $pull: { "profile.favorites": docId },
      });
    } else {
      // add to favorites
      // AUTH_USER.profile.favorites.push(id);
      usersUpdate(userId, {
        $addToSet: { "profile.favorites": docId }, //is this mongoose or mongo?
      });
    }
    setOpen(true);
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };
  const inFavorites = (id) => {
    if (MOCK_AUTH_USER) {
      let favArray = MOCK_AUTH_USER.profile.favorites;
      // console.log(favArray);
      // let inArray = !_.isEmpty(_.where(favArray, id));
      // return inArray;
      return true;
    } else {
      return false;
    }
  };

  return (
    // @ts-ignore
    <div handleClick={handleClick}>
      {inFavorites(_id) ? (
        <Favorite id={_id} className={"remove_favorites"} />
      ) : (
        <FavoriteBorder className={"add_favorites"} />
      )}
      <Snackbar open={open} autoHideDuration={3000}>
        <Alert
          severity="info" //@ts-ignore
          handleClose={handleClose}
        >
          Log In Before Adding Favorites
        </Alert>
      </Snackbar>
    </div>
  );
};
export default FavoriteStar;
