"use client";

import { useSyncExternalStore } from "react";
import { formatNoteDate } from "@/lib/notes";

const subscribe = () => () => {};

// The server doesn't know her time zone, so the date is filled in on her phone.
export default function NoteDate({ iso }: { iso: string }) {
  const text = useSyncExternalStore(
    subscribe,
    () => formatNoteDate(iso),
    () => "",
  );

  return (
    <time dateTime={iso} className="block h-4">
      {text}
    </time>
  );
}
