import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import MAvatar from "./Mavatar";
import AddLocationIcon from "@mui/icons-material/AddLocationTwoTone";
import { css } from "../../../styled-system/css";

const Nav = ({ listings, map, ...rest }) => {
  const { isAuthenticated } = useAuth0();

  return (
    <header
      className={css({
        backgroundColor: "rgba(68, 68, 68, 0.85)",
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 1100,
        height: "64px",
        display: "flex",
        alignItems: "center",
        padding: "0 16px",
        boxShadow: "0px 2px 4px -1px rgba(0,0,0,0.2), 0px 4px 5px 0px rgba(0,0,0,0.14), 0px 1px 10px 0px rgba(0,0,0,0.12)",
      })}
    >
      <div
        className={css({
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          width: "100%",
        })}
      >
        <div
          className={css({
            display: "flex",
            alignItems: "center",
            gap: "2",
          })}
        >
          {isAuthenticated ? (
            <button
              aria-label="Add A Listing"
              className={css({
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "full",
                _hover: {
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                },
              })}
            >
              <AddLocationIcon />
            </button>
          ) : null}
          <MAvatar />
        </div>
      </div>
    </header>
  );
};

export default Nav;
