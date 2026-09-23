// The complete birth chart: everything circular-natal-horoscope-js can give
// that onboarding's smaller chart (chart/natal-chart.ts, 7 planets + Rising +
// houses, no aspects) doesn't ask for — Uranus, Neptune, Pluto, retrograde
// flags, the lunar nodes, Lilith, Chiron, and the angles between her planets.
// See DATA-SOURCES.md §3.
//
// Calculated fresh from her saved birth details whenever this page is opened,
// not saved anywhere: nothing about profiles.placements or the daily-focus
// card changes, and every existing account gets this page immediately with no
// migration. A chart takes about 5.5ms (measured, see DATA-SOURCES.md), so
// there's nothing to cache.
//
// Checked exactly as distrustfully as onboarding's own chart: every sign,
// degree and house is validated with the same helpers
// (dig/sign/number/degreeInSign/angle/buildOrigin, exported from
// chart/natal-chart.ts for this), and a placement that doesn't validate is
// left out of the result rather than shown wrong.

import {
  angle,
  buildOrigin,
  dig,
  number,
  type AnglePosition,
  type BirthMoment,
  type Sign,
} from "@/features/onboarding";

// The 10 planets the library calculates (onboarding's own chart stops at
// Saturn; this adds the outer three).
export const FULL_PLANETS = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
] as const;

export type FullPlanetName = (typeof FULL_PLANETS)[number];

// The "going deeper" points: real astrology, a step past the 10 planets.
export const FULL_POINTS = ["northnode", "southnode", "lilith", "chiron"] as const;

export type FullPointName = (typeof FULL_POINTS)[number];

export type FullPosition = {
  sign: Sign;
  degree: number;
  house: number;
  // null for the two lunar nodes: the library never marks them retrograde
  // (they move only one way), so there is nothing to show for them.
  retrograde: boolean | null;
};

// The 5 classic angles, the same set content/moon-aspects.ts already uses —
// kept to these 5 (out of the library's 10) so "Your aspects" stays
// approachable rather than listing every minor angle it can find.
export const ASPECT_NAMES = ["conjunction", "sextile", "square", "trine", "opposition"] as const;

export type AspectName = (typeof ASPECT_NAMES)[number];

// The exact angle each one is named for (0° apart, 60° apart, and so on) —
// what `orb` in FullAspect below is measured as a deviation from. Shown on
// the chart page so an aspect reads as a real, checkable measurement, not
// just a label.
export const ASPECT_ANGLE: Record<AspectName, number> = {
  conjunction: 0,
  sextile: 60,
  square: 90,
  trine: 120,
  opposition: 180,
};

export type FullAspect = {
  a: FullPlanetName;
  b: FullPlanetName;
  aspect: AspectName;
  // How far from exact, in degrees. Smaller is stronger.
  orb: number;
};

export type FullBirthChart = {
  planets: Record<FullPlanetName, FullPosition>;
  points: Record<FullPointName, FullPosition>;
  rising: AnglePosition;
  houseCusps: Record<string, AnglePosition>;
  // Between her 10 planets only (not the going-deeper points or Rising) —
  // tightest orb first.
  aspects: FullAspect[];
};

type Library = typeof import("circular-natal-horoscope-js");

const ASPECT_NAME_SET: readonly string[] = ASPECT_NAMES;

// A planet or point's position, wherever the library keeps it
// (CelestialBodies for the 10 planets and Chiron, CelestialPoints for the
// lunar nodes and Lilith) — same validation as onboarding's own `planet()`,
// plus the retrograde flag when the library provides one.
function position(horoscope: unknown, group: "CelestialBodies" | "CelestialPoints", name: string): FullPosition {
  const body = dig(horoscope, group, name);
  const house = number(dig(body, "House", "id"));
  if (!Number.isInteger(house) || house < 1 || house > 12) {
    throw new Error("Unexpected house in the chart result");
  }
  const retro = dig(body, "isRetrograde");
  return { ...angle(body, "ChartPosition"), house, retrograde: typeof retro === "boolean" ? retro : null };
}

function readAspects(horoscope: unknown): FullAspect[] {
  const all = dig(horoscope, "Aspects", "all");
  if (!Array.isArray(all)) throw new Error("Unexpected aspects in the chart result");

  const planetSet: readonly string[] = FULL_PLANETS;
  const found: FullAspect[] = [];
  for (const entry of all) {
    const a = dig(entry, "point1Key");
    const b = dig(entry, "point2Key");
    const aspectKey = dig(entry, "aspectKey");
    if (typeof a !== "string" || typeof b !== "string") continue;
    if (!planetSet.includes(a) || !planetSet.includes(b)) continue;
    if (typeof aspectKey !== "string" || !ASPECT_NAME_SET.includes(aspectKey)) continue;
    found.push({
      a: a as FullPlanetName,
      b: b as FullPlanetName,
      aspect: aspectKey as AspectName,
      orb: Math.round(number(dig(entry, "orb")) * 100) / 100,
    });
  }
  return found.sort((x, y) => x.orb - y.orb);
}

// Takes the library as an argument so it can be tried out without a browser,
// the same pattern buildChart already uses.
export function buildFullChart(library: Library, birth: BirthMoment): FullBirthChart {
  const { origin } = buildOrigin(library, birth);

  const horoscope = new library.Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    // Only angles between her 10 planets — see FullAspect's comment. Points
    // and angles are left out of aspectWithPoints so the library never
    // bothers computing (and we never accidentally read) an aspect involving
    // them; readAspects filters to the 5 major types on top of this.
    aspectPoints: ["bodies"],
    aspectWithPoints: ["bodies"],
    aspectTypes: ["major"],
    customOrbs: {},
    language: "en",
  });

  const houses = dig(horoscope, "Houses");
  if (!Array.isArray(houses) || houses.length !== 12) {
    throw new Error("Unexpected houses in the chart result");
  }
  const houseCusps: Record<string, AnglePosition> = {};
  houses.forEach((house, index) => {
    houseCusps[String(index + 1)] = angle(house, "ChartPosition", "StartPosition");
  });

  const planets = {} as Record<FullPlanetName, FullPosition>;
  for (const name of FULL_PLANETS) planets[name] = position(horoscope, "CelestialBodies", name);

  const points = {} as Record<FullPointName, FullPosition>;
  for (const name of FULL_POINTS) {
    // Chiron lives under CelestialBodies in the library even though it's
    // grouped with the "going deeper" points here, not the 10 planets.
    points[name] = position(horoscope, name === "chiron" ? "CelestialBodies" : "CelestialPoints", name);
  }

  return {
    planets,
    points,
    rising: angle(dig(horoscope, "Ascendant"), "ChartPosition"),
    houseCusps,
    aspects: readAspects(horoscope),
  };
}

// Loads the library only when this page is opened, then works the full chart
// out. Never saved: see this file's top comment.
export async function calculateFullChart(birth: BirthMoment): Promise<FullBirthChart> {
  const library = await import("circular-natal-horoscope-js");
  return buildFullChart(library, birth);
}

// Sanity-check helper used only by the calculation's own tests: does this
// full chart's Sun/Moon/Rising agree with what onboarding's smaller
// calculation already showed her? They must never disagree — see the plan's
// verification section.
export function bigThreeAgree(
  full: FullBirthChart,
  small: { sun: { sign: Sign }; moon: { sign: Sign }; rising: { sign: Sign } },
): boolean {
  return (
    full.planets.sun.sign === small.sun.sign &&
    full.planets.moon.sign === small.moon.sign &&
    full.rising.sign === small.rising.sign
  );
}
