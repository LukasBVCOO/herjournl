// The whole calculation for one day, start to finish: her saved chart and a day
// go in, a finished card comes out. Nothing is saved here and nothing is shown.
//
// If anything is missing or broken (her chart, the Moon calculation, the wording)
// this throws. A card is never made up.

import type { Chart, ReducedChart } from "@/features/onboarding";
import type { Transits } from "@/features/transits";
import { readMoon } from "./active-house";
import { readMoonSign } from "./moon-sign";
import {
  assembleDailyFocusCard,
  assembleReducedDailyFocusCard,
  NO_RECENT_VARIANTS,
  type RecentVariants,
} from "./assemble-card";
import { themeCategory } from "./content/moon-sign-themes";
import type { DailyFocusCard } from "./types";

// What she's already seen recently for today's area of life (or theme), so
// the reflection and prompts can avoid repeating — see variant-history.ts
// for the real implementation. Defaults to "avoid nothing", so tests and any
// caller that doesn't care about repeats don't have to wire one up.
export type RecentVariantsPort = (area: { house: number } | { category: string }) => Promise<RecentVariants>;
// The same idea for the evening reflection's flat, un-grouped pool.
export type RecentEveningReflectionPort = () => Promise<readonly number[]>;

export async function generateDailyFocus(
  userId: string,
  chart: Chart | ReducedChart,
  localDate: string,
  timeZone: string,
  // How the planets are worked out. The app always uses the default.
  calculate?: (at: Date) => Promise<Transits>,
  findRecent: RecentVariantsPort = async () => NO_RECENT_VARIANTS,
  findRecentEveningReflection: RecentEveningReflectionPort = async () => [],
): Promise<DailyFocusCard> {
  const recentEveningReflection = await findRecentEveningReflection();
  if (chart.kind === "reduced") {
    const moon = await readMoonSign(localDate, timeZone, calculate);
    const recent = await findRecent({ category: themeCategory(moon.moonSign) });
    return assembleReducedDailyFocusCard({ userId, moon, chart, recent, recentEveningReflection });
  }
  const moon = await readMoon(chart, localDate, timeZone, calculate);
  const recent = await findRecent({ house: moon.activeHouse });
  return assembleDailyFocusCard({ userId, moon, chart, recent, recentEveningReflection });
}
