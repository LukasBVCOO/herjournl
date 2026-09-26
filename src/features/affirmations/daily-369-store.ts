// Today's 369, kept outside React so the affirmations screen, the morning
// entry and the evening reflection all show the same line and the same dots
// (a tap in one is already there in the others). Screens read it with
// useSyncExternalStore (see use-daily-369.ts).
//
// Which line today:
//   1. She already started today: that line.
//   2. Her last day was pinned: the same line, still pinned.
//   3. Her last line belongs to the house today's card is in (the Moon stays
//      in a house for 2 to 3 days): the same line again.
//   4. Otherwise she picks one of the house's three lines (theme first, as
//      the suggested default).

import { cardDayIn, deviceTimeZone, getTodaysFocus } from "@/features/daily-focus";
import { posthog } from "@/lib/posthog";
import { registerSignOutHandler } from "@/lib/session";
import {
  fetchDay,
  fetchLatestBefore,
  fetchLines,
  saveDay,
  startDay,
  type Affirmation,
  type Day369,
} from "./affirmations-api";
import { TARGET, type Session } from "./sessions";

export type Daily369State =
  | { status: "loading" }
  | { status: "error"; offline: boolean }
  // No line yet today. `current` is set when she's changing a line she already had.
  | { status: "choose"; cardDay: string; house: number; options: Affirmation[]; current: Day369 | null }
  | { status: "ready"; cardDay: string; house: number; options: Affirmation[]; day: Day369; unsaved: boolean };

let state: Daily369State = { status: "loading" };
let loadedFor: string | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: Daily369State) {
  state = next;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getState(): Daily369State {
  return state;
}

function today(): string {
  try {
    return cardDayIn(new Date(), deviceTimeZone());
  } catch {
    return "";
  }
}

// Loads today's line, once per card day. Safe to call on every render.
export function ensureLoaded() {
  const cardDay = today();
  if (loading || (loadedFor === cardDay && state.status !== "error")) return;
  loading = load(cardDay).finally(() => {
    loading = null;
  });
}

export function retry() {
  loadedFor = null;
  set({ status: "loading" });
  ensureLoaded();
}

async function load(cardDay: string) {
  if (loadedFor !== cardDay) set({ status: "loading" });

  // The house comes from today's focus card; with no card (no birth time
  // or no chart yet) the general lines are used.
  let house = 0;
  try {
    const focus = await getTodaysFocus();
    if (focus.status === "ready") house = focus.card.activeHouse ?? 0;
  } catch {
    // Falls back to the general lines.
  }

  const [lines, existing] = await Promise.all([fetchLines(house), fetchDay(cardDay)]);
  if (!lines.ok) return set({ status: "error", offline: lines.offline });
  if (!existing.ok) return set({ status: "error", offline: existing.offline });
  const options = lines.value;
  loadedFor = cardDay;

  if (existing.value) {
    return set({ status: "ready", cardDay, house, options, day: existing.value, unsaved: false });
  }

  const previous = await fetchLatestBefore(cardDay);
  if (!previous.ok) return set({ status: "error", offline: previous.offline });
  const last = previous.value;
  if (last && (last.pinned || last.affirmation.house === house)) {
    const started = await startDay(cardDay, last.affirmation.id, last.pinned);
    if (!started.ok) return set({ status: "error", offline: started.offline });
    const fresh = await fetchDay(cardDay);
    if (fresh.ok && fresh.value) {
      return set({ status: "ready", cardDay, house, options, day: fresh.value, unsaved: false });
    }
    return set({ status: "error", offline: false });
  }

  set({ status: "choose", cardDay, house, options, current: null });
}

// She picked a line for today (or changed it before starting).
export async function chooseLine(line: Affirmation) {
  if (state.status !== "choose") return;
  const { cardDay, house, options, current } = state;

  if (current) {
    const day: Day369 = { ...current, affirmation: line };
    set({ status: "ready", cardDay, house, options, day, unsaved: false });
    const saved = await saveDay(day, true);
    if (!saved) markUnsaved();
  } else {
    const started = await startDay(cardDay, line.id, false);
    if (!started.ok) return set({ status: "error", offline: started.offline });
    const fresh = await fetchDay(cardDay);
    if (!fresh.ok || !fresh.value) return set({ status: "error", offline: !fresh.ok && fresh.offline });
    set({ status: "ready", cardDay, house, options, day: fresh.value, unsaved: false });
  }
  posthog?.capture("affirmation_line_chosen", { type: line.type });
}

// Back to the picker. Only before any repetition: once she's started, the
// day's line is fixed (the database holds to that too).
export function changeLine() {
  if (state.status !== "ready") return;
  const { counts } = state.day;
  if (counts.morning + counts.afternoon + counts.evening > 0) return;
  const { cardDay, house, options, day } = state;
  set({ status: "choose", cardDay, house, options, current: day });
}

function markUnsaved() {
  if (state.status === "ready") set({ ...state, unsaved: true });
}

async function persist(day: Day369) {
  const saved = await saveDay(day);
  // Only the latest state matters: whole counts are sent every time, so the
  // next tap (or the next save) catches up after a failed one.
  if (state.status === "ready" && state.day === day) set({ ...state, unsaved: !saved });
}

// One repetition. Returns true when this one finished the session.
export function repeat(session: Session): boolean {
  if (state.status !== "ready") return false;
  const { day } = state;
  const count = day.counts[session];
  if (count >= TARGET[session]) return false;
  const next = count + 1;
  const finished = next === TARGET[session];
  const updated: Day369 = {
    ...day,
    counts: { ...day.counts, [session]: next },
    doneAt: finished ? { ...day.doneAt, [session]: new Date().toISOString() } : day.doneAt,
  };
  set({ ...state, day: updated });
  void persist(updated);
  if (finished) posthog?.capture("affirmation_session_completed", { session });
  return finished;
}

// Keep this line for the next days, even once the house moves on.
export function togglePin() {
  if (state.status !== "ready") return;
  const updated: Day369 = { ...state.day, pinned: !state.day.pinned };
  set({ ...state, day: updated });
  void persist(updated);
}

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    loadedFor = null;
    state = { status: "loading" };
  },
});
