// The angles between today's planets and the points of HER birth chart. The
// library only handles one chart at a time, so this is done here: an angle is
// just the distance round the circle between two positions.

import type { Chart } from "@/features/onboarding";
import { longitudeOf } from "./houses";
import { TRANSIT_PLANETS, type TransitPlanet, type Transits } from "./transits";

// The five main angles between two planets.
const ASPECTS = [
  { name: "conjunction", angle: 0 },
  { name: "sextile", angle: 60 },
  { name: "square", angle: 90 },
  { name: "trine", angle: 120 },
  { name: "opposition", angle: 180 },
] as const;

export type AspectName = (typeof ASPECTS)[number]["name"];

// The points of her chart that today's planets can make an angle to. Her chart
// keeps the Sun to Saturn and her Rising.
const NATAL_POINTS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "rising",
] as const;

export type NatalPoint = (typeof NATAL_POINTS)[number];

export type TransitAspect = {
  transiting: TransitPlanet;
  natal: NatalPoint;
  aspect: AspectName;
  // How far the angle is from being exact, in degrees. Smaller is stronger.
  orb: number;
};

// How close to exact an angle has to be to count. A product choice, not a
// fixed fact: 3 is fairly tight.
export const DEFAULT_ORB = 3;

// The shortest way round the circle between two positions, 0 to 180.
function distance(a: number, b: number) {
  const apart = Math.abs(a - b) % 360;
  return apart > 180 ? 360 - apart : apart;
}

// Every angle within `orb` degrees of exact between today's planets and her
// chart, tightest first.
export function findAspects(
  transits: Transits,
  chart: Chart,
  orb: number = DEFAULT_ORB,
): TransitAspect[] {
  const found: TransitAspect[] = [];

  for (const transiting of TRANSIT_PLANETS) {
    const from = transits.planets[transiting].longitude;

    for (const natal of NATAL_POINTS) {
      const to = longitudeOf(chart[natal]);
      const apart = distance(from, to);

      for (const { name, angle } of ASPECTS) {
        const off = Math.abs(apart - angle);
        if (off <= orb) {
          found.push({
            transiting,
            natal,
            aspect: name,
            orb: Math.round(off * 100) / 100,
          });
        }
      }
    }
  }

  return found.sort((a, b) => a.orb - b.orb);
}
