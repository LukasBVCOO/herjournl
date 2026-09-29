// Today's 369, kept outside React so the overview and today's practice show
// the same line and the same dots. Screens read it with useSyncExternalStore
// (see use-daily-369.ts).
//
// Which line today (founder, 2026-09-29):
//   1. She already started today: that line.
//   2. Otherwise she picks, every day: a theme, a goal and a belief for the
//      house today's card is in — a different three each day
//      (daily-lines.ts) — plus a fourth, yesterday's line, if she had one,
//      so keeping it is her choice. Nothing carries over by itself.
// She can change the line at any time; after she has started, that begins
// the day's 3·6·9 again for the new line.

import { cardDayIn, deviceTimeZone, getTodaysFocus } from "@/features/daily-focus";
import { posthog } from "@/lib/posthog";
import { getSession, registerSignOutHandler } from "@/lib/session";
import {
  fetchDay,
  fetchLatestBefore,
  saveDay,
  startDay,
  type Affirmation,
  type Day369,
} from "./affirmations-api";
import { linesForHouse } from "./content/lines";
import { dailyLines } from "./daily-lines";
import { TARGET, type Session } from "./sessions";

export type Daily369State =
  | { status: "loading" }
  | { status: "error"; offline: boolean }
  // No line yet today. `options` are today's three (daily-lines.ts).
  // `current` is set when she's changing a line she already had;
  // `yesterday` is her last line, offered as a fourth choice.
  | {
      status: "choose";
      cardDay: string;
      house: number;
      options: Affirmation[];
      current: Day369 | null;
      yesterday: Affirmation | null;
    }
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

  const existing = await fetchDay(cardDay);
  if (!existing.ok) return set({ status: "error", offline: existing.offline });
  const options = dailyLines(linesForHouse(house), cardDay, getSession().userId ?? "");
  loadedFor = cardDay;

  if (existing.value) {
    return set({ status: "ready", cardDay, house, options, day: existing.value, unsaved: false });
  }

  const previous = await fetchLatestBefore(cardDay);
  if (!previous.ok) return set({ status: "error", offline: previous.offline });
  set({
    status: "choose",
    cardDay,
    house,
    options,
    current: null,
    yesterday: previous.value?.affirmation ?? null,
  });
}

const NO_COUNTS = { morning: 0, afternoon: 0, evening: 0 };
const NO_TIMES = { morning: null, afternoon: null, evening: null };

// She picked a line for today, or a different one in place of today's.
export async function chooseLine(line: Affirmation) {
  if (state.status !== "choose") return;
  const { cardDay, house, options, current } = state;

  if (current) {
    // The same line again: nothing changes, her count carries on.
    if (current.affirmation.id === line.id) {
      set({ status: "ready", cardDay, house, options, day: current, unsaved: false });
      return;
    }
    // A different line starts the day's 3·6·9 again.
    const day: Day369 = { ...current, affirmation: line, counts: NO_COUNTS, doneAt: NO_TIMES };
    set({ status: "ready", cardDay, house, options, day, unsaved: false });
    const saved = await saveDay(day, true);
    if (!saved) markUnsaved();
  } else {
    const started = await startDay(cardDay, line.id);
    if (!started.ok) return set({ status: "error", offline: started.offline });
    const fresh = await fetchDay(cardDay);
    if (!fresh.ok || !fresh.value) return set({ status: "error", offline: !fresh.ok && fresh.offline });
    set({ status: "ready", cardDay, house, options, day: fresh.value, unsaved: false });
  }
  posthog?.capture("affirmation_line_chosen", { type: line.type });
}

// Back to the picker, at any time. If she has already started, picking a
// different line there begins the day again (the screen asks first).
export function changeLine() {
  if (state.status !== "ready") return;
  const { cardDay, house, options, day } = state;
  set({ status: "choose", cardDay, house, options, current: day, yesterday: null });
}

// Out of the picker without changing anything.
export function keepCurrentLine() {
  if (state.status !== "choose" || !state.current) return;
  const { cardDay, house, options, current } = state;
  set({ status: "ready", cardDay, house, options, day: current, unsaved: false });
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

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    loadedFor = null;
    state = { status: "loading" };
  },
});
