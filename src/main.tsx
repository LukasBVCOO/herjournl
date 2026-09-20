import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// The fonts. Only the weights the app actually uses, latin only, so there is as
// little to download as possible. DM Sans is the variable version, which covers
// every weight — that is what makes bold text inside a note look properly bold.
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500.css";

import "./styles.css";
import App from "./app";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
