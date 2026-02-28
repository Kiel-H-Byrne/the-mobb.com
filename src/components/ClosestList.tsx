import React from "react";
import { Listing } from "@/db/Types";
import { css } from "@styled/css";

interface Props {
  closestListing: Listing;
}

const ClosestList = ({ closestListing }: Props) => {
  return closestListing ? <div className={css({ padding: "2" })} /> : null;
};

export default ClosestList;
