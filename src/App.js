import React, { useContext } from "react";
import { Grid, LinearProgress } from "@material-ui/core";

import AppMap from "./components/Map/AppMap";
import Nav from "./components/Nav/Nav.js";
import "./App.scss";
import { AppContext, AppProvider } from "./components/AppProvider";

const App_ = React.memo(() => {
  const [context, setContext] = useContext(AppContext);
  const { listings } = context;
  return (
    <div className="App_wrapper">
      {!listings ? (
        <LinearProgress />
      ) : (
        <div>
          <Grid container>
            <Nav />
            {/* <AppMap listings={listings} categories={categories} /> */}
          </Grid>
        </div>
      )}
    </div>
  );
});

const App = React.memo(() => {
  return (
    <AppProvider>
      <App_ />
    </AppProvider>
  );
});
export default App;
