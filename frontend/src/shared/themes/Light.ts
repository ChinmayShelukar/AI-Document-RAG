import { createTheme } from "@mui/material";

// BMW M-inspired theme — inverted (light) variant for the theme toggle.
// BMW M's real marketing is dark-only; this keeps the same language (sharp 0px
// corners, uppercase 700 display, light 300 body, M tricolor) on a white canvas.
const fontFamily =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

export const LightTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#000000", // black is the primary action/type color on light
      dark: "#000000",
      light: "#1a1a1a",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#1c69d4", // BMW heritage blue
      dark: "#0653b6",
      light: "#0066b1",
      contrastText: "#ffffff",
    },
    background: {
      default: "#ffffff",
      paper: "#f2f2f2",
    },
    text: {
      primary: "#000000",
      secondary: "#4a4a4a",
      disabled: "#7e7e7e",
    },
    info: {
      main: "#000000",
    },
    error: {
      main: "#e22718", // M red
    },
    warning: {
      main: "#f4b400",
    },
    success: {
      main: "#0fa336",
    },
    divider: "#cccccc",
  },
  typography: {
    fontFamily,
    h4: { fontFamily, fontWeight: 700, fontSize: "40px", letterSpacing: "-0.5px", textTransform: "uppercase", lineHeight: 1.1 },
    h5: { fontFamily, fontWeight: 700, fontSize: "32px", letterSpacing: "-0.5px", textTransform: "uppercase", lineHeight: 1.15 },
    h6: { fontFamily, fontWeight: 700, fontSize: "20px", letterSpacing: "1.5px", textTransform: "uppercase" },
    subtitle1: { fontFamily, fontWeight: 300, fontSize: "16px", lineHeight: 1.5 },
    body1: { fontFamily, fontWeight: 300, fontSize: "16px", lineHeight: 1.5 },
    body2: { fontFamily, fontWeight: 300, fontSize: "14px", lineHeight: 1.5 },
    button: {
      fontFamily,
      fontWeight: 700,
      fontSize: "14px",
      textTransform: "uppercase",
      letterSpacing: "1.5px",
    },
  },
  shape: {
    borderRadius: 0,
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 0,
          paddingTop: 16,
          paddingBottom: 16,
          paddingLeft: 32,
          paddingRight: 32,
          minHeight: 48,
        },
        // Primary CTA: black fill, white uppercase label (inverted from dark theme).
        containedPrimary: {
          backgroundColor: "#000000",
          color: "#ffffff",
          border: "1px solid #000000",
          "&:hover": { backgroundColor: "#ffffff", color: "#000000" },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: "none" },
        rounded: { borderRadius: 0 },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          backgroundColor: "#f2f2f2",
        },
      },
    },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
});
