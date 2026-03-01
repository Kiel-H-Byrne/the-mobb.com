import { css } from "@styled/css";
import { useState } from "react";
import { MdFavorite, MdFavoriteBorder } from "react-icons/md";

interface Props {
  _id: string;
}
const MOCK_AUTH_USER = {
  profile: {
    favorites: {},
  },
};
const usersUpdate = (uuid, query) => { };

const FavoriteStar = (props: Props) => {
  const { _id } = props;
  const [showToast, setShowToast] = useState(false);

  const handleClick = () => {
    let userId = 1;
    if (inFavorites(_id)) {
      usersUpdate(userId, {
        $pull: { "profile.favorites": _id },
      });
    } else {
      usersUpdate(userId, {
        $addToSet: { "profile.favorites": _id },
      });
    }
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const inFavorites = (id: string) => {
    if (MOCK_AUTH_USER) {
      return true;
    } else {
      return false;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={css({ cursor: "pointer", display: "inline-flex", position: "relative" })}
    >
      {inFavorites(_id) ? (
        <span className={css({ color: "brand.orange", display: "inline-flex" })}>
          <MdFavorite size={24} />
        </span>
      ) : (
        <span className={css({ color: "brand.grey", display: "inline-flex" })}>
          <MdFavoriteBorder size={24} />
        </span>
      )}
      {showToast && (
        <div className={css({
          position: "fixed",
          bottom: "4",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "brand.grey",
          color: "white",
          paddingX: "4",
          paddingY: "2",
          borderRadius: "md",
          boxShadow: "lg",
          zIndex: "2000",
          fontSize: "sm",
        })}>
          Log In Before Adding Favorites
        </div>
      )}
    </div>
  );
};
export default FavoriteStar;
