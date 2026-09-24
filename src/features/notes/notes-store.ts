// Her notes, on her phone. Every screen reads from here, so opening a note or
// going back to the list never waits for the internet.
//
// Like the save queue and the login session, this lives OUTSIDE React and
// screens read it with useSyncExternalStore.
//
// How it stays true:
//   1. When the app opens, her notes are read from the phone's storage and
//      shown straight away.
//   2. In the background, only what changed since last time is fetched from the
//      database, and notes removed for good elsewhere are dropped.
//   3. Every change she makes shows up here first, then goes to the database.
//      If the internet is down, it waits in the save queue and goes up later.

import { registerBeforeReload } from "@/lib/before-reload";
import { getSession, registerSignOutHandler, subscribe as subscribeToSession } from "@/lib/session";
import {
  docFromCardAnswers,
  isEmptyDoc,
  noteToLines,
  parseFocusCard,
  previewFromLines,
  textFromLines,
  titleFromLines,
} from "./content";
import { daysLeft, expiryCutoff } from "./dates";
import * as localDb from "./local-db";
import type { StoredNote } from "./local-db";
import * as api from "./notes-api";
import {
  attachFocusCard,
  flushEverything,
  flushNote,
  getFocusCard,
  hasAnyPending,
  hasPending,
  observeEdits,
  queueSave,
  resumeNote,
} from "./save-queue";
import { saveNoteContent } from "./save";
import type { DeletedNoteSummary, FocusCardCopy, ListedNote } from "./types";

export type NotesSnapshot = {
  // False for the brief moment the phone's copy is being read.
  ready: boolean;
  // True once her notes have been checked against the database at least once.
  hasSynced: boolean;
  // True when the last attempt to reach the database didn't work.
  syncFailed: boolean;
  notes: ListedNote[];
  deleted: DeletedNoteSummary[];
};

const notes = new Map<string, StoredNote>();
// When she last changed each note on this phone, to tell her own newer
// writing apart from an older copy arriving from the database.
const editedAt = new Map<string, number>();

let userId: string | null = null;
let ready = false;
let hasSynced = false;
let syncFailed = false;
let syncing = false;
let lastSyncAt = 0;

const listeners = new Set<() => void>();
let snapshot: NotesSnapshot = emptySnapshot();
let snapshotStale = true;

function emptySnapshot(): NotesSnapshot {
  return {
    ready: false,
    hasSynced: false,
    syncFailed: false,
    notes: [],
    deleted: [],
  };
}

function changed() {
  snapshotStale = true;
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function newestFirst(a: string, b: string) {
  return Date.parse(b) - Date.parse(a);
}

function buildSnapshot(): NotesSnapshot {
  const live: StoredNote[] = [];
  const gone: StoredNote[] = [];
  const cutoff = expiryCutoff().getTime();

  notes.forEach((note) => {
    if (note.deletedAt) {
      // Past 30 days it is as good as gone, even before the database says so.
      if (Date.parse(note.deletedAt) > cutoff) gone.push(note);
    } else if (note.title !== "") {
      // A note with nothing written in it isn't shown; it is cleared away.
      live.push(note);
    }
  });

  // Pinned notes first, then newest first.
  live.sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      newestFirst(a.updatedAt, b.updatedAt),
  );
  // Most recently deleted first.
  gone.sort((a, b) => newestFirst(a.deletedAt!, b.deletedAt!));

  return {
    ready,
    hasSynced,
    syncFailed,
    notes: live.map((note) => ({
      id: note.id,
      title: note.title,
      preview: note.preview,
      text: note.text,
      pinned: note.pinned,
      updatedAt: note.updatedAt,
      // Older copies have no area, so their card's title stands in for it.
      focusLabel: note.focusCard ? (note.focusCard.label ?? note.focusCard.title) : null,
      focusHouse: note.focusCard?.house ?? null,
    })),
    deleted: gone.map((note) => ({
      id: note.id,
      title: note.title,
      preview: note.preview,
      daysLeft: daysLeft(note.deletedAt!),
    })),
  };
}

// Rebuilt only after something changed, so the same object comes back until
// then (React needs that to know nothing has changed).
export function getSnapshot(): NotesSnapshot {
  if (snapshotStale) {
    snapshot = buildSnapshot();
    snapshotStale = false;
  }
  return snapshot;
}

export function isReady() {
  return ready;
}

// One note, straight from the phone. undefined when the phone doesn't have it.
export function getStoredNote(id: string): StoredNote | undefined {
  return notes.get(id);
}

