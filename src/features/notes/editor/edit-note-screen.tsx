import { notFound } from "next/navigation";
import { fetchNoteContent } from "../queries";
import NoteEditor from "./note-editor";

export default async function EditNoteScreen({ id }: { id: string }) {
  // Someone else's note, or a deleted one, simply isn't found.
  const note = await fetchNoteContent(id);
  if (!note) notFound();

  return (
    <NoteEditor
      noteId={id}
      initialContent={note.content}
      initialPinned={note.pinned}
    />
  );
}
