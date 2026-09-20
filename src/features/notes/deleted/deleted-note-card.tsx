"use client";

import { useEffect, useState } from "react";
import { deleteNoteForever, restoreNote } from "../actions";
import type { DeletedNoteSummary } from "../types";

// Delete forever can't be undone, so it asks for a second tap.
const CONFIRM_WINDOW_MS = 4000;

export default function DeletedNoteCard({ note }: { note: DeletedNoteSummary }) {
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [gone, setGone] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!confirming) return;
    const timer = setTimeout(() => setConfirming(false), CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [confirming]);

  async function run(action: (id: string) => Promise<boolean>) {
    setBusy(true);
    setFailed(false);
    const ok = await action(note.id);
    if (ok) {
      // The screen refreshes itself; hide the card straight away meanwhile.
      setGone(true);
      return;
    }
    setBusy(false);
    setConfirming(false);
    setFailed(true);
  }

  if (gone) return null;

  return (
    <div className="rounded-card bg-card px-5 py-4 shadow-soft">
      <h3
        className={`truncate font-serif text-[22px] leading-tight font-medium ${
          note.title ? "" : "text-muted"
        }`}
      >
        {note.title || "Untitled note"}
      </h3>
      {note.preview && (
        <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-ink-soft">
          {note.preview}
        </p>
      )}
      <p className="mt-3 text-xs text-muted">
        {note.daysLeft} {note.daysLeft === 1 ? "day" : "days"} left
      </p>

      {failed && (
        <p role="alert" className="mt-3 animate-fade-in text-sm text-alert">
          That didn&rsquo;t work. Please try again.
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => run(restoreNote)}
          className="h-10 rounded-full bg-ink px-5 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        >
          Restore
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => (confirming ? run(deleteNoteForever) : setConfirming(true))}
          className={`h-10 rounded-full px-5 text-[15px] font-medium transition-colors duration-200 disabled:opacity-60 ${
            confirming
              ? "bg-alert text-paper"
              : "border border-line bg-surface text-alert hover:bg-paper"
          }`}
        >
          {confirming ? "Tap again to delete" : "Delete forever"}
        </button>
      </div>
    </div>
  );
}
