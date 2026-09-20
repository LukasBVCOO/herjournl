"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { BackIcon } from "@/components/icons";
import { deleteNote, pinNote } from "../actions";
import {
  flushNote,
  getStatus,
  isStored,
  queueSave,
  registerNote,
  subscribe,
  type SaveStatus,
} from "../save-queue";
import FormatBar from "./format-bar";
import NoteMenu from "./note-menu";

const PLACEHOLDER = "Write your intention, a script, or anything on your mind.";

const statusText: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  error: "Not saved. Retrying…",
};

const NOTICE_MS = 4000;

type Props = {
  // null for a brand new note
  noteId: string | null;
  initialContent: unknown;
  initialPinned: boolean;
};

function isDoc(value: unknown): value is { type: "doc" } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "doc"
  );
}

export default function NoteEditor({
  noteId,
  initialContent,
  initialPinned,
}: Props) {
  const router = useRouter();
  const isNew = noteId === null;
  // A new note gets its id on her phone, so saving is always the same call.
  const [id] = useState(() => noteId ?? crypto.randomUUID());
  const [pinned, setPinned] = useState(initialPinned);
  // A short message in place of the save status, e.g. "Couldn't delete."
  const [notice, setNotice] = useState<string | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Saving is handled by the save queue, which keeps going even after this
  // screen is closed. This screen only shows what the queue reports.
  const subscribeToQueue = useCallback(
    (onChange: () => void) => subscribe(id, onChange),
    [id],
  );
  const status = useSyncExternalStore(
    subscribeToQueue,
    () => getStatus(id, isNew ? "idle" : "saved"),
    () => (isNew ? "idle" : "saved"),
  );
  // Pin and Delete need a note that exists, so they wait for the first save.
  const stored = useSyncExternalStore(
    subscribeToQueue,
    () => isStored(id, !isNew),
    () => !isNew,
  );

  useEffect(() => {
    registerNote(id, !isNew);
    // Leaving the screen saves straight away rather than waiting for the timer.
    return () => void flushNote(id);
  }, [id, isNew]);

  // Once a brand new note exists, a refresh reopens it instead of a blank one.
  useEffect(() => {
    if (isNew && stored) window.history.replaceState(null, "", `/notes/${id}`);
  }, [id, isNew, stored]);

  const editor = useEditor({
    immediatelyRender: false,
    autofocus: isNew ? "start" : false,
    content: isDoc(initialContent) ? initialContent : undefined,
    extensions: [
      StarterKit.configure({
        // Only what the editor offers: headings, bold, italic and lists.
        heading: { levels: [1] },
        blockquote: false,
        code: false,
        codeBlock: false,
        horizontalRule: false,
        strike: false,
        underline: false,
        link: false,
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({
        placeholder: ({ pos }) => (pos === 0 ? PLACEHOLDER : ""),
      }),
    ],
    editorProps: {
      attributes: { class: "note-prose", "aria-label": "Note" },
      scrollMargin: { top: 72, bottom: 120, left: 0, right: 0 },
    },
    onUpdate: ({ editor }) => queueSave(id, editor.getJSON()),
  });

  function showNotice(message: string) {
    clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  // Going back doesn't wait for the save. The queue finishes it, and retries
  // if the connection is bad, after this screen has gone.
  function goBack(event: React.MouseEvent) {
    event.preventDefault();
    void flushNote(id);
    router.push("/");
  }

  async function togglePin() {
    const next = !pinned;
    setPinned(next);
    const ok = await pinNote(id, next);
    if (!ok) {
      setPinned(!next);
      showNotice("Couldn't update the pin.");
    }
  }

  async function moveToRecentlyDeleted() {
    // Keep whatever she just typed, in case she restores the note later.
    await flushNote(id);
    const ok = await deleteNote(id);
    if (!ok) {
      showNotice("Couldn't delete the note.");
      return;
    }
    router.push("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-paper pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <Link
          href="/"
          onClick={goBack}
          aria-label="Back to notes"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </Link>
        <div className="flex items-center gap-2">
          <p
            role="status"
            className={`text-xs ${notice || status === "error" ? "text-alert" : "text-muted"}`}
          >
            {notice ?? statusText[status]}
          </p>
          <NoteMenu
            pinned={pinned}
            disabled={!stored}
            onTogglePin={togglePin}
            onDelete={moveToRecentlyDeleted}
          />
        </div>
      </header>

      <EditorContent editor={editor} className="flex-1 cursor-text" />

      {editor && <FormatBar editor={editor} />}
    </div>
  );
}
