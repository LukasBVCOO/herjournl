// Talking to the database about affirmations. Runs on her phone. The
// database only ever returns her own 369 days, so nothing here filters by
// owner. Nothing here logs what came back.

import { supabase } from "@/lib/supabase/client";
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
  pinned: boolean;
};

export type Found<T> = { ok: true; value: T } | { ok: false; offline: boolean };

const TYPE_ORDER: Record<AffirmationType, number> = { theme: 0, goal: 1, belief: 2 };

const DAY_COLUMNS =
  "date, pinned, morning_count, afternoon_count, evening_count, morning_at, afternoon_at, evening_at, affirmation:affirmations(id, house, text, type)";

const failed = <T>(): Found<T> => ({
  ok: false,
  offline: typeof navigator !== "undefined" && navigator.onLine === false,
});

function affirmationFrom(value: unknown): Affirmation | null {
  const v = value as Record<string, unknown> | null;
  if (!v || typeof v.id !== "number" || typeof v.text !== "string") return null;
  if (v.type !== "theme" && v.type !== "goal" && v.type !== "belief") return null;
  return { id: v.id, house: Number(v.house), text: v.text, type: v.type };
}

function dayFrom(row: Record<string, unknown>): Day369 | null {
  const affirmation = affirmationFrom(row.affirmation);
  if (!affirmation || typeof row.date !== "string") return null;
  const counts = {} as Counts;
  const doneAt = {} as DoneAt;
  for (const session of SESSIONS) {
    counts[session] = Number(row[`${session}_count`] ?? 0);
    const at = row[`${session}_at`];
    doneAt[session] = typeof at === "string" ? at : null;
  }
  return { date: row.date, affirmation, counts, doneAt, pinned: row.pinned === true };
}

// The three lines for a house, in the order theme, goal, belief.
export async function fetchLines(house: number): Promise<Found<Affirmation[]>> {
  try {
    const { data, error } = await supabase
      .from("affirmations")
      .select("id, house, text, type")
      .eq("house", house);
    if (error || !data) return failed();
    const lines = data.map(affirmationFrom).filter((line): line is Affirmation => line !== null);
    lines.sort((a, b) => TYPE_ORDER[a.type] - TYPE_ORDER[b.type]);
    return { ok: true, value: lines };
  } catch {
    return failed();
  }
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

// Starts a day on a line. "exists" when another phone started it first.
export async function startDay(
  date: string,
  affirmationId: number,
  pinned: boolean,
): Promise<Found<"saved" | "exists">> {
  try {
    const { error } = await supabase
      .from("daily_369")
      .insert({ date, affirmation_id: affirmationId, pinned });
    if (!error) return { ok: true, value: "saved" };
    if (error.code === "23505") return { ok: true, value: "exists" };
    return failed();
  } catch {
    return failed();
  }
}

// Saves where the day stands. Counts are sent whole (not "+1"), and the
// database only ever lets them go up, so resending after a failed save is
// always safe.
export async function saveDay(day: Day369, changeLine = false): Promise<boolean> {
  const fields: Record<string, unknown> = { pinned: day.pinned };
  if (changeLine) fields.affirmation_id = day.affirmation.id;
  for (const session of SESSIONS as readonly Session[]) {
    fields[`${session}_count`] = day.counts[session];
    if (day.doneAt[session]) fields[`${session}_at`] = day.doneAt[session];
  }
  try {
    const { error } = await supabase.from("daily_369").update(fields).eq("date", day.date);
    return !error;
  } catch {
    return false;
  }
}
