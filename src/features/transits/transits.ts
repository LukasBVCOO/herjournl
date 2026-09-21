// Where the planets are at a given moment. No screens, no storage, no outside
// service: like her birth chart, it is worked out by the
// circular-natal-horoscope-js library. A "chart for now" is just a chart for the
// current moment, and its planets are the day's transits.
//
// The positions are the same wherever on Earth you ask from (checked), so one
// calculation serves every user. Nothing the library returns is trusted as it
// comes: every value is checked, and anything unexpected throws.

import { SIGNS, type Sign } from "@/features/onboarding";

export const TRANSIT_PLANETS = [
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

export type TransitPlanet = (typeof TRANSIT_PLANETS)[number];

export type TransitPosition = {
  sign: Sign;
  // How far into the sign, 0 to 30.
  degree: number;
  // Where it is around the whole circle, 0 to 360, starting at 0 degrees Aries.
  longitude: number;
  retrograde: boolean;
};

export type Transits = {
  // The moment these are for, as an ISO time in UTC, to the minute.
  at: string;
  planets: Record<TransitPlanet, TransitPosition>;
};

type Library = typeof import("circular-natal-horoscope-js");

// The library wants a place and a local time. Asking from Reykjavik, which keeps
// UTC all year, lets the exact moment be passed in as its "local" time with
// nothing for a time zone to change. The place does not affect where the planets
// are.
const UTC_PLACE = { latitude: 64.13548, longitude: -21.89541 };

// --- Reading the library's results safely -----------------------------------

function dig(value: unknown, ...path: (string | number)[]): unknown {
  let current = value;
  for (const key of path) {
    if (typeof current !== "object" || current === null) return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

function sign(value: unknown): Sign {
  if (typeof value === "string" && (SIGNS as readonly string[]).includes(value)) {
    return value as Sign;
  }
  throw new Error("Unexpected sign in the transit result");
}

function number(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw new Error("Unexpected number in the transit result");
}

const round = (value: number, places: number) => {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
};

function position(horoscope: unknown, planet: TransitPlanet): TransitPosition {
  const body = dig(horoscope, "CelestialBodies", planet);
  const longitude = number(dig(body, "ChartPosition", "Ecliptic", "DecimalDegrees"));
  if (longitude < 0 || longitude >= 360) {
    throw new Error("Position outside the circle in the transit result");
  }

  const label = sign(dig(body, "Sign", "label"));
  // The sign it names and the position it gives must agree.
  if (SIGNS.indexOf(label) !== Math.floor(longitude / 30)) {
    throw new Error("Sign and position disagree in the transit result");
  }

  // The Sun and Moon never turn retrograde, and the library leaves their flag
  // empty instead of saying false. Every other planet must say which it is.
  const flag = dig(body, "isRetrograde");
  let retrograde: boolean;
  if (planet === "sun" || planet === "moon") {
    if (flag !== undefined && flag !== false) {
      throw new Error("Unexpected retrograde flag in the transit result");
    }
    retrograde = false;
  } else if (typeof flag === "boolean") {
    retrograde = flag;
  } else {
    throw new Error("Unexpected retrograde flag in the transit result");
  }

  return {
    sign: label,
    degree: round(longitude % 30, 2),
    longitude: round(longitude, 4),
    retrograde,
  };
}

// --- The calculation ---------------------------------------------------------

// Takes the library as an argument so it can be tried out without a browser.
export function buildTransits(library: Library, at: Date): Transits {
  if (Number.isNaN(at.getTime())) throw new Error("Not a real moment in time");

  // To the minute, which is as fine as the library goes.
  const minute = Date.UTC(
    at.getUTCFullYear(),
    at.getUTCMonth(),
    at.getUTCDate(),
    at.getUTCHours(),
    at.getUTCMinutes(),
  );

  const origin = new library.Origin({
    year: at.getUTCFullYear(),
    month: at.getUTCMonth(), // the library counts January as 0, as JavaScript does
    date: at.getUTCDate(),
    hour: at.getUTCHours(),
    minute: at.getUTCMinutes(),
    ...UTC_PLACE,
  });

  // It must have worked from the moment we asked about, not a shifted one.
  const utc = dig(origin, "utcTime");
  const usedMs = number(typeof utc === "object" && utc !== null ? utc.valueOf() : utc);
  if (usedMs !== minute) {
    throw new Error("The library worked from a different moment than asked for");
  }

  const horoscope = new library.Horoscope({
    origin,
    houseSystem: "placidus",
    zodiac: "tropical",
    aspectPoints: [],
    aspectWithPoints: [],
    aspectTypes: [],
    customOrbs: {},
    language: "en",
  });

  const planets = Object.fromEntries(
    TRANSIT_PLANETS.map((planet) => [planet, position(horoscope, planet)]),
  ) as Record<TransitPlanet, TransitPosition>;

  return { at: new Date(minute).toISOString(), planets };
}

// Loads the library only when needed, then works out where the planets are.
// With no moment given, that is right now.
export async function calculateTransits(at: Date = new Date()): Promise<Transits> {
  const library = await import("circular-natal-horoscope-js");
  return buildTransits(library, at);
}
