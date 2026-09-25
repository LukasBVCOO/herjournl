// Her vision board photos, kept on her phone so a board still shows its
// photos with no internet. The only file that touches the phone's storage for
// photos (IndexedDB, the same built-in browser database her notes use, but a
// database of its own so photos can never get in the way of saved writing).
//
// A photo is kept the first time it's shown (or straight away when she adds
// it), under its path in her photo folder. Everything fails quietly: if the
// phone won't store things (some private browsing modes), photos simply need
// the internet each time.
import { openDB, type DBSchema, type IDBPDatabase } from "idb";

type CachedPhoto = { path: string; blob: Blob; savedAt: string };

interface Schema extends DBSchema {
  photos: { key: string; value: CachedPhoto };
}

let dbPromise: Promise<IDBPDatabase<Schema> | null> | null = null;

function database() {
  dbPromise ??= openDB<Schema>("becomely-photos", 1, {
    upgrade(db) {
      db.createObjectStore("photos", { keyPath: "path" });
    },
  }).catch(() => null);
  return dbPromise;
}

async function run<T>(work: (db: IDBPDatabase<Schema>) => Promise<T>, fallback: T): Promise<T> {
  try {
    const db = await database();
    return db ? await work(db) : fallback;
  } catch {
    return fallback;
  }
}

export function readCachedPhoto(path: string): Promise<Blob | null> {
  return run(async (db) => (await db.get("photos", path))?.blob ?? null, null);
}

export function cachePhoto(path: string, blob: Blob) {
  return run(async (db) => {
    await db.put("photos", { path, blob, savedAt: new Date().toISOString() });
    return true;
  }, false);
}

export function removeCachedPhoto(path: string) {
  return run(async (db) => {
    await db.delete("photos", path);
    return true;
  }, false);
}

// Empties the phone's photos. Used when she logs out.
export function wipeCachedPhotos() {
  return run(async (db) => {
    await db.clear("photos");
    return true;
  }, false);
}
