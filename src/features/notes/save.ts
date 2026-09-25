import { supabase } from "@/lib/supabase/client";
import { noteTitle } from "./content";
import type { FocusCardCopy } from "./types";

// Saving a note to the database. Runs on her phone. Creating and updating are
// the same call: the note's id is chosen on the phone, so saving twice can
// never make two copies of a note. Returns false when it didn't go through,
// which the save queue takes as "try again shortly".
//
// A note written from a daily focus card sends its card copy too, and is marked
// as a daily entry. Every save of that note repeats the same values, so the copy
// is on the server however the first save went. An ordinary note sends none of
// this, and an existing note's card copy is never touched by a save without it.
export async function saveNoteContent(
  id: string,
  doc: unknown,
  focusCard?: FocusCardCopy | null,
) {
  // No point asking when the phone knows it has no internet.
  if (!navigator.onLine) return false;

  const title = noteTitle(doc);
  try {
    const { error } = await supabase.from("notes").upsert({
      id,
      title,
      content: doc,
      ...(focusCard
        ? { focus_card: focusCard, type: "daily_entry", note_date: focusCard.date }
        : {}),
    });
    return !error;
  } catch {
    return false;
  }
}
