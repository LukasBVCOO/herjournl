import { useSyncExternalStore } from "react";
import { getSnapshot, isReady, subscribe } from "./notes-store";

// Her notes, for any screen that lists them. Updates when anything changes.
export function useNotes() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Just "has the phone's copy been read yet". A plain true/false, so a screen
// using only this doesn't redraw every time she types a letter.
export function useNotesReady() {
  return useSyncExternalStore(subscribe, isReady, isReady);
}