function makeNote(
  id: string,
  content: unknown,
  pinned: boolean,
  updatedAt: string,
  deletedAt: string | null,
  focusCard: FocusCardCopy | null = null,
): StoredNote {
  const lines = noteToLines(content);
  return {
    id,
    content,
    pinned,
    updatedAt,
    deletedAt,
    focusCard,
    title: titleFromLines(lines),
    preview: previewFromLines(lines),
    text: textFromLines(lines),
  };
}

// --- Keeping the phone's storage up to date ---------------------------------

const dirtyRecords = new Set<string>();
let persistTimer: ReturnType<typeof setTimeout> | undefined;

function persistSoon(id: string) {
  dirtyRecords.add(id);
  clearTimeout(persistTimer);
  persistTimer = setTimeout(persistNow, 500);
}

function persistNow() {
  clearTimeout(persistTimer);
  dirtyRecords.forEach((id) => {
    const note = notes.get(id);
    if (note) void localDb.putNote(note);
  });
  dirtyRecords.clear();
}

function put(note: StoredNote) {
  notes.set(note.id, note);
  persistSoon(note.id);
  changed();
}

function drop(id: string) {
  notes.delete(id);
  editedAt.delete(id);
  dirtyRecords.delete(id);
  void localDb.removeNote(id);
  changed();
}

// --- Writing ----------------------------------------------------------------

// Every change in the editor lands here at once, so the list already shows the
// new writing when she goes back to it.
function applyEdit(id: string, doc: unknown) {
  const existing = notes.get(id);
  // A brand new note with nothing written in it doesn't exist yet.
  if (!existing && isEmptyDoc(doc)) return;

  editedAt.set(id, Date.now());
  put(
    makeNote(
      id,
      doc,
      existing?.pinned ?? false,
      new Date().toISOString(),
      existing?.deletedAt ?? null,
      // A note keeps the card it was written from through every edit.
      existing?.focusCard ?? getFocusCard(id),
    ),
  );
}

observeEdits(applyEdit);

// Starts a new note from what she wrote under a daily focus card. The note
// shows in her list at once and goes to the database in the background, like any
// other; it keeps a copy of the card so the question can sit above her writing.
// Returns the note's id, or null when there was nothing written.
export function startNoteFromFocus(
  card: FocusCardCopy,
  answers: { intention: string; belief: string; nextStep: string },
): string | null {
  const cleaned = parseFocusCard(card);
  if (!cleaned || answers.intention.trim() === "") return null;

  const id = crypto.randomUUID();
  attachFocusCard(id, cleaned);
  queueSave(id, docFromCardAnswers(cleaned, answers));
  // Straight away rather than after a second: there is no more typing to wait for.
  void flushNote(id);
  return id;
}

// Pin and delete show at once and are undone if the database refuses.
export async function pinNote(id: string, pinned: boolean) {
  const before = notes.get(id);
  if (!before || before.deletedAt) return false;

  put({ ...before, pinned });
  const ok = await api.pinNote(id, pinned);
  if (!ok && notes.has(id)) put(before);
  return ok;
}

// Moves the note to Recently deleted.
export async function deleteNote(id: string) {
  const before = notes.get(id);
  if (!before || before.deletedAt) return false;

  const deletedAt = new Date().toISOString();
  put({ ...before, deletedAt });
  const ok = await api.deleteNote(id, deletedAt);
  if (!ok && notes.has(id)) put(before);
  return ok;
}

// These two wait for the database first. Their cards give their own message if
// it doesn't work, which they couldn't do if the card had already vanished.
export async function restoreNote(id: string) {
  const before = notes.get(id);
  if (!before?.deletedAt) return false;

  const ok = await api.restoreNote(id);
  if (ok && notes.has(id)) put({ ...before, deletedAt: null });
  return ok;
}

export async function deleteNoteForever(id: string) {
  if (!notes.get(id)?.deletedAt) return false;

  const ok = await api.deleteNoteForever(id);
  if (ok) drop(id);
  return ok;
}

// --- Starting up and staying in step ----------------------------------------

async function begin(uid: string) {
  userId = uid;
  const saved = await localDb.readEverything();
  // She signed out, or someone else signed in, while this was being read.
  if (userId !== uid) return;

  let stored = saved;
  if (saved.owner !== uid) {
    // These notes belong to someone else (or to nobody yet). Never show them.
    await localDb.wipeAll();
    await localDb.setMeta("owner", uid);
    stored = { owner: uid, lastSync: null, notes: [], outbox: [] };
  }

  notes.clear();
  stored.notes.forEach((note) => notes.set(note.id, note));
  hasSynced = stored.lastSync !== null;

  // Writing that never reached the database (she closed the app offline) goes
  // back into the queue, and back onto the screen.
  stored.outbox.forEach(({ id, doc, focusCard }) => {
    const card = parseFocusCard(focusCard);
    // Known before applyEdit, so the note keeps its card while it waits.
    if (card) attachFocusCard(id, card);
    applyEdit(id, doc);
    resumeNote(id, doc, card);
  });

  ready = true;
  changed();
  void syncNow();
}

