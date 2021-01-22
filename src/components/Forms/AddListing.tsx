import React, { useEffect, useRef, useState } from "react";
import { Container, Grid, InputBase, Typography } from "@material-ui/core";
import { Form } from "react-final-form";
import { Autocomplete, TextField } from "mui-rff";
import { Listing } from "../../db/Types";
import styles from "./AddListing.module.scss";
import { fillInAddress } from "../../util/functions";
interface Props {
  all_listings: Listing[];
  mapInstance: any;
}

const AUTOCOMPLETE_FIELDS = ["address_components", "formatted_address", "formatted_phone_number", "location", "name", "place_id", "types", "website"]
const FORM_DATA = {}
AUTOCOMPLETE_FIELDS.forEach(el => FORM_DATA[el] = "");

const AddListing = ({ all_listings, mapInstance }: Props) => {
  const [query, setQuery] = useState("");
  const autoCompleteRef = useRef(null);
  const [formData, setFormData] = useState({...FORM_DATA, categories: []})
  //   street_number: 'short_name',
  //   route: 'long_name',
  //   locality: 'long_name',
  //   sublocality_level_1: 'short_name',        
  //   administrative_area_level_1: 'short_name',
  //   country: 'short_name',
  //   postal_code: 'short_name',
  //   website: ''
  // })

  const handlePlaceSelect = (place) => {
    console.log(place);
  };
  useEffect(() => {
    const autoComplete = new (window as any).google.maps.places.Autocomplete(
      autoCompleteRef.current,
      {
        types: ["establishment"],
        componentRestrictions: { country: ["US", "CA", "TT"] },
        /**
         * {country: string | string[]}
         * componentRestrictions can be used to restrict results to specific groups.
         * Currently, you can use componentRestrictions to filter by up to 5 countries.
         * Countries must be passed as as a two-character, ISO 3166-1 Alpha-2 compatible country code.
         * Multiple countries must be passed as a list of country codes.
         **/
      }
    );
    autoComplete.addListener("place_changed", () => {
      fillInAddress(autoComplete, formData, setFormData);
      // handlePlaceSelect(place);
    });
  }, []);

  async function onSubmit(values: FormData) {
    console.log("submitting form...");
    console.log(values);
  }

  // yes, this can even be async!
  async function validate(values: FormData) {
    if (!values["hi"]) {
      return { hello: "Saying hello is nice." };
    }
    return;
  }

  const formFields: any[] = [
    <TextField name="name" label="Business Name" />,
    <InputBase
      className={styles.input}
      placeholder={`Add Business from US/TT/CA`}
      inputProps={{ "aria-label": "Search The MOBB" }}
      inputRef={autoCompleteRef}
    />,
    <TextField name="street" label="Street" />,
    <TextField name="city" label="City" />,
    <TextField name="state" label="State" />,
    <TextField name="zip" label="Zipcode" />,
    <TextField name="country" label="Country" />,
    <TextField name="phone" label="Phone" />,
    <TextField name="url" label="URL" />,
    <TextField name="social.instagram" label="Instagram" />,
    <TextField name="social.facebook" label="Facebook" />,
    <TextField name="social.twitter" label="Twitter" />,
    <TextField name="image" label="Image" />,
    <TextField name="categories" label="Categories" />,
    <TextField name="google_id" label="Google ID" />,
  ];

  return (
    <Container>
      <Typography variant={"h2"}> Add Listing</Typography>
      <Form
        id="search-mobb"
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit, values }) => (
          <form onSubmit={handleSubmit} noValidate>
            <Grid container direction="column" alignContent="stretch">
              {formFields.map((item, idx) => (
                <Grid item className={""} key={idx}>
                  {item}
                </Grid>
              ))}
            </Grid>
          </form>
        )}
      ></Form>
    </Container>
  );
};

export default AddListing;
