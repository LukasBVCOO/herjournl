// Working out her birth chart. No screens, no storage, no outside service: the
// calculation is done by the circular-natal-horoscope-js library, which is in
// the public domain.
//
// The library also works out the time zone of the birthplace from its
// coordinates and the clock offset that applied on her birthday (summer time
// and old rule changes included). This records the zone and offset it actually
// used, so what is saved always matches the chart it produced.
//
// Nothing the library returns is trusted as it comes: every value is checked,
// and anything unexpected throws, which the "Mapping your chart" screen shows as
// "We couldn't create your chart just yet".

export const SIGNS = [
  "Aries",
  "Taurus",
  "Gemini",
  "Cancer",
  "Leo",
  "Virgo",
  "Libra",
  "Scorpio",
  "Sagittarius",
  "Capricorn",
  "Aquarius",
  "Pisces",
] as const;

export type Sign = (typeof SIGNS)[number];

// A planet: its sign, how far into that sign (0 to 30 degrees), and which of
// the 12 houses it sits in.
export type PlanetPosition = { sign: Sign; degree: number; house: number };

// A point on the chart that has a sign and degree but no house of its own.
export type AnglePosition = { sign: Sign; degree: number };

// What is saved in her profile.
export type Chart = {
  houseSystem: "placidus";
  // The time zone and clock offset (in minutes ahead of UTC) that the
  // calculation used for the birthplace on her birthday.
  timeZone: string;
  utcOffsetMinutes: number;
  sun: PlanetPosition;
  moon: PlanetPosition;
  mercury: PlanetPosition;
  venus: PlanetPosition;
  mars: PlanetPosition;
  jupiter: PlanetPosition;
  saturn: PlanetPosition;
  rising: AnglePosition;
  // The start of each house, keyed "1" to "12".
  houseCusps: Record<string, AnglePosition>;
};

// Her birth as it is on the certificate: local time at the birthplace.
export type BirthMoment = {
  year: number;
  month: number; // 1 = January ... 12 = December
  day: number;
  hour: number; // 0 to 23
  minute: number;
  latitude: number;
  longitude: number;
};

type Library = typeof import("circular-natal-horoscope-js");

type PlanetName = "sun" | "moon" | "mercury" | "venus" | "mars" | "jupiter" | "saturn";

// --- Reading the library's results safely -----------------------------------

// Follows a path into something of unknown shape, giving back undefined if any
// step is missing.
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
  throw new Error("Unexpected sign in the chart result");
}

function number(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  throw new Error("Unexpected number in the chart result");
}

// The library gives a position along the whole 360 degree circle; a sign is 30
// of those, so this is how far into its sign the position is.
function degreeInSign(circleDegrees: unknown) {
  return Math.round((number(circleDegrees) % 30) * 100) / 100;
}

function angle(entry: unknown, ...positionPath: string[]): AnglePosition {
  return {
    sign: sign(dig(entry, "Sign", "label")),
    degree: degreeInSign(dig(entry, ...positionPath, "Ecliptic", "DecimalDegrees")),
  };
}

function planet(horoscope: unknown, name: PlanetName): PlanetPosition {
  const body = dig(horoscope, "CelestialBodies", name);
  const house = number(dig(body, "House", "id"));
  if (!Number.isInteger(house) || house < 1 || house > 12) {
    throw new Error("Unexpected house in the chart result");
  }
  return { ...angle(body, "ChartPosition"), house };
}

// --- The calculation ---------------------------------------------------------

// Takes the library as an argument so it can be tried out without a browser.
export function buildChart(library: Library, birth: BirthMoment): Chart {
  const origin = new library.Origin({
    year: birth.year,
    month: birth.month - 1, // the library counts January as 0
    date: birth.day,
    hour: birth.hour,
    minute: birth.minute,
    latitude: birth.latitude,
    longitude: birth.longitude,
  });

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

  // The zone it found, and the offset between her clock and world time.
  const timeZone = dig(origin, "timezone", "name");
  if (typeof timeZone !== "string" || timeZone === "") {
    throw new Error("No time zone in the chart result");
  }
  const utc = dig(origin, "utcTime");
  const utcMs = number(typeof utc === "object" && utc !== null ? utc.valueOf() : utc);
  const wallClockMs = Date.UTC(
    birth.year,
    birth.month - 1,
    birth.day,
    birth.hour,
    birth.minute,
  );
  const utcOffsetMinutes = Math.round((wallClockMs - utcMs) / 60000);

  const houses = dig(horoscope, "Houses");
  if (!Array.isArray(houses) || houses.length !== 12) {
    throw new Error("Unexpected houses in the chart result");
  }
  const houseCusps: Record<string, AnglePosition> = {};
  houses.forEach((house, index) => {
    houseCusps[String(index + 1)] = angle(house, "ChartPosition", "StartPosition");
  });

  return {
    houseSystem: "placidus",
    timeZone,
    utcOffsetMinutes,
    sun: planet(horoscope, "sun"),
    moon: planet(horoscope, "moon"),
    mercury: planet(horoscope, "mercury"),
    venus: planet(horoscope, "venus"),
    mars: planet(horoscope, "mars"),
    jupiter: planet(horoscope, "jupiter"),
    saturn: planet(horoscope, "saturn"),
    rising: angle(dig(horoscope, "Ascendant"), "ChartPosition"),
    houseCusps,
  };
}

// Loads the library only when a chart is being made, so it doesn't weigh down
// the rest of the app, then works the chart out.
export async function calculateChart(birth: BirthMoment): Promise<Chart> {
  const library = await import("circular-natal-horoscope-js");
  return buildChart(library, birth);
}

// Reads a chart back from what was saved in her profile (profiles.placements).
// null if it isn't a complete, well-formed chart, for example a profile saved
// before charts were kept. Checked the same way a fresh calculation is, because
// a saved copy is only as trustworthy as whatever last wrote it.
export function readSavedChart(saved: unknown): Chart | null {
  try {
    const planetAt = (key: string): PlanetPosition => {
      const entry = dig(saved, key);
      const house = number(dig(entry, "house"));
      if (!Number.isInteger(house) || house < 1 || house > 12) {
        throw new Error("Unexpected house in the saved chart");
      }
      return {
        sign: sign(dig(entry, "sign")),
        degree: number(dig(entry, "degree")),
        house,
      };
    };
    const angleAt = (entry: unknown): AnglePosition => ({
      sign: sign(dig(entry, "sign")),
      degree: number(dig(entry, "degree")),
    });

    if (dig(saved, "houseSystem") !== "placidus") return null;
    const timeZone = dig(saved, "timeZone");
    if (typeof timeZone !== "string" || timeZone === "") return null;

    const houseCusps: Record<string, AnglePosition> = {};
    for (let house = 1; house <= 12; house++) {
      houseCusps[String(house)] = angleAt(dig(saved, "houseCusps", String(house)));
    }

    return {
      houseSystem: "placidus",
      timeZone,
      utcOffsetMinutes: number(dig(saved, "utcOffsetMinutes")),
      sun: planetAt("sun"),
      moon: planetAt("moon"),
      mercury: planetAt("mercury"),
      venus: planetAt("venus"),
      mars: planetAt("mars"),
      jupiter: planetAt("jupiter"),
      saturn: planetAt("saturn"),
      rising: angleAt(dig(saved, "rising")),
      houseCusps,
    };
  } catch {
    return null;
  }
}
