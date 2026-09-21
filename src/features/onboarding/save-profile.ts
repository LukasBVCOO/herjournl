// Saving what she told us in onboarding to her profile in the database.
//
// Only what she typed and chose is saved. The chart itself is NOT saved yet:
// today's chart is a placeholder, and putting made-up placements in her profile
// would risk them being treated as real later. It is saved once the real chart
// service exists.

import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import type { Answers } from "./answers-store";
import { utcOffsetAtBirth } from "./birth-offset";
import { parseBirthTime } from "./birth-time";
import { formatPlace, type Place } from "./places";

const two = (value: number | string) => String(value).padStart(2, "0");

// The clock offset in her birthplace on her birthday, in minutes, or null when
// it can't be worked out (which never blocks saving). If she doesn't know her
// birth time, midday stands in: the offset only changes on a few days a year, so
// it is almost always right, and the chart won't claim to be exact without a time.
//
// Worked out here for now. The server should work it out again itself when it
// makes the chart, rather than trusting this number, because the chart is not
// something the phone gets to decide.
function birthOffsetMinutes(answers: Answers, place: Place) {
  try {
    const time = parseBirthTime(answers.birthTime) ?? { hour: 12, minute: 0 };
    return utcOffsetAtBirth(
      place.timezone,
      Number(answers.year),
      Number(answers.month),
      Number(answers.day),
      time.hour,
      time.minute,
    ).minutes;
  } catch {
    return null;
  }
}

// True when everything was saved. Nothing about her answers is ever logged.
export async function saveOnboarding(answers: Answers): Promise<boolean> {
  const userId = getSession().userId;
  const { place } = answers;
  if (!userId || !place) return false;

  const time = parseBirthTime(answers.birthTime);

  try {
    // One row per person, so saving again (trying onboarding a second time)
    // replaces the first answers instead of adding another.
    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      name: answers.name.replace(/\s+/g, " ").trim(),
      date_of_birth: `${answers.year}-${two(answers.month)}-${two(answers.day)}`,
      birth_time: time ? `${two(time.hour)}:${two(time.minute)}:00` : null,
      birth_time_known: time !== null,
      birth_place: formatPlace(place),
      birth_city: place.city,
      birth_country: place.country,
      birth_latitude: place.latitude,
      birth_longitude: place.longitude,
      birth_timezone_name: place.timezone,
      birth_utc_offset_minutes: birthOffsetMinutes(answers, place),
      onboarding_completed_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}
