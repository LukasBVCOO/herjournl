import { supabase } from "@/lib/supabase/client";
import { noteToLines, titleFromLines } from "./content";

// Saving a note. Runs on her phone. Creating and updating are the same call:
// the note's id is chosen on the phone, so saving twice can never make two
// copies of a note.
export async function saveNoteContent(id: string, doc: unknown) {
  const title = titleFromLines(noteToLines(doc));
  const { error } = await supabase
    .from("notes")
    .upsert({ id, title, content: doc });
  return !error;
}
