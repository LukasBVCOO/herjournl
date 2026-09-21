// Which of HER houses the Moon is in on a given day. That is the whole of the
// astrology behind a daily focus: the Moon's place in the sky that morning,
// against where her own 12 houses begin.
//
// Her houses come from her birth chart (saved once, never recalculated). The Moon
// is worked out for 08:00 in her time zone, by the same library as her chart.
// Nothing here is guessed: a broken chart or a failed calculation throws, and no
// house is ever made up.

import type { Chart } from "@/features/onboarding";
import { calculateTransits, houseOf, houseStarts, type Transits } from "@/features/transits";
import { referenceInstant } from "./local-day";

export type MoonReading = {
  // The day and time zone it was worked out for.
  localDate: string;
  timeZone: string;
  // The exact moment used, as an ISO time in UTC.
  referenceInstant: string;
  // Where the Moon is around the whole circle, 0 to 360.
  moonLongitude: number;
  // Which of her houses it is in, 1 to 12.
  activeHouse: number;
};

// Her houses must each start after the last, going once round the circle, and
// none can be empty. Anything else means the saved chart is damaged.
function checkStarts(starts: number[]) {
  const valid =
    starts.length === 12 &&
    starts.every((start) => Number.isFinite(start) && start >= 0 && start < 360);
  if (!valid) throw new Error("Her saved house positions are not usable");

  let around = 0;
  for (let index = 0; index < 12; index++) {
    const width = (starts[(index + 1) % 12] - starts[index] + 360) % 360;
    if (width === 0) throw new Error("Her saved house positions are not usable");
    around += width;
  }
  if (Math.abs(around - 360) > 1e-6) throw new Error("Her saved house positions are not usable");
}

// Whether her saved chart has 12 house positions a card can be built from.
export function hasUsableHouses(chart: Chart): boolean {
  try {
    checkStarts(houseStarts(chart));
    return true;
  } catch {
    return false;
  }
}

// The house (1 to 12) that a Moon position falls in on her chart.
export function moonHouse(moonLongitude: number, chart: Chart): number {
  if (!Number.isFinite(moonLongitude) || moonLongitude < 0 || moonLongitude >= 360) {
    throw new Error("The Moon position is not usable");
  }
  let starts: number[];
  try {
    starts = houseStarts(chart);
  } catch {
    throw new Error("Her saved house positions are not usable");
  }
  checkStarts(starts);
  return houseOf(moonLongitude, starts);
}

// The Moon at 08:00 on `localDate` in `timeZone`, and where it falls on her chart.
// `calculate` is how the planets are worked out; the app always uses the default,
// and it can be swapped so this can be tried out without a browser.
export async function readMoon(
  chart: Chart,
  localDate: string,
  timeZone: string,
  calculate: (at: Date) => Promise<Transits> = calculateTransits,
): Promise<MoonReading> {
  const at = referenceInstant(localDate, timeZone);
  const transits = await calculate(at);
  const moonLongitude = transits.planets.moon.longitude;
  return {
    localDate,
    timeZone,
    referenceInstant: transits.at,
    moonLongitude,
    activeHouse: moonHouse(moonLongitude, chart),
  };
}
