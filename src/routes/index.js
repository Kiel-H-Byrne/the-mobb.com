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
export const CHECKOUT = "/checkout";
export const CREATE_EVENT = "/createEvent";
export const DASHBOARD = "/dashboard";
export const EVENT = "/event/:eventId";
export const EVENTS = "/events";
export const PRIVACY = "/privacy";
export const PROFILE = "/profile";

//CodeSplit Components
const Checkout = asyncComponent(() => import("../components/pages/Checkout"));
const CreateEvent = asyncComponent(() =>
  import("../components/pages/CreateEvent")
);
const Dashboard = asyncComponent(() => import("../components/pages/Dashboard"));
const Event = asyncComponent(() => import("../components/pages/Event"));
const Events = asyncComponent(() => import("../components/pages/Events"));
const Privacy = asyncComponent(() => import("../components/pages/Privacy"));
const Profile = asyncComponent(() => import("../components/pages/Profile"));
fsdf
//Routes Object
const routes = (
  <div>
    <Navigation />
    <Switch>
      <Route exact path={CHECKOUT} component={Checkout} />
      <Route exact path={CREATE_EVENT} component={CreateEvent} />
      <Route exact path={DASHBOARD} component={Dashboard} />
      <Route exact path={EVENT} component={Event} />
      <Route exact path={EVENTS} component={Events} />
      <Route exact path={LANDING} component={Landing} />
      <Route exact path={PRIVACY} component={Privacy} />
      <Route exact path={PROFILE} component={Profile} />
    </Switch>
  </div>
);

export default routes;
