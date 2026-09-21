// What she has typed into onboarding so far, kept here so it is still there
// when she goes back a screen.
//
// Lives OUTSIDE React like the other stores. It is held in memory only for now:
// nothing is written to the phone's storage or the database yet, so closing the
// app starts the questions again. Saving comes with the profile table.

import { registerSignOutHandler } from "@/lib/session";
import type { Chart } from "../chart/natal-chart";
import type { Place } from "../places/places";

export type Answers = {
  name: string;
  // Kept as the text she typed, so half-finished fields don't jump around.
  day: string;
  month: string;
  year: string;
  // As "HH:MM" in 24-hour time, or "" until she picks one.
  birthTime: string;
  place: Place | null;
  // Worked out from the answers above. Thrown away whenever a birth detail
  // changes, so it is made again from the new details.
  chart: Chart | null;
};

const empty: Answers = {
  name: "",
  day: "",
  month: "",
  year: "",
  birthTime: "",
  place: null,
  chart: null,
};

// Changing any of these means the chart no longer matches her.
const birthDetails = ["day", "month", "year", "birthTime", "place"] as const;

let answers: Answers = empty;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// The same object comes back until something changes, which React needs.
export function getAnswers() {
  return answers;
}

export function setAnswers(patch: Partial<Omit<Answers, "chart">>) {
  const keys = Object.keys(patch) as (keyof typeof patch)[];
  if (!keys.some((key) => patch[key] !== answers[key])) return;

  const birthChanged = birthDetails.some(
    (key) => key in patch && patch[key] !== answers[key],
  );
  answers = { ...answers, ...patch, chart: birthChanged ? null : answers.chart };
  notify();
}

export function setChart(chart: Chart) {
  answers = { ...answers, chart };
  notify();
}

export function clearAnswers() {
  answers = empty;
  notify();
}

// Her name and birthday must not still be here when someone else logs in.
registerSignOutHandler({
  prepare: async () => null,
  clear: async () => clearAnswers(),
});
