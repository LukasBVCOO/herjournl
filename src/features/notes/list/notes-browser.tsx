import { useDeferredValue, useMemo, type ReactNode } from "react";
import EmptyMessage from "../empty-message";
import { buildIndex, searchNotes } from "../search/search-logic";
import type { ListedNote, NoteSummary } from "../types";
import NoteCard from "./note-card";

// The search bar and the list beneath it. While she types, the list narrows to
// the notes that match; with the bar empty it shows all her notes, pinned ones
// first (the store's own sort order — see notes-store.ts), under one "Your
// Notes" heading. A pinned note is marked on its own card (a small pin icon),
// not by living in a separate section.
//
// `belowSearch` (today's focus card, handed in by the app) sits between the two.
// It steps aside while she is searching, so the results are all she sees.
export default function NotesBrowser({
  notes,
  query,
  belowSearch,
}: {
  notes: ListedNote[];
  query: string;
  belowSearch?: ReactNode;
}) {
  const deferredQuery = useDeferredValue(query);
  const index = useMemo(() => buildIndex(notes), [notes]);
  const results = useMemo(
    () => searchNotes(index, deferredQuery),
    [index, deferredQuery],
  );
  const searching = deferredQuery.trim() !== "";

  return (
    <>
      {!searching && belowSearch && <div>{belowSearch}</div>}

      <div className={!searching && belowSearch ? "mt-6" : undefined} aria-live="polite">
        {searching ? (
          results.length === 0 ? (
            <EmptyMessage>Nothing found.</EmptyMessage>
          ) : (
            <NoteCards notes={results} />
          )
        ) : (
          <section>
            <h2 className="mb-3 font-serif text-2xl font-medium">Your Notes</h2>
            <NoteCards notes={notes} />
          </section>
        )}
      </div>
    </>
  );
}

function NoteCards({ notes }: { notes: NoteSummary[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {notes.map((note) => (
        <li key={note.id}>
          <NoteCard note={note} />
        </li>
      ))}
    </ul>
  );
}
