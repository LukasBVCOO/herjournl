// Talking to the database about her 369 days. Runs on her phone. The
// database only ever returns her own days, so nothing here filters by owner.
// Nothing here logs what came back. The lines themselves live in the app
// (content/lines.ts); a saved day only holds its line's id.

import { supabase } from "@/lib/supabase/client";
import { lineById } from "./content/lines";
import { SESSIONS, type Counts, type DoneAt, type Session } from "./sessions";

export type AffirmationType = "theme" | "goal" | "belief";

export type Affirmation = {
  id: number;
  // 1-12, or 0 for the general lines used when there's no house (no birth time).
  house: number;
  text: string;
  type: AffirmationType;
};

export type Day369 = {
  date: string;
  affirmation: Affirmation;
  counts: Counts;
  doneAt: DoneAt;
};

export type Found<T> = { ok: true; value: T } | { ok: false; offline: boolean };

const DAY_COLUMNS =
  "date, affirmation_id, morning_count, afternoon_count, evening_count, morning_at, afternoon_at, evening_at";

const failed = <T>(): Found<T> => ({
  ok: false,
  offline: typeof navigator !== "undefined" && navigator.onLine === false,
});

function dayFrom(row: Record<string, unknown>): Day369 | null {
  const affirmation = typeof row.affirmation_id === "number" ? lineById(row.affirmation_id) : null;
  if (!affirmation || typeof row.date !== "string") return null;
  const counts = {} as Counts;
  const doneAt = {} as DoneAt;
  for (const session of SESSIONS) {
    counts[session] = Number(row[`${session}_count`] ?? 0);
    const at = row[`${session}_at`];
    doneAt[session] = typeof at === "string" ? at : null;
  }
  return { date: row.date, affirmation, counts, doneAt };
}

// Her 369 day for a card day, or null when she hasn't started one.
export async function fetchDay(date: string): Promise<Found<Day369 | null>> {
  try {
    const { data, error } = await supabase
      .from("daily_369")
      .select(DAY_COLUMNS)
      .eq("date", date)
      .maybeSingle();
    if (error) return failed();
    return { ok: true, value: data ? dayFrom(data as Record<string, unknown>) : null };
  } catch {
    return failed();
  }
}

// The most recent day before `date` — what today's line carries on from.
export async function fetchLatestBefore(date: string): Promise<Found<Day369 | null>> {
  try {
    const { data, error } = await supabase
      .from("daily_369")
      .select(DAY_COLUMNS)
      .lt("date", date)
      .order("date", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error) return failed();
    return { ok: true, value: data ? dayFrom(data as Record<string, unknown>) : null };
  } catch {
    return failed();
  }
}

// Her recent days with their lines, newest first — for the streak and the
// list of past affirmations.
export async function fetchHistory(): Promise<Found<Day369[]>> {
  try {
    const { data, error } = await supabase
      .from("daily_369")
      .select(DAY_COLUMNS)
      .order("date", { ascending: false })
      .limit(120);
    if (error || !data) return failed();
    return {
      ok: true,
      value: (data as Record<string, unknown>[])
        .map(dayFrom)
        .filter((day): day is Day369 => day !== null),
    };
  } catch {
    return failed();
  }
}

// Her days from `from` to `to` (card days, both included), oldest first —
// for the weekly recap.
export async function fetchDaysBetween(from: string, to: string): Promise<Found<Day369[]>> {
  try {
    const { data, error } = await supabase
      .from("daily_369")
      .select(DAY_COLUMNS)
      .gte("date", from)
      .lte("date", to)
      .order("date", { ascending: true });
    if (error || !data) return failed();
    return {
      ok: true,
      value: (data as Record<string, unknown>[])
        .map(dayFrom)
        .filter((day): day is Day369 => day !== null),
    };
  } catch {
    return failed();
  }
}

// Starts a day on a line. "exists" when another phone started it first.
// (The table's old "pinned" column is no longer used: nothing carries over
// by itself any more — she chooses each day, yesterday's line included.)
export async function startDay(date: string, affirmationId: number): Promise<Found<"saved" | "exists">> {
  try {
    const { error } = await supabase.from("daily_369").insert({ date, affirmation_id: affirmationId });
    if (!error) return { ok: true, value: "saved" };
    if (error.code === "23505") return { ok: true, value: "exists" };
    return failed();
  } catch {
    return failed();
  }
}

// Saves where the day stands. Counts are sent whole (not "+1"), and the
// database only ever lets them go up for the same line, so resending after a
// failed save is always safe. A line change (`changeLine`) sends the new line
// with counts of 0 and no finished times: the database takes that as a fresh
// start on the new line (see the daily_369_change_line migration).
export async function saveDay(day: Day369, changeLine = false): Promise<boolean> {
  const fields: Record<string, unknown> = { affirmation_id: day.affirmation.id };
  for (const session of SESSIONS as readonly Session[]) {
    fields[`${session}_count`] = day.counts[session];
    if (changeLine || day.doneAt[session]) fields[`${session}_at`] = day.doneAt[session];
  }
  try {
    const { error } = await supabase.from("daily_369").update(fields).eq("date", day.date);
    return !error;
  } catch {
    return false;
  }
}
