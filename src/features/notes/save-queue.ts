// The save queue: the one place that knows about writing that hasn't reached
// the database yet.
//
// This lives OUTSIDE React on purpose. The editor component can be closed at
// any moment, and if the saving lived inside it, closing would cancel a save
// in progress and lose her writing. Because the queue is a plain module, it
// keeps going — including retrying — long after she is back on the list. That
// is what lets the back button respond instantly.
//
// Her writing is also copied onto the phone (the "outbox") a moment after every
// change. If the internet is down, or she closes the app before a save lands,
// the copy is still there next time and goes up as soon as it can.

import { isEmptyDoc } from "./content";
import { putOutbox, removeOutbox } from "./local-db";
import { saveNoteContent } from "./save";
import type { FocusCardCopy } from "./types";

const SAVE_DELAY_MS = 1000;
const RETRY_DELAY_MS = 4000;
const LOCAL_DELAY_MS = 300;

// "offline" means her writing is safe on the phone but hasn't gone up yet.
// "error" means it isn't safe anywhere, which should be very rare.
export type SaveStatus = "idle" | "saving" | "saved" | "offline" | "error";

type Entry = {
  // The most recent writing, waiting to go to the database.
  doc: unknown;
  dirty: boolean;
  // True once the note exists in the database.
  stored: boolean;
  // True once the latest writing is safely on the phone.
  localSafe: boolean;
  // For a note written from a daily focus card: the card copy that goes up with
  // every save of it.
  focusCard: FocusCardCopy | null;
  status: SaveStatus;
  timer?: ReturnType<typeof setTimeout>;
  localTimer?: ReturnType<typeof setTimeout>;
  running: Promise<void> | null;
  listeners: Set<() => void>;
};

const entries = new Map<string, Entry>();

// The notes list hears about every change through this, so it can show the new
// writing straight away, before it has even been saved.
let editObserver: ((id: string, doc: unknown) => void) | null = null;

export function observeEdits(observer: (id: string, doc: unknown) => void) {
  editObserver = observer;
}

function entryFor(id: string): Entry {
  let entry = entries.get(id);
  if (!entry) {
    entry = {
      doc: null,
      dirty: false,
      stored: false,
      localSafe: false,
      focusCard: null,
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
  if (!entry.dirty && entry.status !== "error" && entry.status !== "offline") {
    setStatus(entry, entry.stored ? "saved" : "idle");
  }
  return entry;
}

// Marks a note as written from a daily focus card. Done before its first save.
export function attachFocusCard(id: string, focusCard: FocusCardCopy) {
  entryFor(id).focusCard = focusCard;
}

// The card copy a note is waiting to send, if it has one.
export function getFocusCard(id: string): FocusCardCopy | null {
  return entries.get(id)?.focusCard ?? null;
}

// Copies the latest writing onto the phone.
async function persistLocally(id: string) {
  const entry = entries.get(id);
  if (!entry) return;
  clearTimeout(entry.localTimer);
  if (!entry.dirty) return;

  const doc = entry.doc;
  const ok = await putOutbox(id, doc, entry.focusCard);
  // Only counts if nothing newer was typed while that was happening.
  entry.localSafe = ok && entry.doc === doc;
  if (entry.localSafe && entry.status === "error") setStatus(entry, "offline");
}

// Called on every change in the editor. Holds the writing, copies it onto the
// phone almost at once, and saves it about a second after she stops typing.
export function queueSave(id: string, doc: unknown) {
  ensureFlushListeners();
  const entry = entryFor(id);
  entry.doc = doc;
  entry.dirty = true;
  entry.localSafe = false;
  setStatus(entry, "saving");
  editObserver?.(id, doc);

  clearTimeout(entry.localTimer);
  entry.localTimer = setTimeout(() => void persistLocally(id), LOCAL_DELAY_MS);
  clearTimeout(entry.timer);
  entry.timer = setTimeout(() => void flushNote(id), SAVE_DELAY_MS);
}

// Picks up writing that was on the phone but never reached the database, for
// example because she closed the app while offline.
export function resumeNote(id: string, doc: unknown, focusCard?: FocusCardCopy | null) {
  ensureFlushListeners();
  const entry = entryFor(id);
  // If she is already typing in this note, that is newer. Leave it alone.
  if (entry.dirty) return;
  if (focusCard) entry.focusCard = focusCard;
  entry.doc = doc;
  entry.dirty = true;
  entry.localSafe = true;
  setStatus(entry, "saving");
  void flushNote(id);
}

// Saves this note now. If a save is already under way it waits for that one,
// which will pick up anything typed in the meantime.
export function flushNote(id: string): Promise<void> {
  const entry = entries.get(id);
  if (!entry) return Promise.resolve();

  clearTimeout(entry.timer);
  if (entry.dirty) void persistLocally(id);
  if (entry.running) return entry.running;
  if (!entry.dirty) return Promise.resolve();

  entry.running = (async () => {
    while (entry.dirty) {
      entry.dirty = false;
      const doc = entry.doc;

      // Nothing written and never saved: don't create an empty note.
      if (!entry.stored && isEmptyDoc(doc)) {
        void removeOutbox(id);
        setStatus(entry, "idle");
        return;
      }

      const ok = await saveNoteContent(id, doc, entry.focusCard);
      if (!ok) {
        // Put it back and try again shortly. Her writing stays in the queue,
        // and on the phone.
        entry.dirty = true;
        setStatus(entry, entry.localSafe ? "offline" : "error");
        entry.timer = setTimeout(() => void flushNote(id), RETRY_DELAY_MS);
        return;
      }

      setStored(entry, true);
      // Only clear the phone's copy if nothing newer arrived during the save.
      if (!entry.dirty) void removeOutbox(id);
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

// Tries to save everything and waits to see how it went. Used before logging
// out and before the app reloads for an update, so nothing she wrote is lost.
// Her writing is on the phone before this returns, even if the internet isn't
// there for the upload.
export async function flushEverything() {
  const ids = [...entries.keys()];
  await Promise.all(ids.map((id) => persistLocally(id)));
  await Promise.all(ids.map((id) => flushNote(id)));
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

export function hasAnyPending() {
  return [...entries.keys()].some(hasPending);
}

export function subscribe(id: string, listener: () => void) {
  const entry = entryFor(id);
  entry.listeners.add(listener);
  return () => {
    entry.listeners.delete(listener);
  };
}

// Save whenever she switches apps or closes the page, and try again the moment
// the internet comes back. Registered once for the whole app, so it still
// covers a note she has already navigated away from.
let flushListenersRegistered = false;

function ensureFlushListeners() {
  if (flushListenersRegistered || typeof window === "undefined") return;
  flushListenersRegistered = true;

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flushAll();
  });
  window.addEventListener("pagehide", flushAll);
  window.addEventListener("online", flushAll);
}