function reset() {
  userId = null;
  ready = false;
  hasSynced = false;
  syncFailed = false;
  notes.clear();
  editedAt.clear();
  dirtyRecords.clear();
  changed();
}

// Checks the database for anything new and folds it in. Runs quietly after the
// screen has already been drawn from the phone's copy.
export async function syncNow() {
  const uid = userId;
  if (!uid || !ready || syncing) return;

  if (!navigator.onLine) {
    // Nothing to fetch. It only matters if she has never had her notes here.
    if (!hasSynced && !syncFailed) {
      syncFailed = true;
      changed();
    }
    return;
  }

  syncing = true;
  const startedAt = Date.now();
  try {
    const watermark = await localDb.getMeta("watermark");
    // Notes we can safely judge as "removed elsewhere" if the database no
    // longer lists them: not waiting to be saved, and not brand new.
    const settled = new Set(
      [...notes.keys()].filter((id) => !hasPending(id)),
    );

    const rows = await api.fetchChangedNotes(watermark);
    const ids = rows ? await api.fetchAllNoteIds() : null;
    if (!rows || !ids) throw new Error("offline");
    // Signed out, or a different person signed in, during the wait.
    if (userId !== uid) return;

    for (const row of rows) {
      // Her own newer writing wins over an older copy from the database.
      if (hasPending(row.id) || (editedAt.get(row.id) ?? 0) > startedAt) continue;

      // The database's copy of the card wins, but a note it has no card for (one
      // whose first save missed it) keeps the card this phone knows, and the
      // database is given it again so every device agrees.
      const local = notes.get(row.id)?.focusCard ?? null;
      const serverCard = parseFocusCard(row.focus_card);
      if (!serverCard && local) void saveNoteContent(row.id, row.content, local);

      const note = makeNote(
        row.id,
        row.content,
        row.pinned,
        row.updated_at,
        row.deleted_at,
        serverCard ?? local,
      );
      notes.set(row.id, note);
      void localDb.putNote(note);
    }

    // Removed for good on another device.
    const onServer = new Set(ids);
    settled.forEach((id) => {
      const recentlyEdited = (editedAt.get(id) ?? 0) > startedAt;
      if (!onServer.has(id) && !hasPending(id) && !recentlyEdited) drop(id);
    });

    // Notes that were emptied out are cleared away here and in the database.
    let sawEmpty = false;
    [...notes.values()].forEach((note) => {
      if (note.title === "" && !note.deletedAt && !hasPending(note.id)) {
        sawEmpty = true;
        drop(note.id);
      }
    });
    if (sawEmpty) api.removeEmptyNotes();

    const newest = rows.at(-1)?.updated_at;
    if (newest) await localDb.setMeta("watermark", newest);
    await localDb.setMeta("lastSync", new Date().toISOString());
    hasSynced = true;
    syncFailed = false;
    lastSyncAt = Date.now();
  } catch {
    syncFailed = true;
  } finally {
    syncing = false;
    changed();
  }
}

// The "Try again" button.
export function retrySync() {
  syncFailed = false;
  changed();
  void syncNow();
}

// Log out safely. First tries to send anything still waiting; if some writing
// still hasn't gone up, it says so instead of wiping the phone's only copy.
registerSignOutHandler({
  async prepare() {
    await flushEverything();
    return hasAnyPending()
      ? "Some of your writing hasn’t saved online yet. Connect to the internet and try again, so nothing is lost."
      : null;
  },
  async clear() {
    await localDb.wipeAll();
    reset();
  },
});

// Before the app reloads itself for an update, get her writing onto the phone.
registerBeforeReload(async () => {
  persistNow();
  await flushEverything();
});

function onSessionChange() {
  const session = getSession();
  if (session.status === "signed-in" && session.userId && session.userId !== userId) {
    void begin(session.userId);
  } else if (session.status === "signed-out" && userId) {
    reset();
  }
}

if (typeof window !== "undefined") {
  subscribeToSession(onSessionChange);
  onSessionChange();

  // Back online, or back in the app after a while: check for anything new.
  window.addEventListener("online", () => void syncNow());
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      persistNow();
    } else if (Date.now() - lastSyncAt > 30_000) {
      void syncNow();
    }
  });
  window.addEventListener("pagehide", persistNow);
}
