import React from "react";

//Routes
import { Route, Switch } from "react-router";

//Code Splitting
import { asyncComponent } from "../hocs/asyncComponent";

//Components
import Navigation from "../components/Navigation";
import Landing from "../components/pages/Landing";

//Auth
export const LANDING = "/";
export const CREATE_EVENT = "/createListing";
export const DASHBOARD = "/dashboard";
export const LISTING = "/listing/:listingId";
export const LISTINGS = "/listings";
export const PRIVACY = "/privacy";
export const PROFILE = "/profile";

//CodeSplit Components
const Checkout = asyncComponent(() => import("../components/pages/Checkout"));
const CreateListing = asyncComponent(() =>
  import("../components/pages/CreateListing")
);
const Dashboard = asyncComponent(() => import("../components/pages/Dashboard"));
const Listing = asyncComponent(() => import("../components/pages/listing"));
const Listings = asyncComponent(() => import("../components/pages/listings"));
const Privacy = asyncComponent(() => import("../components/pages/Privacy"));
const Profile = asyncComponent(() => import("../components/pages/Profile"));

//Routes Object
const routes = (
  <div>
    <Navigation />
    <Switch>
      <Route exact path={CHECKOUT} component={Checkout} />
      <Route exact path={CREATE_LISTING} component={CreateListing} />
      <Route exact path={DASHBOARD} component={Dashboard} />
      <Route exact path={LISTING} component={Listing} />
      <Route exact path={LISTINGS} component={Listings} />
      <Route exact path={LANDING} component={Landing} />
      <Route exact path={PRIVACY} component={Privacy} />
      <Route exact path={PROFILE} component={Profile} />
    </Switch>
  </div>
);

export default routes;
