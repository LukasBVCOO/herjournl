"use client";

import Link from "next/link";
import { useActionState } from "react";
import { BackIcon } from "../icons";
import { saveNote } from "./actions";

type Props = {
  id: string | null;
  initialText: string;
};

// Temporary writing page: one plain text box and a Save button.
// The real editor (bullets, tick boxes, autosave) replaces it in step 1.5.
export default function NoteForm({ id, initialText }: Props) {
  const [state, formAction, pending] = useActionState(
    saveNote.bind(null, id),
    undefined,
  );

  return (
    <form
      action={formAction}
      className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6"
    >
      <header className="flex items-center justify-between pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <Link
          href="/"
          aria-label="Back to notes without saving"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </Link>
        <button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save"}
        </button>
      </header>

      {state?.error && (
        <p role="alert" className="animate-fade-in pb-2 text-sm text-alert">
          {state.error}
        </p>
      )}

      <textarea
        name="text"
        defaultValue={initialText}
        autoFocus={id === null}
        aria-label="Note"
        placeholder="Write your intention, a script, or anything on your mind."
        className="min-h-[60dvh] w-full flex-1 resize-none bg-transparent pb-8 text-[17px] leading-relaxed text-ink outline-none placeholder:text-muted"
      />
    </form>
  );
}
