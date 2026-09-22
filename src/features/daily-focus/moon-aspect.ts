// How the Moon relates to one of her seven natal planets today: the angle that
// is closest to exact. The house (active-house.ts) decides WHAT area of life is
// in focus; this decides HOW to approach it. The house moves slowly (the Moon
// spends two or three days in one), so this is what keeps the card from
// repeating itself while the house stays the same.
//
// There is no cut-off: whichever of the 35 possible angles (7 planets x 5
// angles) is closest to exact today is used, however close or far. A card must
// never be left without an approach, so nothing here can come back empty.

import type { Chart } from "@/features/onboarding";
import { longitudeOf } from "@/features/transits";
import { ASPECT_NAMES, ASPECT_PLANETS, type AspectName, type AspectPlanet } from "./content/moon-aspects";

export type MoonAspect = {
  planet: AspectPlanet;
  aspect: AspectName;
  // How far the angle is from exact, in degrees. Smaller is closer. Kept so a
  // card can always be explained later, never shown to her.
  orb: number;
};

const TARGET_ANGLE: Record<AspectName, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

// The shortest way round the circle between two positions, 0 to 180.
function distance(a: number, b: number) {
  const apart = Math.abs(a - b) % 360;
  return apart > 180 ? 360 - apart : apart;
}

// The Moon's angle to her natal planets that is closest to exact today. Always
// returns one: with 35 candidates spread round the circle there is always a
// closest, whatever it turns out to be.
export function closestMoonAspect(moonLongitude: number, chart: Chart): MoonAspect {
  if (!Number.isFinite(moonLongitude) || moonLongitude < 0 || moonLongitude >= 360) {
    throw new Error("The Moon position is not usable");
  }

  let best: MoonAspect | null = null;
  for (const planet of ASPECT_PLANETS) {
    const natal = chart[planet];
    if (!natal || typeof natal.sign !== "string" || !Number.isFinite(natal.degree)) {
      throw new Error("Her saved chart is not usable");
    }
    const to = longitudeOf(natal);
    const apart = distance(moonLongitude, to);

    for (const aspect of ASPECT_NAMES) {
      const orb = Math.round(Math.abs(apart - TARGET_ANGLE[aspect]) * 100) / 100;
      // On an exact tie, the first found wins (the order above: planet then
      // angle), so the result is always the same for the same inputs.
      if (!best || orb < best.orb) best = { planet, aspect, orb };
    }
  }

  // Unreachable: the loop above always finds at least one candidate.
  if (!best) throw new Error("No angle could be found");
  return best;
}
