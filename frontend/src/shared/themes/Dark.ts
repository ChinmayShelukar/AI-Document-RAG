import { createTheme } from "@mui/material";

// BMW M-inspired theme (design tokens from DESIGN-bmw-m.md).
// Near-black canvas, white type, sharp 0px corners, uppercase letterspaced buttons.
// The M tricolor (blue-light -> blue-dark -> red) is the single brand signature —
// used only as a stripe/accent, never as a fill or CTA color.
// Inter stands in for BMW Type Next Latin (700 display / 300 light body).
const fontFamily =
  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';

// M tricolor exposed for the stripe component (see pages).
export const M_STRIPE = "linear-gradient(90deg, #0066b1 0%, #0066b1 33%, #1c69d4 33%, #1c69d4 66%, #e22718 66%, #e22718 100%)";

export const DarkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff", // white is the primary action/type color
      dark: "#e6e6e6",
      light: "#ffffff",
      contrastText: "#000000",
    },
    secondary: {
      main: "#1c69d4", // BMW heritage blue (middle M-stripe stop)
      dark: "#0653b6",
      light: "#0066b1",
      contrastText: "#ffffff",
    },
    background: {
      default: "#000000", // true black canvas
      paper: "#1a1a1a", // surface-card
    },
    text: {
      primary: "#ffffff", // on-dark
      secondary: "#bbbbbb", // body
      disabled: "#7e7e7e", // muted
    },
    info: {
      main: "#ffffff",
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
    divider: "#3c3c3c", // hairline
  },
  typography: {
    fontFamily,
    // Heavy display (700) vs light body (300) is the BMW editorial signature.
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
    borderRadius: 0, // sharp rectangles — the industrial-precision brand silhouette
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
        // Primary CTA: transparent with a white outline, white uppercase label.
        containedPrimary: {
          backgroundColor: "transparent",
          color: "#ffffff",
          border: "1px solid #ffffff",
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
          backgroundColor: "#1a1a1a",
        },
      },
    },
  },
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
});
