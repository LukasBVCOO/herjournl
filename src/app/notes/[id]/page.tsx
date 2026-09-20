import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isNoteId, noteToLines } from "@/lib/notes";
import NoteForm from "../note-form";

export default async function NotePage({ params }: PageProps<"/notes/[id]">) {
  const { id } = await params;
  if (!isNoteId(id)) notFound();

  const supabase = await createClient();
  // Someone else's note, or a deleted one, simply isn't found.
  const { data } = await supabase
    .from("notes")
    .select("content")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!data) notFound();

  return <NoteForm id={id} initialText={noteToLines(data.content).join("\n")} />;
}
