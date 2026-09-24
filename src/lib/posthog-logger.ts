import { posthog } from "./posthog";

// This dedicated logger deliberately sends only the purpose-written lines at
// its call sites; it does not capture the app's existing console output.
export const posthogLogger = {
  info(message: string) {
    posthog?.logger.info(message);
  },
};
