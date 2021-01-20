import React from "react";
import { Container, Grid, Typography } from "@material-ui/core";
import { Form } from "react-final-form";
import { TextField } from "mui-rff";
import { Listing } from "../../db/Types";

interface Props {
  listing: Listing
}

const AddListing = (Props) => {
  const formOptions = {};
  async function onSubmit(values: FormData) {
    console.log(values);
  }

  // yes, this can even be async!
  async function validate(values: FormData) {
    console.log(values);
    if (!values["hi"]) {
      return { hello: "Saying hello is nice." };
    }
    return;
  }
  return (
    <Container>
      <Typography variant={"h2"}> Add Listing</Typography>
      <Form
        id="search-mobb"
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit} noValidate>
            <Grid item>
              <div className="col s12 modal-header">
                <h5 className="center-align">
                  {" "}
                  <i className="material-icons">add_location</i>Add Business:{" "}
                </h5>
              </div>
            </Grid>
            <TextField
              name="name"
              id="name"
              placeholder="Search for Business..."
              label=""
            />
            <Grid item className="geo_input row">
              <div className="input-field col s12">
                <input
                  id="formatted_address"
                  type="text"
                  name=""
                  placeholder="Search for Address.."
                />
              </div>
            </Grid>
            <Grid item className="address_group row hide">
              <div className="col s12">
                <TextField name="street" id="route" disabled="true" />
              </div>
            </Grid>
            <Grid item className=" address_group row hide">
              <div className="col s5 m5">
                {" "}
                <TextField name="city" id="locality" disabled="true" />{" "}
              </div>
              <div className="col s3 m3">
                {" "}
                <TextField
                  name="state"
                  id="administrative_area_level_1"
                  label="State"
                  disabled="true"
                />{" "}
              </div>
              <div className="col s4 m4">
                {" "}
                <TextField
                  name="zip"
                  id="postal_code"
                  label="Zipcode"
                  disabled="true"
                />{" "}
              </div>
              <div className="hide">
                <input type="hidden" id="country" name="country" />
              </div>
            </Grid>
            <TextField name="phone" id="formatted_phone_number" />
            <label>
              <a
                id="button_website-preview"
                className="btn btn-flat right hide animated"
                href=""
                target="_blank"
                rel="noopener"
              >
                <i className="material-icons">pageview</i>
              </a>
            </label>
            <TextField
              name="url"
              id="website"
              value="https://"
              className="left"
            />
            <Grid item>
              <div className="col s4">
                {" "}
                <TextField name="social.facebook" />{" "}
              </div>
              <div className="col s4">
                {" "}
                <TextField name="social.twitter" />{" "}
              </div>
              <div className="col s4">
                {" "}
                <TextField name="social.instagram" />{" "}
              </div>
            </Grid>
            <TextField name="image" />
            <TextField
              name="categories"
              type="select-checkbox-inline"
              options={formOptions}
            />{" "}
            <br />
            <div className="hide">
              <TextField
                name="google_id"
                id="place_id"
                label=" "
                tabIndex={-1}
              />
            </div>
            <Grid item>
              <div className="col s12">
                <button
                  className="right-align btn waves-effect waves-light"
                  type="submit"
                  name="action"
                  aria-label="Add"
                  tabIndex={0}
                >
                  Add
                  <i className="material-icons right">add_circle</i>
                </button>
              </div>
            </Grid>
          </form>
        )}
      ></Form>
    </Container>
  );
};

export default AddListing;
