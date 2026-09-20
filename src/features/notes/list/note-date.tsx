import { formatNoteDate } from "../dates";

// The date is worked out on her phone, so it is in her own time zone.
export default function NoteDate({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} className="block h-4">
      {formatNoteDate(iso)}
    </time>
  );
}
