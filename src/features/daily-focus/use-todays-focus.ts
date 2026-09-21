import { useEffect, useRef, useState } from "react";
import { currentCardDay, getTodaysFocus, rememberedTodaysFocus } from "./today";
import type { DailyFocusResult } from "./types";

export type FocusState = { status: "loading" } | DailyFocusResult;

// Today's card for a screen. Starts from the card already in hand when there is
// one, so it appears with no wait at all. `retry` asks again. Her card day runs
// from 08:00 to 08:00, so a phone left open overnight moves on to the new card by
// itself the next time she comes back to the app after 08:00.
export function useTodaysFocus() {
  const [state, setState] = useState<FocusState>(
    () => rememberedTodaysFocus() ?? { status: "loading" },
  );
  // Goes up by one each "Try again" (or new day), which is what starts another go.
  const [attempt, setAttempt] = useState(0);
  // The card day this screen last asked about.
  const dayShown = useRef(currentCardDay());

  useEffect(() => {
    let current = true;
    dayShown.current = currentCardDay();
    getTodaysFocus()
      .then((result) => {
        if (current) setState(result);
      })
      .catch(() => {
        if (current) setState({ status: "unavailable" });
      });
    return () => {
      current = false;
    };
  }, [attempt]);

  // Coming back to the app after 08:00 on a new day: fetch the new card.
  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible") return;
      if (currentCardDay() === dayShown.current) return;
      setState({ status: "loading" });
      setAttempt((count) => count + 1);
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, []);

  function retry() {
    setState({ status: "loading" });
    setAttempt((count) => count + 1);
  }

  return { state, retry };
}
