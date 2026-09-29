import { useEffect, useState } from "react";
import { fetchDaysBetween, type Day369 } from "@/features/affirmations";
import { focusEntriesBetween, useNotes, type FocusEntry } from "@/features/notes";
import { addDays, weekDays } from "./week";

// One day of her week: the note she wrote from that day's card (its house,
// her answers and her evening reflection), and the affirmation she said.
// Either can be missing.
export type RecapDay = {
  date: string;
  entry: FocusEntry | null;
  affirmation: Day369 | null;
};

// The house a day was about: from her note's card, or failing that from the
// line she said (affirmations follow the day's house too). Null when neither
// knows (a reduced-mode day, with no birth time).
export function houseOf(day: RecapDay): number | null {
  return day.entry?.card.house ?? (day.affirmation?.affirmation.house || null);
}

// Whether she said her line at least once that day.
export function saidAny(day: RecapDay): boolean {
  const counts = day.affirmation?.counts;
  return Boolean(counts && counts.morning + counts.afternoon + counts.evening > 0);
}

export function hasAnything(day: RecapDay): boolean {
  return day.entry !== null || saidAny(day);
}

export type WeekState = {
  // False until her notes have been read from the phone.
  ready: boolean;
  days: RecapDay[];
  // Her affirmations come from the database, so they can fail offline. Her
  // notes never do: they're already on the phone.
  affirmations: "loading" | "ready" | "offline" | "failed";
};

// The week starting on `monday`, up to `lastDay` (today, for this week: days
// that haven't happened yet aren't shown).
export function useWeek(monday: string, lastDay: string): WeekState {
  const notes = useNotes();
  const sunday = addDays(monday, 6);
  const [loaded, setLoaded] = useState<{
    monday: string;
    status: "ready" | "offline" | "failed";
    days: Day369[];
  } | null>(null);

  useEffect(() => {
    let current = true;
    void fetchDaysBetween(monday, sunday).then((found) => {
      if (!current) return;
      setLoaded(
        found.ok
          ? { monday, status: "ready", days: found.value }
          : { monday, status: found.offline ? "offline" : "failed", days: [] },
      );
    });
    return () => {
      current = false;
    };
  }, [monday, sunday]);

  const affirmations = loaded?.monday === monday ? loaded : null;
  const entries = new Map(focusEntriesBetween(monday, sunday).map((entry) => [entry.card.date, entry]));
  const said = new Map((affirmations?.days ?? []).map((day) => [day.date, day]));

  return {
    ready: notes.ready,
    affirmations: affirmations?.status ?? "loading",
    days: weekDays(monday)
      .filter((date) => date <= lastDay)
      .map((date) => ({
        date,
        entry: entries.get(date) ?? null,
        affirmation: said.get(date) ?? null,
      })),
  };
}
