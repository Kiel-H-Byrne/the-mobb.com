import { colors, adaptV4Theme } from "@mui/material";
import { createTheme } from '@mui/material/styles'

export const theme = createTheme(adaptV4Theme({
  palette: {
    primary: {
      main: colors.orange["A200"],
    },
    secondary: {
      main: colors.cyan["A400"],
    },
    error: {
      light: colors.red[300],
      main: colors.red[500],
      dark: colors.grey[900],
      contrastText: colors.common.white,
    },
    warning: {
      light: colors.grey[50],
      main: colors.orange["A200"],
      dark: colors.grey[500],
      contrastText: colors.common.white,
    },
    info: {
      light: colors.grey[300],
      main: colors.grey[500],
      dark: colors.grey[900],
      contrastText: colors.common.white,
    },
    success: {
      light: colors.grey[50],
      main: colors.orange["A200"],
      dark: colors.grey[500],
      contrastText: colors.common.white,
    },
  },
}));
