// The whole calculation for one day, start to finish: her saved chart and a day
// go in, a finished card comes out. Nothing is saved here and nothing is shown.
//
// If anything is missing or broken (her chart, the Moon calculation, the wording)
// this throws. A card is never made up.

import type { Chart } from "@/features/onboarding";
import type { Transits } from "@/features/transits";
import { readMoon } from "./active-house";
import { assembleDailyFocusCard } from "./assemble-card";
import type { DailyFocusCard } from "./types";

export async function generateDailyFocus(
  userId: string,
  chart: Chart,
  localDate: string,
  timeZone: string,
  // How the planets are worked out. The app always uses the default.
  calculate?: (at: Date) => Promise<Transits>,
): Promise<DailyFocusCard> {
  const moon = await readMoon(chart, localDate, timeZone, calculate);
  return assembleDailyFocusCard({ userId, moon, natalMoonSign: chart.moon.sign });
}
