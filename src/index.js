import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "./index.css";

import App from "./App";
import * as serviceWorker from "./serviceWorker";
import Auth0ProviderWithHistory from "./auth/auth0-provider-with-history";
import { ThemeProvider } from "@material-ui/core";
import { theme } from "./style/myTheme";

ReactDOM.hydrate(
  <BrowserRouter>
    <Auth0ProviderWithHistory>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </Auth0ProviderWithHistory>
  </BrowserRouter>,

  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
