import Link from "next/link";
import { PlusIcon, SettingsIcon } from "@/components/icons";
import EmptyMessage from "../empty-message";
import { TrashIcon } from "../note-icons";
import { fetchNoteList } from "../queries";
import ListRefresh from "./list-refresh";
import NotesBrowser from "./notes-browser";

// The notes list screen: search bar, pinned notes, the rest, and the new note button.
export default async function NotesListScreen() {
  const { notes, failed } = await fetchNoteList();

  return (
    <>
      <ListRefresh />
      <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-32">
        <header className="flex items-center justify-between pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
          <h1 className="font-serif text-[28px] font-medium">HerJournl</h1>
          <nav className="-mr-3 flex items-center">
            <Link
              href="/recently-deleted"
              aria-label="Recently deleted"
              className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              <TrashIcon />
            </Link>
            <Link
              href="/settings"
              aria-label="Settings"
              className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              <SettingsIcon />
            </Link>
          </nav>
        </header>

        {failed ? (
          <EmptyMessage>
            We couldn&rsquo;t load your notes.{" "}
            <Link href="/" className="font-medium text-ink underline underline-offset-4">
              Try again
            </Link>
          </EmptyMessage>
        ) : notes.length === 0 ? (
          <EmptyMessage>Start with a thought.</EmptyMessage>
        ) : (
          <NotesBrowser notes={notes} />
        )}
      </main>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10">
        <div className="mx-auto flex w-full max-w-md justify-end px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <Link
            href="/notes/new"
            aria-label="New note"
            className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent text-ink shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          >
            <PlusIcon />
          </Link>
        </div>
      </div>
    </>
  );
}
