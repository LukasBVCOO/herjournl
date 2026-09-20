import { useSyncExternalStore } from "react";
import { getSession, subscribe } from "./session-store";

// Who is signed in, for any screen that needs to know.
export function useSession() {
  return useSyncExternalStore(subscribe, getSession, getSession);
}
