import { useSyncExternalStore } from "react";
import { getAnswers, subscribe } from "./answers-store";

// What she has entered in onboarding so far, for any screen that needs it.
export function useAnswers() {
  return useSyncExternalStore(subscribe, getAnswers, getAnswers);
}
