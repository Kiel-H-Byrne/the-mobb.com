import * as React from "react";
import { Container, Divider, Typography } from "@material-ui/core";
import { Form } from "react-final-form";
import { TextField } from "mui-rff";
import AddListing from "../src/components/Forms/AddListing";
import ClaimListing from "../src/components/Forms/ClaimListing";
import VerifyListing from "../src/components/Forms/VerifyListing";
import EditListing from "../src/components/Forms/EditListing";

const testz = ({ initialValues }) => {
  return (
    <Container>
      <Typography variant={"h1"}> Forms tests</Typography>

      <AddListing listing={{}}/>
      <Divider />
      <ClaimListing />
      <Divider />
      <VerifyListing />
      <Divider />
      <EditListing />
    </Container>
  );
};

export default testz;
