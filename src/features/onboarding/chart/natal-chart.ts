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
  kind: "full";
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

// Her birth date and place, without a time.
export type BirthDay = {
  year: number;
  month: number;
  day: number;
  latitude: number;
  longitude: number;
};

// A planet's sign and degree worked out without a birth time, and whether that
// placement is trustworthy: the same for every minute of her birth day, from
// midnight to one minute before the next. If it isn't (the planet changed sign
// somewhere in the day), `reliable` is false and nothing about this reading is
// ever shown to her or used to generate a card — see calculateReducedChart.
export type PlanetReading = { sign: Sign; degree: number; reliable: boolean };

// What is saved in her profile when she doesn't know her birth time. No
// `rising` and no house cusps: those need an exact time to mean anything, so
// they are never calculated, never stored and never guessed at here.
export type ReducedChart = {
  kind: "reduced";
  sun: PlanetReading;
  moon: PlanetReading;
  mercury: PlanetReading;
  venus: PlanetReading;
  mars: PlanetReading;
  jupiter: PlanetReading;
  saturn: PlanetReading;
};

export type NatalChart = Chart | ReducedChart;

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
    kind: "full",
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

// Without an exact birth time, a planet's true position could be anywhere the
// library would place it between midnight and one minute before midnight on
// her birth day. Rather than guess a time, this works out both ends of that
// window and only trusts a planet's placement when both ends agree.
const PLANET_NAMES = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
] as const;

export function buildReducedChart(library: Library, birth: BirthDay): ReducedChart {
  const startOfDay = buildChart(library, { ...birth, hour: 0, minute: 0 });
  const endOfDay = buildChart(library, { ...birth, hour: 23, minute: 59 });

  const readings = {} as Omit<ReducedChart, "kind">;
  for (const name of PLANET_NAMES) {
    const start = startOfDay[name];
    const end = endOfDay[name];
    const reliable = start.sign === end.sign;
    readings[name] = {
      sign: start.sign,
      // Only meaningful when reliable (same sign both ends, so the two
      // numbers are directly comparable); halfway between them is a steadier
      // estimate than either end alone. When not reliable this number is
      // never shown or used — only `reliable` is checked before that happens.
      degree: reliable ? Math.round(((start.degree + end.degree) / 2) * 100) / 100 : start.degree,
      reliable,
    };
  }
  return { kind: "reduced", ...readings };
}

// Loads the library only when a chart is being made, then works out which of
// her planets can be trusted without an exact birth time.
export async function calculateReducedChart(birth: BirthDay): Promise<ReducedChart> {
  const library = await import("circular-natal-horoscope-js");
  return buildReducedChart(library, birth);
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
      kind: "full",
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

// Reads a reduced chart (saved when she didn't know her birth time) back from
// profiles.placements. null if it isn't a complete, well-formed reduced chart.
export function readSavedReducedChart(saved: unknown): ReducedChart | null {
  try {
    if (dig(saved, "kind") !== "reduced") return null;

    const readingAt = (key: string): PlanetReading => {
      const entry = dig(saved, key);
      const reliable = dig(entry, "reliable");
      if (typeof reliable !== "boolean") throw new Error("Unexpected reliability in the saved chart");
      return { sign: sign(dig(entry, "sign")), degree: number(dig(entry, "degree")), reliable };
    };

    const readings = {} as Omit<ReducedChart, "kind">;
    for (const name of PLANET_NAMES) readings[name] = readingAt(name);
    return { kind: "reduced", ...readings };
  } catch {
    return null;
  }
}

// Reads back whichever kind of chart is saved — a full one, or a reduced one
// from before she knew her birth time. null if it's neither (for example a
// profile saved before charts were kept at all).
export function readSavedNatalChart(saved: unknown): NatalChart | null {
  return readSavedChart(saved) ?? readSavedReducedChart(saved);
}
