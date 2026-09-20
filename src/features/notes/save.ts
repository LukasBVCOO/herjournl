import { supabase } from "@/lib/supabase/client";
import { noteToLines, titleFromLines } from "./content";

// Saving a note to the database. Runs on her phone. Creating and updating are
// the same call: the note's id is chosen on the phone, so saving twice can
// never make two copies of a note. Returns false when it didn't go through,
// which the save queue takes as "try again shortly".
export async function saveNoteContent(id: string, doc: unknown) {
  // No point asking when the phone knows it has no internet.
  if (!navigator.onLine) return false;

  const title = titleFromLines(noteToLines(doc));
  try {
    const { error } = await supabase
      .from("notes")
      .upsert({ id, title, content: doc });
    return !error;
  } catch {
    return false;
  }
}
