// Saving what she told us in onboarding, and her chart, to her profile in the
// database.

import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import type { Answers } from "./answers-store";
import { parseBirthTime } from "../validation/birth-time";
import { formatPlace } from "../places/places";

const two = (value: number | string) => String(value).padStart(2, "0");

// True when everything was saved. Nothing about her answers is ever logged.
export async function saveOnboarding(answers: Answers): Promise<boolean> {
  const userId = getSession().userId;
  const { place, chart } = answers;
  if (!userId || !place || !chart) return false;

  // She may have chosen "I don't know" instead of typing a time — never a
  // time that was typed and happens to be unparseable, since Continue is
  // disabled on the birth time screen until one or the other is true.
  const time = answers.birthTimeUnknown ? null : parseBirthTime(answers.birthTime);

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
      // The zone and offset the chart was actually worked out with, so the
      // record can never disagree with the chart. Only known when the chart
      // is a full one — a reduced chart has no single confirmed moment to
      // have worked a zone or offset out from.
      birth_timezone_name: chart.kind === "full" ? chart.timeZone : null,
      birth_utc_offset_minutes: chart.kind === "full" ? chart.utcOffsetMinutes : null,
      placements: chart,
      onboarding_completed_at: new Date().toISOString(),
    });
    return !error;
  } catch {
    return false;
  }
}
