// Where the Moon is today, by sign alone — no chart and no houses needed. Used
// for a reduced card (no birth time), where a house can never be worked out.
// The full-profile path (active-house.ts) still does its own, separate Moon
// reading, because it also needs a chart to place that Moon in a house.

import type { Sign } from "@/features/onboarding";
import { calculateTransits, type Transits } from "@/features/transits";
import { referenceInstant } from "./local-day";

export type MoonSignReading = {
  // The day and time zone it was worked out for.
  localDate: string;
  timeZone: string;
  // The exact moment used, as an ISO time in UTC.
  referenceInstant: string;
  // Where the Moon is around the whole circle, 0 to 360 (still kept, for the
  // day's Moon-to-natal-planet angle — see moon-aspect.ts).
  moonLongitude: number;
  moonSign: Sign;
};

// The Moon at 08:00 on `localDate` in `timeZone`. `calculate` is how the
// planets are worked out; the app always uses the default, and it can be
// swapped so this can be tried out without a browser.
export async function readMoonSign(
  localDate: string,
  timeZone: string,
  calculate: (at: Date) => Promise<Transits> = calculateTransits,
): Promise<MoonSignReading> {
  const at = referenceInstant(localDate, timeZone);
  const transits = await calculate(at);
  return {
    localDate,
    timeZone,
    referenceInstant: transits.at,
    moonLongitude: transits.planets.moon.longitude,
    moonSign: transits.planets.moon.sign,
  };
}
