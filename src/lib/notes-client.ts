import { createClient } from "@/lib/supabase/client";
import { noteToLines, titleFromLines } from "@/lib/notes";

// Runs on her phone. Creating and updating are the same call: the note's id is
// chosen on the phone, so saving twice can never make two copies of a note.
export async function saveNoteContent(id: string, doc: unknown) {
  const title = titleFromLines(noteToLines(doc));
  const supabase = createClient();
  const { error } = await supabase
    .from("notes")
    .upsert({ id, title, content: doc });
  return !error;
}

export function isEmptyDoc(doc: unknown) {
  return titleFromLines(noteToLines(doc)) === "";
}

// The notes list can be shown from memory when she swipes back, so the editor
// leaves a flag behind telling the list to refresh itself once.
const CHANGED_KEY = "herjournl:notes-changed";

export function markNotesChanged() {
  try {
    sessionStorage.setItem(CHANGED_KEY, "1");
  } catch {
    // Private browsing can block storage; the list just refreshes next visit.
  }
}

export function consumeNotesChanged() {
  try {
    const changed = sessionStorage.getItem(CHANGED_KEY) === "1";
    if (changed) sessionStorage.removeItem(CHANGED_KEY);
    return changed;
  } catch {
    return false;
  }
}
