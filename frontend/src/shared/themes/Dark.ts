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
      default: "#121212", // cinza quase preto, confortável para o fundo principal
      paper: "#1E1E1E", // cinza escuro mais suave para superfícies
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
