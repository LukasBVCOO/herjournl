// Talking to the database about cards and her chart. Runs on her phone. The
// database only ever returns her own rows, so nothing here filters by owner.
//
// Every call answers "ok" with what it found, or "not ok" with a plain reason:
//   offline  no internet (or the phone says so). Nothing is wrong; try again later
//   failed   the database answered with something we did not expect
// Nothing here logs what came back.

import { readSavedNatalChart, type Chart, type ReducedChart } from "@/features/onboarding";
import { supabase } from "@/lib/supabase/client";
import { CARD_COLUMNS, cardFromRow, rowFromCard } from "./card-row";
import type { DailyFocusCard } from "./types";

export type Found<T> = { ok: true; value: T } | { ok: false; reason: "offline" | "failed" };

const offline = () => typeof navigator !== "undefined" && navigator.onLine === false;

// A status of 0 means the request never got an answer, which is what no internet
// looks like.
function why(status: number | undefined): "offline" | "failed" {
  return status === 0 || offline() ? "offline" : "failed";
}

// Today's card, or null when none has been made yet.
export async function findCard(localDate: string): Promise<Found<DailyFocusCard | null>> {
  try {
    const { data, error, status } = await supabase
      .from("daily_focus_cards")
      .select(CARD_COLUMNS)
      .eq("local_date", localDate)
      .maybeSingle();
    if (error) return { ok: false, reason: why(status) };
    if (!data) return { ok: true, value: null };
    const card = cardFromRow(data);
    // A saved card that is not whole is never shown, and never guessed at.
    return card ? { ok: true, value: card } : { ok: false, reason: "failed" };
  } catch {
    return { ok: false, reason: why(undefined) };
  }
}

// "saved" when it was added, "exists" when a card for that day was already there
// (another phone got there first). Cards are never replaced.
export async function saveCard(card: DailyFocusCard): Promise<Found<"saved" | "exists">> {
  try {
    const { error, status } = await supabase.from("daily_focus_cards").insert(rowFromCard(card));
    if (!error) return { ok: true, value: "saved" };
    // 23505 is the database saying "one card per day, and there is one".
    if (error.code === "23505") return { ok: true, value: "exists" };
    return { ok: false, reason: why(status) };
  } catch {
    return { ok: false, reason: why(undefined) };
  }
}

// Records that she has opened (or answered) a day's card. Forward only: the
// database itself refuses to turn either back to "no". Done also means opened.
async function mark(
  localDate: string,
  fields: { opened: true } | { opened: true; done: true },
): Promise<Found<"marked">> {
  try {
    const { error, status } = await supabase
      .from("daily_focus_cards")
      .update(fields)
      .eq("local_date", localDate);
    return error ? { ok: false, reason: why(status) } : { ok: true, value: "marked" };
  } catch {
    return { ok: false, reason: why(undefined) };
  }
}

export const markOpened = (localDate: string) => mark(localDate, { opened: true });
export const markDone = (localDate: string) => mark(localDate, { opened: true, done: true });

export type SavedChart = {
  // null when she has no chart saved, or the saved one is not usable. A full
  // chart (chart.kind === "full") or a reduced one (chart.kind === "reduced",
  // saved when she doesn't know her birth time) — see readSavedNatalChart.
  chart: Chart | ReducedChart | null;
  birthTimeKnown: boolean;
  // True once she has finished onboarding.
  onboarded: boolean;
};

// Her saved birth chart (whichever kind she has) and whether her birth time is
// a real one. null when she has no profile at all.
export async function findChart(userId: string): Promise<Found<SavedChart | null>> {
  try {
    const { data, error, status } = await supabase
      .from("profiles")
      .select("placements, birth_time_known, onboarding_completed_at")
      .eq("id", userId)
      .maybeSingle();
    if (error) return { ok: false, reason: why(status) };
    if (!data) return { ok: true, value: null };
    return {
      ok: true,
      value: {
        chart: readSavedNatalChart(data.placements),
        birthTimeKnown: data.birth_time_known === true,
        onboarded: typeof data.onboarding_completed_at === "string",
      },
    };
  } catch {
    return { ok: false, reason: why(undefined) };
  }
}
