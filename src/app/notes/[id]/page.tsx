import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isNoteId } from "@/lib/notes";
import NoteEditor from "../note-editor";

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

  return <NoteEditor noteId={id} initialContent={data.content} />;
}
