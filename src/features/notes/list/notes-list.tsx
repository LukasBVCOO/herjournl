import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { PlusIcon, ProfileIcon, SettingsIcon } from "@/components/icons";
import { InstallButton } from "@/features/install";
import { OnboardingShortcut } from "@/features/onboarding";
import EmptyMessage from "../empty-message";
import { TrashIcon } from "../note-icons";
import { retrySync } from "../notes-store";
import { useNotes } from "../use-notes";
import NotesBrowser from "./notes-browser";

// The notes list screen: search bar, pinned notes, the rest, and the new note button.
//
// `focusSlot` is a card shown between the search bar and her notes (or at the top
// when she has none yet). The app puts today's focus card there. It is handed in
// rather than imported so this feature knows nothing about it.
export default function NotesListScreen({ focusSlot }: { focusSlot?: ReactNode }) {
  const navigate = useNavigate();
  const { ready, hasSynced, syncFailed, notes } = useNotes();

  // A new note's id is chosen here, so the writing screen has a real web
  // address from the first keystroke.
  function newNote() {
    navigate(`/notes/${crypto.randomUUID()}`, { state: { isNew: true } });
  }

  // Blank rather than "Start with a thought." while her notes are still being
  // found, so it never says she has none when she does.
  const stillFinding = !ready || (notes.length === 0 && !hasSynced && !syncFailed);

  return (
    <>
      <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-32">
        <header className="flex items-center justify-between pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
          <h1 className="font-serif text-[28px] font-medium">Becomely</h1>
          <nav className="-mr-3 flex items-center">
            {/* Testing only: remove before launch. */}
            <OnboardingShortcut />
            <InstallButton />
            <Link
              to="/recently-deleted"
              aria-label="Recently deleted"
              className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              <TrashIcon />
            </Link>
            <Link
              to="/profile"
              aria-label="Profile"
              className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              <ProfileIcon />
            </Link>
            <Link
              to="/settings"
              aria-label="Settings"
              className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              <SettingsIcon />
            </Link>
          </nav>
        </header>

        {stillFinding ? null : notes.length === 0 && !hasSynced ? (
          <>
            {focusSlot}
            <EmptyMessage>
              We couldn&rsquo;t load your notes.{" "}
              <button
                type="button"
                onClick={retrySync}
                className="font-medium text-ink underline underline-offset-4"
              >
                Try again
              </button>
            </EmptyMessage>
          </>
        ) : notes.length === 0 ? (
          // Nothing written yet: there is no search bar, so the focus card sits at
          // the top, and the way in to a new note in the middle of the screen,
          // where her eye already is, instead of only in the corner.
          <>
            {focusSlot}
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <p className="font-serif text-2xl text-ink-soft">Start with a thought.</p>
              <button
                type="button"
                onClick={newNote}
                className="mt-6 flex h-12 items-center gap-2 rounded-full bg-accent pr-6 pl-5 font-medium text-ink shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80"
              >
                <PlusIcon />
                Add note
              </button>
            </div>
          </>
        ) : (
          <NotesBrowser notes={notes} belowSearch={focusSlot} />
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex w-full max-w-md justify-end px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={newNote}
            aria-label="New note"
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          >
            <PlusIcon />
          </button>
        </div>
      </div>
    </>
  );
}
