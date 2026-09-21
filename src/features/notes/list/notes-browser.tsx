import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import EmptyMessage from "../empty-message";
import SearchBox from "../search/search-box";
import { buildIndex, searchNotes } from "../search/search-logic";
import type { ListedNote, NoteSummary } from "../types";
import NoteCard from "./note-card";

// The search bar and the list beneath it. While she types, the list narrows to
// the notes that match; with the bar empty it shows all her notes.
//
// `belowSearch` (today's focus card, handed in by the app) sits between the two.
// It steps aside while she is searching, so the results are all she sees.
export default function NotesBrowser({
  notes,
  belowSearch,
}: {
  notes: ListedNote[];
  belowSearch?: ReactNode;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const index = useMemo(() => buildIndex(notes), [notes]);
  const results = useMemo(
    () => searchNotes(index, deferredQuery),
    [index, deferredQuery],
  );
  const searching = deferredQuery.trim() !== "";

  const pinned = notes.filter((note) => note.pinned);
  const others = notes.filter((note) => !note.pinned);

  return (
    <>
      <SearchBox value={query} onChange={setQuery} />

      {!searching && belowSearch && <div className="mt-6">{belowSearch}</div>}

      <div className="mt-6" aria-live="polite">
        {searching ? (
          results.length === 0 ? (
            <EmptyMessage>Nothing found.</EmptyMessage>
          ) : (
            <NoteCards notes={results} />
          )
        ) : (
          <div className="flex flex-col gap-8">
            {pinned.length > 0 && <Section label="Pinned" notes={pinned} />}
            {others.length > 0 && (
              <Section
                label={pinned.length > 0 ? "Notes" : undefined}
                notes={others}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Section({
  label,
  notes,
}: {
  label?: string;
  notes: NoteSummary[];
}) {
  return (
    <section>
      {label && (
        <h2 className="mb-3 text-xs font-medium tracking-wider text-muted uppercase">
          {label}
        </h2>
      )}
      <NoteCards notes={notes} />
    </section>
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
