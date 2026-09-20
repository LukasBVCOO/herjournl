"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import { Placeholder } from "@tiptap/extensions";
import { BackIcon } from "@/components/icons";
import { deleteNote, pinNote } from "../actions";
import { isEmptyDoc } from "../content";
import { markNotesChanged } from "../list-sync";
import { saveNoteContent } from "../save";
import FormatBar from "./format-bar";
import NoteMenu from "./note-menu";

const PLACEHOLDER = "Write your intention, a script, or anything on your mind.";
const SAVE_DELAY_MS = 1000;
const RETRY_DELAY_MS = 4000;

type Status = "idle" | "saving" | "saved" | "error";

const statusText: Record<Status, string> = {
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
  const [status, setStatus] = useState<Status>(isNew ? "idle" : "saved");
  const [pinned, setPinned] = useState(initialPinned);
  // Pin and Delete need a note that exists, so they wait for the first save.
  const [canManage, setCanManage] = useState(!isNew);
  // A short message in place of the save status, e.g. "Couldn't delete."
  const [notice, setNotice] = useState<string | null>(null);

  const noticeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dirty = useRef(false);
  const running = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  // True once the note exists in the database.
  const stored = useRef(!isNew);
  const saveRef = useRef<() => Promise<void>>(() => Promise.resolve());

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
    onUpdate: () => {
      dirty.current = true;
      setStatus("saving");
      clearTimeout(timer.current);
      timer.current = setTimeout(() => void saveRef.current(), SAVE_DELAY_MS);
    },
  });

  // Saves whatever is in the note now. If a save is already under way it waits
  // for it, and the running save picks up anything typed in the meantime.
  const save = useCallback((): Promise<void> => {
    clearTimeout(timer.current);
    if (running.current) return running.current;
    if (!editor || !dirty.current) return Promise.resolve();

    running.current = (async () => {
      while (dirty.current) {
        dirty.current = false;
        const doc = editor.getJSON();

        // Nothing written and never saved: don't create an empty note.
        if (!stored.current && isEmptyDoc(doc)) continue;

        const ok = await saveNoteContent(id, doc);
        if (!ok) {
          dirty.current = true;
          setStatus("error");
          timer.current = setTimeout(() => void saveRef.current(), RETRY_DELAY_MS);
          return;
        }

        markNotesChanged();
        if (!stored.current) {
          stored.current = true;
          setCanManage(true);
          // A refresh now reopens this note instead of a blank one.
          window.history.replaceState(null, "", `/notes/${id}`);
        }
      }
      setStatus(stored.current ? "saved" : "idle");
    })().finally(() => {
      running.current = null;
    });

    return running.current;
  }, [editor, id]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  // Save right away when she switches apps or closes the page, and when she leaves.
  useEffect(() => {
    const flush = () => void saveRef.current();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", flush);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, []);

  function showNotice(message: string) {
    clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(null), NOTICE_MS);
  }

  useEffect(() => () => clearTimeout(noticeTimer.current), []);

  async function goBack(event: React.MouseEvent) {
    event.preventDefault();
    await save();
    // If the save failed, stay here so her writing isn't lost.
    if (dirty.current) return;
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
    await save();
    const ok = await deleteNote(id);
    if (!ok) {
      showNotice("Couldn't delete the note.");
      return;
    }
    router.push("/");
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6">
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
            disabled={!canManage}
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
