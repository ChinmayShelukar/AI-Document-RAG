import { createTheme } from "@mui/material";

export const DarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#0A7BFF",
      light: "#5AAEFF",
      dark: "#005FCC",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#757575",
      light: "#AFAFAF",
      dark: "#494949",
      contrastText: "#ffffff",
    },
    background: {
      default: "#121212", // near-black gray, comfortable for the main background
      paper: "#1E1E1E", // softer dark gray for surfaces
    },
    text: {
      primary: "#E0E0E0",
      secondary: "#B0B0B0",
      disabled: "#7A7A7A",
    },
    error: {
      main: "#FF7043",
    },
  },
});
