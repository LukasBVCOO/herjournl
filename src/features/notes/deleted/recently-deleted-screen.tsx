import { BackIcon } from "@/components/icons";
import { useGoBack } from "@/lib/use-go-back";
import EmptyMessage from "../empty-message";
import { retrySync } from "../notes-store";
import { useNotes } from "../use-notes";
import DeletedNoteCard from "./deleted-note-card";

// Deleted notes wait here for 30 days before they are removed for good.
export default function RecentlyDeletedScreen() {
  const goBack = useGoBack();
  const { ready, hasSynced, syncFailed, deleted } = useNotes();

  const stillFinding = !ready || (deleted.length === 0 && !hasSynced && !syncFailed);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-12">
      <header className="flex items-center gap-1 pt-[max(1.25rem,env(safe-area-inset-top))] pb-2">
        {/* Reached from Settings now, so back returns there (or to the notes
            list if there's no earlier page — see useGoBack). */}
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </button>
        <h1 className="font-serif text-[28px] font-medium">Recently deleted</h1>
      </header>
      <p className="mb-6 text-sm text-ink-soft">
        Notes stay here for 30 days, then they&rsquo;re removed for good.
      </p>

      {stillFinding ? null : deleted.length === 0 && !hasSynced ? (
        <EmptyMessage>
          We couldn&rsquo;t load your deleted notes.{" "}
          <button
            type="button"
            onClick={retrySync}
            className="font-medium text-ink underline underline-offset-4"
          >
            Try again
          </button>
        </EmptyMessage>
      ) : deleted.length === 0 ? (
        <EmptyMessage>Nothing here.</EmptyMessage>
      ) : (
        <ul className="flex flex-col gap-4">
          {deleted.map((note) => (
            <li key={note.id}>
              <DeletedNoteCard note={note} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
