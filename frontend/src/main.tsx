import { createRoot } from "react-dom/client";
// Self-hosted Inter (BMW Type Next Latin substitute) — 300 Light body / 700 display.
import "@fontsource/inter/300.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import { App } from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  //<StrictMode>
  <App />
  //</StrictMode>
);
