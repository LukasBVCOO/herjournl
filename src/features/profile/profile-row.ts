// Turning her profile into database columns and back. Pure: no database, no
// screens, so it can be checked on its own.
import {
  formatPlace,
  parseBirthTime,
  readSavedNatalChart,
  type Chart,
  type ReducedChart,
  type Place,
} from "@/features/onboarding";

export const NAME_MAX_LENGTH = 60;

// Extra spaces at the ends or in the middle are tidied away; letters of any
// language, accents included, are left exactly as she typed them.
export function tidyName(name: string) {
  return name.replace(/\s+/g, " ").trim();
}

const two = (value: number) => String(value).padStart(2, "0");

export type Profile = {
  name: string | null;
  // "2000-07-18"
  dateOfBirth: string | null;
  // "16:00"
  birthTime: string | null;
  // The birthplace as she saw it when she chose it, e.g. "Paris, Texas, United States".
  birthPlace: string | null;
  // The birthplace rebuilt from what was saved, so a chart can be worked out
  // again without her searching for the place a second time.
  place: Place | null;
  // A full chart (a real birth time) or a reduced one (see readSavedNatalChart).
  chart: Chart | ReducedChart | null;
  // False once she has told us she doesn't know her birth time (rather than
  // simply never having finished onboarding — see profile-screen.tsx).
  birthTimeKnown: boolean;
};

// The columns of her profile that this screen reads.
export type ProfileRow = {
  name: string | null;
  date_of_birth: string | null;
  birth_time: string | null;
  birth_time_known: boolean;
  birth_place: string | null;
  birth_city: string | null;
  birth_country: string | null;
  birth_latitude: number | null;
  birth_longitude: number | null;
  birth_timezone_name: string | null;
  placements: unknown;
};

export const PROFILE_COLUMNS =
  "name, date_of_birth, birth_time, birth_time_known, birth_place, birth_city, birth_country, birth_latitude, birth_longitude, birth_timezone_name, placements";

export function profileFromRow(row: ProfileRow): Profile {
  const place: Place | null =
    row.birth_city !== null &&
    row.birth_country !== null &&
    row.birth_latitude !== null &&
    row.birth_longitude !== null
      ? {
          id: "saved",
          city: row.birth_city,
          country: row.birth_country,
          latitude: row.birth_latitude,
          longitude: row.birth_longitude,
          timezone: row.birth_timezone_name ?? "",
        }
      : null;

  return {
    name: row.name,
    dateOfBirth: row.date_of_birth,
    // The database keeps seconds ("16:00:00"); only hour and minute matter.
    birthTime: row.birth_time ? row.birth_time.slice(0, 5) : null,
    birthPlace: row.birth_place,
    place,
    chart: readSavedNatalChart(row.placements),
    birthTimeKnown: row.birth_time_known,
  };
}

// Only the things being changed. Anything left out is left as it was.
export type ProfileChanges = {
  name?: string;
  // "2000-07-18"
  dateOfBirth?: string;
  // "16:00", or "" for "I don't know my birth time".
  birthTime?: string;
  place?: Place;
  chart?: Chart | ReducedChart;
};

// The row to write. It holds only the columns that are changing, so saving one
// thing never disturbs another (in particular, when she finished onboarding).
export function rowFromChanges(userId: string, changes: ProfileChanges) {
  const row: Record<string, unknown> = { id: userId };

  if (changes.name !== undefined) row.name = tidyName(changes.name);
  if (changes.dateOfBirth !== undefined) row.date_of_birth = changes.dateOfBirth;

  if (changes.birthTime !== undefined) {
    const time = parseBirthTime(changes.birthTime);
    row.birth_time = time ? `${two(time.hour)}:${two(time.minute)}:00` : null;
    row.birth_time_known = time !== null;
  }

  if (changes.place) {
    row.birth_place = formatPlace(changes.place);
    row.birth_city = changes.place.city;
    row.birth_country = changes.place.country;
    row.birth_latitude = changes.place.latitude;
    row.birth_longitude = changes.place.longitude;
  }

  if (changes.chart) {
    // The zone and offset the chart was actually worked out with, so the
    // record can never disagree with the chart. A reduced chart (no birth
    // time) has no single confirmed moment to have worked either out from.
    row.birth_timezone_name = changes.chart.kind === "full" ? changes.chart.timeZone : null;
    row.birth_utc_offset_minutes = changes.chart.kind === "full" ? changes.chart.utcOffsetMinutes : null;
    row.placements = changes.chart;
  }

  return row;
}
