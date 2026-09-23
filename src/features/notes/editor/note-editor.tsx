import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { BackIcon } from "@/components/icons";
import { deleteNote, pinNote } from "../notes-store";
import {
  flushNote,
  getStatus,
  isStored,
  queueSave,
  registerNote,
  subscribe,
  type SaveStatus,
} from "../save-queue";
import type { FocusCardCopy } from "../types";
import FocusInfo from "./focus-info";
import FormatBar from "./format-bar";
import NoteMenu from "./note-menu";

const PLACEHOLDER = "Write your intention, a script, or anything on your mind.";

const statusText: Record<SaveStatus, string> = {
  idle: "",
  saving: "Saving…",
  saved: "Saved",
  // Her writing is safe on the phone and goes up when the internet is back.
  offline: "Saved on this phone",
  error: "Not saved. Retrying…",
};

const NOTICE_MS = 4000;

type Props = {
  noteId: string;
  // False for a note she has not written anything in yet.
  exists: boolean;
  initialContent: unknown;
  initialPinned: boolean;
  // For a note written from a daily focus card: the card it came from.
  focusCard: FocusCardCopy | null;
};

function isDoc(value: unknown): value is { type: "doc" } {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { type?: unknown }).type === "doc"
  );
}

export default function NoteEditor({
  noteId: id,
  exists,
  initialContent,
  initialPinned,
  focusCard,
}: Props) {
  const navigate = useNavigate();
  // A new note's id was chosen on her phone before this screen opened, so
  // saving is always the same call and never makes two copies of a note.
  const isNew = !exists;
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
    navigate("/");
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
    navigate("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-6">
      <header className="sticky top-0 z-10 flex items-center justify-between bg-paper pt-[max(1.25rem,env(safe-area-inset-top))] pb-3">
        <Link
          to="/"
          onClick={goBack}
          aria-label="Back to notes"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </Link>
        <div className="flex min-w-0 items-center gap-3">
          {focusCard && <FocusInfo card={focusCard} />}
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

      {/* The question she was answering, above her writing. It
          is not part of the note's text: it isn't editable and never becomes
          the title, the preview or a search match. */}
      {focusCard && (
        <p className="mt-3 mb-8 font-serif text-[24px] leading-snug font-normal text-ink-soft">{focusCard.prompt}</p>
      )}

      <EditorContent editor={editor} className="flex-1 cursor-text" />

      {editor && <FormatBar editor={editor} />}
    </div>
  );
}
