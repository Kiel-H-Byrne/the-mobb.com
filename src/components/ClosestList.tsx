import React from "react";
import { Listing } from "../db/Types"

interface Props {
  clientLocation: string
  closestListing: Listing
}

const ClosestList = (props: Props) => {
  //have geolocation?
  const { clientLocation } = props;
  return clientLocation ? (<div></div>): null
};

export default ClosestList;
