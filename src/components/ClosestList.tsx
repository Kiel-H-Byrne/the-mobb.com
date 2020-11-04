import React from "react";

interface Props {
  clientLocation: string;
}

const ClosestList = (props: Props) => {
  //have geolocation?
  const { clientLocation } = props;
  return clientLocation ? (<div></div>): null
};

export default ClosestList;
