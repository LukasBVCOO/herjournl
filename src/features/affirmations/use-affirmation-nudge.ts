import { useEffect, useSyncExternalStore } from "react";
import { cardDayIn, deviceTimeZone, localHourIn } from "@/features/daily-focus";
import { markSeen, seenValue } from "@/lib/seen";
import { ensureLoaded, getState, subscribe, type Daily369State } from "./daily-369-store";
import { isSessionDone, sessionForHour } from "./sessions";

// Remembered on this phone (lib/seen.ts):
//   "affirmations"      the last waiting moment she looked at, so the crown's
//                       dot doesn't keep asking once she's seen it
//   "affirmations-day"  the last card day she opened affirmations at all —
//                       read by "Explore more" (daily-focus) for its own dot
const readSeen = () => seenValue("affirmations");

// What's waiting right now, as "card day:session" — today's line still to be
// chosen, or the session for this time of day not finished — or null when
// nothing is. A new session or a new day is a new moment, so the dot can
// return even after she's seen an earlier one.
function pendingMoment(state: Daily369State): string | null {
  if (state.status !== "choose" && state.status !== "ready") return null;
  const session = sessionForHour(localHourIn(new Date(), deviceTimeZone()));
  if (state.status === "ready" && isSessionDone(state.day.counts, session)) return null;
  return `${state.cardDay}:${session}`;
}

// For the crown in the bottom bar: true when an affirmation is waiting that
// she hasn't looked at yet. `viewing` is whether she's on the affirmations
// pages right now — being there counts as having seen it. `enabled` is off on
// the free plan: no dot, and today's line (and the focus card it comes from,
// which costs money to make) isn't loaded just for the dot.
export function useAffirmationNudge(viewing: boolean, enabled: boolean): boolean {
  const state = useSyncExternalStore(subscribe, getState, getState);
  const moment = enabled ? pendingMoment(state) : null;

  useEffect(() => {
    if (enabled) ensureLoaded();
  }, [enabled]);

  useEffect(() => {
    if (viewing && moment) markSeen("affirmations", moment);
  }, [viewing, moment]);

  useEffect(() => {
    if (!viewing) return;
    try {
      markSeen("affirmations-day", cardDayIn(new Date(), deviceTimeZone()));
    } catch {
      // Her time zone couldn't be read: the Explore dot just stays.
    }
  }, [viewing]);

  return !viewing && moment !== null && readSeen() !== moment;
}
