// "A few overarching points about the person" for the Overview tab — no new
// content-writing, just assembling what's already computed and already
// written elsewhere on this page into a short summary.

import type { HouseNumber } from "@/features/daily-focus";
import { aspectPair, aspectSentence, ASPECT_LABEL } from "./aspect-content";
import type { FullAspect, FullBirthChart, FullPlanetName } from "./full-chart";
import { groupPlanetsByHouse, HOUSE_INFO } from "./house-content";
import { PLANET_LABEL } from "./planet-content";

export type FocusHouse = {
  number: HouseNumber;
  planets: FullPlanetName[];
  label: string;
  description: string;
};

// The house with the most of her planets in it — where her chart's energy is
// most concentrated. Only surfaced when it's genuinely a concentration (2 or
// more planets), not just wherever one lone planet happens to sit.
export function mostOccupiedHouse(chart: FullBirthChart): FocusHouse | null {
  const houseOf = groupPlanetsByHouse(chart);
  let best: { number: number; planets: FullPlanetName[] } | null = null;
  for (const [house, planets] of Object.entries(houseOf)) {
    if (!best || planets.length > best.planets.length) {
      best = { number: Number(house), planets };
    }
  }
  if (!best || best.planets.length < 2) return null;
  const info = HOUSE_INFO[best.number as HouseNumber];
  return { number: best.number as HouseNumber, planets: best.planets, label: info.label, description: info.description };
}

export type FocusAspectLine = { title: string; theme: string; sentence: string };

// Her single strongest aspect — chart.aspects is already sorted tightest-orb
// first, so this is simply the first one, reusing the same pair content the
// Aspects tab itself uses.
export function tightestAspect(chart: FullBirthChart): FocusAspectLine | null {
  const asp: FullAspect | undefined = chart.aspects[0];
  if (!asp) return null;
  const pair = aspectPair(asp.a, asp.b);
  return {
    title: `${PLANET_LABEL[asp.a]} ${ASPECT_LABEL[asp.aspect]} ${PLANET_LABEL[asp.b]}`,
    theme: pair.theme,
    sentence: aspectSentence(asp.aspect, asp.a, asp.b),
  };
}
