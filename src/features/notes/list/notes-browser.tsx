import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { ListCheckIcon, MenuIcon, StickerIcon } from "@/components/icons";
import { isPlanTitle } from "../content";
import EmptyMessage from "../empty-message";
import { TrashIcon } from "../note-icons";
import { buildIndex, searchNotes } from "../search/search-logic";
import type { ListedNote, NoteSummary } from "../types";
import NoteCard from "./note-card";

type Filter = "all" | "notes" | "plans" | "focus";

const FILTERS: { value: Filter; label: string; icon: ReactNode }[] = [
  { value: "all", label: "All", icon: <MenuIcon /> },
  // Plain, free-written notes — the same icon the "+" menu's "New note"
  // action uses, so the same picture means "an ordinary note" everywhere.
  { value: "notes", label: "Notes", icon: <StickerIcon /> },
  { value: "plans", label: "Plans", icon: <ListCheckIcon /> },
  // The app's own sparkle mark, the same fallback used for a focus card
  // note with no house icon of its own (daily-focus's MOON_FALLBACK_VISUAL)
  // — nothing else stands for "a focus card" in general, only per-house.
  { value: "focus", label: "Focus", icon: <span className="font-serif text-[19px] leading-none">✦</span> },
];

function matchesFilter(note: NoteSummary, filter: Filter): boolean {
  if (filter === "focus") return note.focusLabel !== null;
  if (filter === "plans") return isPlanTitle(note.title);
  // Plain notes: everything that isn't a focus-card note or a Plan.
  if (filter === "notes") return note.focusLabel === null && !isPlanTitle(note.title);
  return true;
}

// The heading above the list follows whichever filter is selected.
const SECTION_HEADING: Record<Filter, string> = {
  all: "Your Journal",
  notes: "Your Writing",
  plans: "Your Plans",
  focus: "Your Focus",
};

// The search bar and the list beneath it. While she types, the list narrows to
// the notes that match; with the bar empty it shows her notes, pinned ones
// first (the store's own sort order — see notes-store.ts), under a heading
// that names whichever filter is selected (SECTION_HEADING). A pinned note is
// marked on its own card (a small pin icon), not by living in a separate section.
//
// `belowSearch` (today's focus card, handed in by the app) sits between the two.
// Just under it, four filter chips narrow "Your Notes" to plain Notes, Plans
// (Daily Plan and Checklist notes — see content.ts's isPlanTitle) or Focus
// cards (notes written from a daily focus card), with a fifth circle at the
// end leading to Recently deleted instead — its own screen, not a filter on
// this list. All of it steps aside while she is searching, so the results
// are all she sees.
export default function NotesBrowser({
  notes,
  query,
  belowSearch,
}: {
  notes: ListedNote[];
  query: string;
  belowSearch?: ReactNode;
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const deferredQuery = useDeferredValue(query);
  const index = useMemo(() => buildIndex(notes), [notes]);
  const results = useMemo(
    () => searchNotes(index, deferredQuery),
    [index, deferredQuery],
  );
  const searching = deferredQuery.trim() !== "";
  const filteredNotes = useMemo(
    () => notes.filter((note) => matchesFilter(note, filter)),
    [notes, filter],
  );

  return (
    <>
      {!searching && belowSearch && <div>{belowSearch}</div>}

      {!searching && (
        <div className="mt-6 flex justify-center gap-5">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
              className="flex flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors duration-200 ${
                  filter === option.value ? "bg-ink text-paper" : "bg-card text-ink-soft"
                }`}
              >
                {option.icon}
              </span>
              <span
                className={`text-xs font-medium transition-colors duration-200 ${
                  filter === option.value ? "text-ink" : "text-ink-soft"
                }`}
              >
                {option.label}
              </span>
            </button>
          ))}

          <Link to="/recently-deleted" className="flex flex-col items-center gap-1.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-card text-ink-soft transition-colors duration-200 hover:text-ink">
              <TrashIcon />
            </span>
            <span className="text-xs font-medium text-ink-soft">Deleted</span>
          </Link>
        </div>
      )}

      <div className={!searching ? "mt-6" : undefined} aria-live="polite">
        {searching ? (
          results.length === 0 ? (
            <EmptyMessage>Nothing found.</EmptyMessage>
          ) : (
            <NoteCards notes={results} />
          )
        ) : filteredNotes.length === 0 ? (
          <EmptyMessage>Nothing here yet.</EmptyMessage>
        ) : (
          <section>
            <h2 className="mb-3 font-serif text-2xl font-medium">{SECTION_HEADING[filter]}</h2>
            <NoteCards notes={filteredNotes} />
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
