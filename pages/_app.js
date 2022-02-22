import { ThemeProvider, StyledEngineProvider } from "@mui/material";
import { theme } from "../src/style/myTheme";
// import * as serviceWorker from "../public/sw";

function MyApp({ Component, pageProps }) {
  return (
    <StyledEngineProvider injectFirst>
      <ThemeProvider theme={theme}>
        <Component {...pageProps} />
      </ThemeProvider>
    </StyledEngineProvider>
  );
}
// serviceWorker.register();

export default MyApp;
