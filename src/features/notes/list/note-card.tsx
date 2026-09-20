import { Link } from "react-router";
import type { NoteSummary } from "../types";
import NoteDate from "./note-date";

export default function NoteCard({ note }: { note: NoteSummary }) {
  return (
    <Link
      to={`/notes/${note.id}`}
      className="block rounded-card bg-card px-5 py-4 shadow-soft transition-opacity duration-200 active:opacity-80"
    >
      {note.title ? (
        <h3 className="truncate font-serif text-[22px] leading-tight font-medium">
          {note.title}
        </h3>
      ) : (
        <h3 className="font-serif text-[22px] leading-tight font-medium text-muted">
          New note
        </h3>
      )}
      {note.preview && (
        <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-ink-soft">
          {note.preview}
        </p>
      )}
      <p className="mt-3 text-xs text-muted">
        <NoteDate iso={note.updatedAt} />
      </p>
    </Link>
  );
}
