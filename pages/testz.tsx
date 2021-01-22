import * as React from "react";
import { Container, Divider, Typography } from "@material-ui/core";
import { Form } from "react-final-form";
import { TextField } from "mui-rff";
import AddListing from "../src/components/Forms/AddListing";
import ClaimListing from "../src/components/Forms/ClaimListing";
import VerifyListing from "../src/components/Forms/VerifyListing";
import EditListing from "../src/components/Forms/EditListing";
import { GetStaticProps } from "next";
import { fetchAllCollection } from "../src/db/mlab";
import { Listing } from "../src/db/Types";

interface Props {
  all_listings: Listing[]
}

const testz = ({ all_listings }: Props) => {
  return (
    <Container>
      <Typography variant={"h1"}> Forms tests</Typography>

      <AddListing all_listings={all_listings}/>
      <Divider />
      <ClaimListing />
      <Divider />
      <VerifyListing />
      <Divider />
      <EditListing />
    </Container>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const all_listings = await fetchAllCollection({ collection: "listings" });
  return {
    props: { all_listings },
  };
};


export default testz;
