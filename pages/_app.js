import { ThemeProvider, StyledEngineProvider } from "@mui/material";
import { theme } from "../src/style/myTheme";
import { SessionProvider } from "next-auth/react";
// import * as serviceWorker from "../public/sw";

function MyApp({ Component, pageProps }) {
  return (
    <SessionProvider session={pageProps.session}>
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
      </StyledEngineProvider>
    </SessionProvider>
  );
}
// serviceWorker.register();

export default MyApp;
