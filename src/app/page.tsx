import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { noteToLines, previewFromLines, titleFromLines } from "@/lib/notes";
import { PlusIcon, SettingsIcon } from "./icons";
import NoteCard, { type NoteSummary } from "./note-card";

type NoteRow = {
  id: string;
  content: unknown;
  pinned: boolean;
  updated_at: string;
};

function toSummary(row: NoteRow): NoteSummary {
  const lines = noteToLines(row.content);
  return {
    id: row.id,
    title: titleFromLines(lines),
    preview: previewFromLines(lines),
    updatedAt: row.updated_at,
  };
}

export default async function NotesPage() {
  const supabase = await createClient();
  // The database only ever returns her own notes, so no filtering by owner here.
  const { data, error } = await supabase
    .from("notes")
    .select("id, content, pinned, updated_at")
    .is("deleted_at", null)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  const rows = (data ?? []) as NoteRow[];
  const pinned = rows.filter((row) => row.pinned).map(toSummary);
  const others = rows.filter((row) => !row.pinned).map(toSummary);

  return (
    <>
      <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-32">
        <header className="flex items-center justify-between pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
          <h1 className="font-serif text-[28px] font-medium">HerJournl</h1>
          <Link
            href="/settings"
            aria-label="Settings"
            className="-mr-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            <SettingsIcon />
          </Link>
        </header>

        {error ? (
          <EmptyMessage>
            We couldn&rsquo;t load your notes.{" "}
            <Link href="/" className="font-medium text-ink underline underline-offset-4">
              Try again
            </Link>
          </EmptyMessage>
        ) : rows.length === 0 ? (
          <EmptyMessage>Start with a thought.</EmptyMessage>
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
      <ul className="flex flex-col gap-4">
        {notes.map((note) => (
          <li key={note.id}>
            <NoteCard note={note} />
          </li>
        ))}
      </ul>
    </section>
  );
}

// One calm line for screens with nothing on them.
function EmptyMessage({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-24 text-center font-serif text-2xl text-ink-soft">
      {children}
    </p>
  );
}
