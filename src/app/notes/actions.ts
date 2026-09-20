"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  isNoteId,
  linesToContent,
  textToLines,
  titleFromLines,
} from "@/lib/notes";

export type NoteFormState = { error?: string } | undefined;

// Creates a note (id is null) or updates an existing one, then goes back to the list.
export async function saveNote(
  id: string | null,
  _prev: NoteFormState,
  formData: FormData,
): Promise<NoteFormState> {
  const lines = textToLines(String(formData.get("text") ?? ""));
  const title = titleFromLines(lines);

  // Nothing written, so don't leave an empty note behind.
  if (!id && !title) redirect("/");
  if (id && !isNoteId(id)) return { error: "We couldn't find that note." };

  const supabase = await createClient();
  const fields = { title, content: linesToContent(lines) };

  if (id) {
    const { data, error } = await supabase
      .from("notes")
      .update(fields)
      .eq("id", id)
      .is("deleted_at", null)
      .select("id");
    if (error || !data?.length) {
      return { error: "We couldn't save your note. Please try again." };
    }
  } else {
    const { error } = await supabase.from("notes").insert(fields);
    if (error) {
      return { error: "We couldn't save your note. Please try again." };
    }
  }

  revalidatePath("/");
  redirect("/");
}
