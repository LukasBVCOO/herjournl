// The whole calculation for one day, start to finish: her saved chart and a day
// go in, a finished card comes out. Nothing is saved here and nothing is shown.
//
// If anything is missing or broken (her chart, the Moon calculation, the wording)
// this throws. A card is never made up.

import type { Chart, ReducedChart } from "@/features/onboarding";
import type { Transits } from "@/features/transits";
import { readMoon } from "./active-house";
import { readMoonSign } from "./moon-sign";
import { assembleDailyFocusCard, assembleReducedDailyFocusCard } from "./assemble-card";
import type { DailyFocusCard } from "./types";

export async function generateDailyFocus(
  userId: string,
  chart: Chart | ReducedChart,
  localDate: string,
  timeZone: string,
  // How the planets are worked out. The app always uses the default.
  calculate?: (at: Date) => Promise<Transits>,
): Promise<DailyFocusCard> {
  if (chart.kind === "reduced") {
    const moon = await readMoonSign(localDate, timeZone, calculate);
    return assembleReducedDailyFocusCard({ userId, moon, chart });
  }
  const moon = await readMoon(chart, localDate, timeZone, calculate);
  return assembleDailyFocusCard({ userId, moon, chart });
}
