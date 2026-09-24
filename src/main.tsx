import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// The fonts. Only the weights the app actually uses, latin only, so there is as
// little to download as possible. DM Sans is the variable version, which covers
// every weight — that is what makes bold text inside a note look properly bold.
import "@fontsource-variable/dm-sans/wght.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500.css";

import { PostHogErrorBoundary, PostHogProvider } from "posthog-js/react";

import "./styles.css";
import { posthog } from "./lib/posthog";
import App from "./app";

const app = posthog ? (
  <PostHogProvider client={posthog}>
    <PostHogErrorBoundary
      fallback={<div role="alert">Something went wrong. Please refresh and try again.</div>}
    >
      <App />
    </PostHogErrorBoundary>
  </PostHogProvider>
) : (
  <App />
);

createRoot(document.getElementById("root")!).render(
  <StrictMode>{app}</StrictMode>,
);
