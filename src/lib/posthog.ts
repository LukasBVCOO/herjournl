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
  });
}

// Import this singleton at call sites and use optional chaining in case PostHog
// is intentionally unconfigured in a production build.
export const posthog = projectToken && apiHost ? posthogJs : undefined;
