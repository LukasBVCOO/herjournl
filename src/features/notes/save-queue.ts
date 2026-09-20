// The save queue: the one place that knows about writing that hasn't reached
// the database yet.
//
// This lives OUTSIDE React on purpose. The editor component can be closed at
// any moment, and if the saving lived inside it, closing would cancel a save
// in progress and lose her writing. Because the queue is a plain module, it
// keeps going — including retrying — long after she is back on the list. That
// is what lets the back button respond instantly.

import { isEmptyDoc } from "./content";
import { markNotesChanged } from "./list-sync";
import { saveNoteContent } from "./save";

const SAVE_DELAY_MS = 1000;
const RETRY_DELAY_MS = 4000;

export type SaveStatus = "idle" | "saving" | "saved" | "error";

type Entry = {
  // The most recent writing, waiting to go to the database.
  doc: unknown;
  dirty: boolean;
  // True once the note exists in the database.
  stored: boolean;
  status: SaveStatus;
  timer?: ReturnType<typeof setTimeout>;
  running: Promise<void> | null;
  listeners: Set<() => void>;
};

const entries = new Map<string, Entry>();

function entryFor(id: string): Entry {
  let entry = entries.get(id);
  if (!entry) {
    entry = {
      doc: null,
      dirty: false,
      stored: false,
      status: "idle",
      running: null,
      listeners: new Set(),
    };
    entries.set(id, entry);
  }
  return entry;
}

function setStatus(entry: Entry, status: SaveStatus) {
  if (entry.status === status) return;
  entry.status = status;
  entry.listeners.forEach((listener) => listener());
}

function setStored(entry: Entry, stored: boolean) {
  if (entry.stored === stored) return;
  entry.stored = stored;
  entry.listeners.forEach((listener) => listener());
}

// Tells the queue a note is open. Safe to call more than once: anything still
// waiting to be saved is kept.
export function registerNote(id: string, stored: boolean) {
  ensureFlushListeners();
  const entry = entryFor(id);
  if (stored) setStored(entry, true);
  if (!entry.dirty && entry.status !== "error") {
    setStatus(entry, entry.stored ? "saved" : "idle");
  }
  return entry;
}

// Called on every change in the editor. Holds the writing and saves it about a
// second after she stops typing.
export function queueSave(id: string, doc: unknown) {
  const entry = entryFor(id);
  entry.doc = doc;
  entry.dirty = true;
  setStatus(entry, "saving");
  clearTimeout(entry.timer);
  entry.timer = setTimeout(() => void flushNote(id), SAVE_DELAY_MS);
}

// Saves this note now. If a save is already under way it waits for that one,
// which will pick up anything typed in the meantime.
export function flushNote(id: string): Promise<void> {
  const entry = entries.get(id);
  if (!entry) return Promise.resolve();

  clearTimeout(entry.timer);
  if (entry.running) return entry.running;
  if (!entry.dirty) return Promise.resolve();

  entry.running = (async () => {
    while (entry.dirty) {
      entry.dirty = false;
      const doc = entry.doc;

      // Nothing written and never saved: don't create an empty note.
      if (!entry.stored && isEmptyDoc(doc)) {
        setStatus(entry, "idle");
        return;
      }

      const ok = await saveNoteContent(id, doc);
      if (!ok) {
        // Put it back and try again shortly. Her writing stays in the queue.
        entry.dirty = true;
        setStatus(entry, "error");
        entry.timer = setTimeout(() => void flushNote(id), RETRY_DELAY_MS);
        return;
      }

      markNotesChanged();
      setStored(entry, true);
    }
    setStatus(entry, entry.stored ? "saved" : "idle");
  })().finally(() => {
    entry.running = null;
  });

  return entry.running;
}

export function flushAll() {
  entries.forEach((_entry, id) => void flushNote(id));
}

// The fallbacks are for a note the queue hasn't heard about yet.
export function getStatus(id: string, fallback: SaveStatus = "idle"): SaveStatus {
  return entries.get(id)?.status ?? fallback;
}

export function isStored(id: string, fallback = false) {
  return entries.get(id)?.stored ?? fallback;
}

// True while this note still has writing that hasn't reached the database.
export function hasPending(id: string) {
  const entry = entries.get(id);
  return Boolean(entry && (entry.dirty || entry.running));
}

export function subscribe(id: string, listener: () => void) {
  const entry = entryFor(id);
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
  };
}

// Save whenever she switches apps or closes the page. Registered once for the
// whole app, so it still covers a note she has already navigated away from.
let flushListenersRegistered = false;

function ensureFlushListeners() {
  if (flushListenersRegistered || typeof window === "undefined") return;
  flushListenersRegistered = true;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAll();
  });
  window.addEventListener("pagehide", flushAll);
}
