import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { BackIcon } from "@/components/icons";
import { isNoteId } from "../content";
import { fetchNoteExisting } from "../notes-api";
import { getStoredNote } from "../notes-store";
import type { FocusCardCopy } from "../types";
import { useNotesReady } from "../use-notes";
import NoteEditor from "./note-editor";

type Loaded =
  | { kind: "new" }
  | {
      kind: "existing";
      content: unknown;
      pinned: boolean;
      focusCard: FocusCardCopy | null;
    }
  | { kind: "deleted" }
  | { kind: "missing" };

// The writing screen. One web address per note, whether it is brand new or was
// written months ago.
export default function EditNoteScreen() {
  const { id = "" } = useParams();
  const location = useLocation();
  const ready = useNotesReady();
  // The notes list sets this when it has just made the note up. It is only a
  // hint for a note the phone has never seen: it stays on the page through a
  // refresh, so it must never be trusted over what is actually saved.
  const startedHere = Boolean(
    (location.state as { isNew?: boolean } | null)?.isNew,
  );

  // Waits for the phone's copy of her notes (a blink), then opens from it.
  if (!ready) return <div className="flex-1" />;

  // Keyed on the note, so opening a different one starts completely fresh and
  // nothing from the last note can linger on screen.
  return <OneNote key={id} id={id} startedHere={startedHere} />;
}

// What the phone already knows about this note, if anything.
function fromPhone(id: string): Loaded | null {
  const note = getStoredNote(id);
  if (!note) return null;
  return note.deletedAt
    ? { kind: "deleted" }
    : {
        kind: "existing",
        content: note.content,
        pinned: note.pinned,
        focusCard: note.focusCard ?? null,
      };
}

function OneNote({ id, startedHere }: { id: string; startedHere: boolean }) {
  const valid = isNoteId(id);
  // Read once when the screen opens. Later changes (her own typing) must not
  // reload the editor underneath her.
  const [loaded, setLoaded] = useState<Loaded | null>(() => {
    if (!valid) return { kind: "missing" };
    return fromPhone(id) ?? (startedHere ? { kind: "new" } : null);
  });

  // The phone doesn't have this note and she didn't just make it: it may be one
  // written on another device that hasn't arrived yet, so ask the database.
  useEffect(() => {
    if (loaded !== null) return;

    let current = true;
    void fetchNoteExisting(id).then((note) => {
      if (!current) return;
      if (!note) {
        setLoaded({ kind: "missing" });
      } else if (note.deletedAt) {
        setLoaded({ kind: "deleted" });
      } else {
        setLoaded({
          kind: "existing",
          content: note.content,
          pinned: note.pinned,
          focusCard: note.focusCard,
        });
      }
    });
    return () => {
      current = false;
    };
  }, [id, loaded]);

  if (loaded === null) {
    // Reading the note. Blank rather than a spinner, so nothing flashes.
    return <div className="flex-1" />;
  }

  if (loaded.kind === "deleted" || loaded.kind === "missing") {
    return (
      <Gone>
        {loaded.kind === "deleted"
          ? "This note is in Recently deleted."
          : "We couldn’t find that note."}
      </Gone>
    );
  }

  return (
    <NoteEditor
      noteId={id}
      exists={loaded.kind === "existing"}
      initialContent={loaded.kind === "existing" ? loaded.content : null}
      initialPinned={loaded.kind === "existing" ? loaded.pinned : false}
      focusCard={loaded.kind === "existing" ? loaded.focusCard : null}
    />
  );
}

function Gone({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6">
      <header className="flex items-center pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <Link
          to="/"
          aria-label="Back to notes"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </Link>
      </header>
      <p className="mt-8 text-center text-[17px] text-ink-soft">{children}</p>
    </main>
  );
}
