// Creating her chart from what she told us in onboarding: the bridge between
// her answers and the calculation in natal-chart.ts.

import type { Answers } from "../data/answers-store";
import { parseBirthTime } from "../validation/birth-time";
import { calculateChart, calculateReducedChart, type Chart, type ReducedChart } from "./natal-chart";

export async function createChart(answers: Answers): Promise<Chart | ReducedChart> {
  // TESTING ONLY: adding ?fail to the address of the "Mapping your chart"
  // screen makes this fail, so the error screen can be seen.
  if (new URLSearchParams(window.location.search).has("fail")) {
    throw new Error("Test failure");
  }

  const { place } = answers;
  if (!place) throw new Error("Missing birth details");

  // She told us she doesn't know her birth time: work out only what can be
  // trusted without one, rather than guessing a time to fill the gap.
  if (answers.birthTimeUnknown) {
    return calculateReducedChart({
      year: Number(answers.year),
      month: Number(answers.month),
      day: Number(answers.day),
      latitude: place.latitude,
      longitude: place.longitude,
    });
  }

  const time = parseBirthTime(answers.birthTime);
  if (!time) throw new Error("Missing birth details");

  return calculateChart({
    year: Number(answers.year),
    month: Number(answers.month),
    day: Number(answers.day),
    hour: time.hour,
    minute: time.minute,
    latitude: place.latitude,
    longitude: place.longitude,
  });
}
