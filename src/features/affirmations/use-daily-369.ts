import { useEffect, useSyncExternalStore } from "react";
import { ensureLoaded, getState, subscribe } from "./daily-369-store";

// Today's 369 for a screen. Loads it the first time it's needed each day.
export function useDaily369() {
  const state = useSyncExternalStore(subscribe, getState, getState);
  useEffect(() => {
    ensureLoaded();
  }, []);
  return state;
}
