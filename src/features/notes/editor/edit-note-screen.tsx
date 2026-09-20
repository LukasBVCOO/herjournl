import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import { BackIcon } from "@/components/icons";
import { isNoteId } from "../content";
import { fetchNoteExisting, type ExistingNote } from "../notes-api";
import NoteEditor from "./note-editor";

type Loaded =
  | { kind: "new" }
  | { kind: "existing"; note: ExistingNote }
  | { kind: "deleted" }
  | { kind: "missing" };

// The writing screen. One web address per note, whether it is brand new or was
// written months ago.
export default function EditNoteScreen() {
  const { id = "" } = useParams();
  const location = useLocation();
  // The notes list sets this when it has just made the note up, so tapping "+"
  // opens a blank page immediately instead of asking the database about a note
  // that cannot exist yet.
  const startedHere = Boolean(
    (location.state as { isNew?: boolean } | null)?.isNew,
  );

  // Keyed on the note, so opening a different one starts completely fresh and
  // nothing from the last note can linger on screen.
  return <OneNote key={id} id={id} startedHere={startedHere} />;
}

function OneNote({ id, startedHere }: { id: string; startedHere: boolean }) {
  const valid = isNoteId(id);
  const [loaded, setLoaded] = useState<Loaded | null>(() => {
    if (!valid) return { kind: "missing" };
    return startedHere ? { kind: "new" } : null;
  });

  useEffect(() => {
    if (!valid || startedHere) return;

    let current = true;
    void fetchNoteExisting(id).then((note) => {
      if (!current) return;
      if (!note) {
        // Nothing here yet: she reopened a note she never wrote in, so this is
        // still a blank page waiting for her.
        setLoaded({ kind: "new" });
      } else if (note.deletedAt) {
        setLoaded({ kind: "deleted" });
      } else {
        setLoaded({ kind: "existing", note });
      }
    });
    return () => {
      current = false;
    };
  }, [id, valid, startedHere]);

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
      initialContent={loaded.kind === "existing" ? loaded.note.content : null}
      initialPinned={loaded.kind === "existing" ? loaded.note.pinned : false}
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
