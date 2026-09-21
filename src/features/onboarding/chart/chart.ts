// Creating her chart from what she told us in onboarding: the bridge between
// her answers and the calculation in natal-chart.ts.

import type { Answers } from "../data/answers-store";
import { parseBirthTime } from "../validation/birth-time";
import { calculateChart, type Chart } from "./natal-chart";

export async function createChart(answers: Answers): Promise<Chart> {
  // TESTING ONLY: adding ?fail to the address of the "Mapping your chart"
  // screen makes this fail, so the error screen can be seen.
  if (new URLSearchParams(window.location.search).has("fail")) {
    throw new Error("Test failure");
  }

  const { place } = answers;
  const time = parseBirthTime(answers.birthTime);
  // Without a birth time there is no Rising sign or houses. That path (the
  // "I don't know my birth time" option) is not built yet, so it stops here.
  if (!place || !time) throw new Error("Missing birth details");

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
