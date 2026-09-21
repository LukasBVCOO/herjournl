// Today's planets as they fall on HER chart: which of her houses each one is in,
// and the angles it makes to her birth planets. This is what a daily focus will
// be built from.

import type { Chart } from "@/features/onboarding";
import { findAspects, type TransitAspect } from "./aspects";
import { houseOf, houseStarts } from "./houses";
import {
  calculateTransits,
  TRANSIT_PLANETS,
  type TransitPlanet,
  type TransitPosition,
  type Transits,
} from "./transits";

export type TransitInHouse = TransitPosition & {
  // Which of HER houses it is in, 1 to 12.
  house: number;
};

export type TransitsForChart = {
  at: string;
  planets: Record<TransitPlanet, TransitInHouse>;
  aspects: TransitAspect[];
};

// Puts already-calculated transits onto her chart.
export function transitsForChart(
  transits: Transits,
  chart: Chart,
  orb?: number,
): TransitsForChart {
  const starts = houseStarts(chart);

  const planets = Object.fromEntries(
    TRANSIT_PLANETS.map((planet) => {
      const position = transits.planets[planet];
      return [planet, { ...position, house: houseOf(position.longitude, starts) }];
    }),
  ) as Record<TransitPlanet, TransitInHouse>;

  return { at: transits.at, planets, aspects: findAspects(transits, chart, orb) };
}

// Where the planets are at `at` (right now if not given), on her chart.
export async function calculateTransitsForChart(
  chart: Chart,
  at: Date = new Date(),
  orb?: number,
): Promise<TransitsForChart> {
  return transitsForChart(await calculateTransits(at), chart, orb);
}
