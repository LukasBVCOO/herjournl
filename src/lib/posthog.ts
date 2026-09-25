import posthogJs from "posthog-js";

const projectToken = import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN;
const apiHost = import.meta.env.VITE_PUBLIC_POSTHOG_HOST;

if (!projectToken || !apiHost) {
  if (import.meta.env.DEV) {
    const missingVariable = projectToken
      ? "VITE_PUBLIC_POSTHOG_HOST"
      : "VITE_PUBLIC_POSTHOG_PROJECT_TOKEN";

    throw new Error(
      `${missingVariable} variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once ${missingVariable} is configured`,
    );
  }
}

if (projectToken && apiHost) {
  posthogJs.init(projectToken, {
    api_host: apiHost,
    defaults: "2026-01-30",
    // Her writing is private and must never leave the app. PostHog's
    // automatic tap tracking would otherwise send the words on whatever she
    // taps (a note's title and first line in her list, a vision board tile),
    // so it keeps the tap but never its text or the element's attributes.
    mask_all_text: true,
    mask_all_element_attributes: true,
    // Same for screen recordings, if they're ever switched on in PostHog:
    // every piece of text is hidden, every typed-in box is hidden, and
    // pictures (her vision board photos) are left out entirely.
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: "*",
      blockSelector: "img",
    },
  });
}

// Import this singleton at call sites and use optional chaining in case PostHog
// is intentionally unconfigured in a production build.
export const posthog = projectToken && apiHost ? posthogJs : undefined;
