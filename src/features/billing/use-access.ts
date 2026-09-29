import { useEffect, useSyncExternalStore } from "react";
import { ensureLoaded, getState, subscribe } from "./access-store";

// Whether she's premium, for a screen. Asks the first time it's needed.
export function useAccess() {
  const state = useSyncExternalStore(subscribe, getState, getState);
  useEffect(() => {
    ensureLoaded();
  }, []);
  return state;
}
