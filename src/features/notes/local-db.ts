// Her notes, kept on her phone. The only file that touches the phone's storage
// (IndexedDB, a small database every browser has built in).
//
// Three drawers:
//   notes    a copy of every note, so screens open with no waiting
//   outbox   writing that hasn't reached the internet yet. This is what keeps
//            her words safe if she closes the app while offline
//   meta     small facts, like whose notes these are
//
// Everything here fails quietly: if the phone won't let us store things (some
// private browsing modes), the app still works, it just can't work offline.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

export type StoredNote = {
  id: string;
  content: unknown;
  pinned: boolean;
  updatedAt: string;
  deletedAt: string | null;
  // Worked out once when saved, so the list doesn't redo it on every open.
  title: string;
  preview: string;
  text: string;
};

interface Schema extends DBSchema {
  notes: { key: string; value: StoredNote };
  outbox: { key: string; value: { id: string; doc: unknown } };
  meta: { key: string; value: string };
}

let dbPromise: Promise<IDBPDatabase<Schema> | null> | null = null;

function database() {
  // Still named after the app's first name on purpose. It never shows on
  // screen, and changing it would make every phone forget its saved notes and
  // any writing not yet uploaded.
  dbPromise ??= openDB<Schema>("herjournl", 1, {
    upgrade(db) {
      db.createObjectStore("notes", { keyPath: "id" });
      db.createObjectStore("outbox", { keyPath: "id" });
      db.createObjectStore("meta");
    },
  }).catch(() => null);
  return dbPromise;
}

async function run<T>(
  work: (db: IDBPDatabase<Schema>) => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    const db = await database();
    return db ? await work(db) : fallback;
  } catch {
    return fallback;
  }
}

export type Everything = {
  owner: string | null;
  lastSync: string | null;
  notes: StoredNote[];
  outbox: { id: string; doc: unknown }[];
};

export function readEverything(): Promise<Everything> {
  return run(
    async (db) => ({
      owner: (await db.get("meta", "owner")) ?? null,
      lastSync: (await db.get("meta", "lastSync")) ?? null,
      notes: await db.getAll("notes"),
      outbox: await db.getAll("outbox"),
    }),
    { owner: null, lastSync: null, notes: [], outbox: [] },
  );
}

export function putNote(note: StoredNote) {
  return run(async (db) => {
    await db.put("notes", note);
    return true;
  }, false);
}

export function removeNote(id: string) {
  return run(async (db) => {
    await db.delete("notes", id);
    return true;
  }, false);
}

// True once the writing is safely on the phone.
export function putOutbox(id: string, doc: unknown) {
  return run(async (db) => {
    await db.put("outbox", { id, doc });
    return true;
  }, false);
}

export function removeOutbox(id: string) {
  return run(async (db) => {
    await db.delete("outbox", id);
    return true;
  }, false);
}

export function setMeta(key: "owner" | "lastSync" | "watermark", value: string) {
  return run(async (db) => {
    await db.put("meta", value, key);
    return true;
  }, false);
}

export function getMeta(key: "owner" | "lastSync" | "watermark") {
  return run(async (db) => (await db.get("meta", key)) ?? null, null);
}

// Empties the phone completely. Used when she logs out, or when a different
// person signs in on the same phone.
export function wipeAll() {
  return run(async (db) => {
    await Promise.all([
      db.clear("notes"),
      db.clear("outbox"),
      db.clear("meta"),
    ]);
    return true;
  }, false);
}
