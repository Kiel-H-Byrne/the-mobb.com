import { ThemeProvider } from "@material-ui/core";
import { theme } from "../styles/myTheme";
// import * as serviceWorker from "../public/sw";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider theme={theme}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}
// serviceWorker.register();

export default MyApp;
