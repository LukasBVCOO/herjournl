import { getSession, registerSignOutHandler } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import { cachePhoto, readCachedPhoto, removeCachedPhoto, wipeCachedPhotos } from "./photo-cache";
import type { ShrunkPhoto } from "./shrink-photo";

// Her vision board photos in the private "vision-board" photo folder
// (supabase/migrations/20260925100000_vision_board_photos.sql). Every photo
// sits in a folder named after her account id, the only folder her account
// is allowed to touch.
//
// Each photo is also kept on her phone (photo-cache.ts) once it has been
// shown or added, so her boards still show their photos with no internet.
const BUCKET = "vision-board";

// Photos already on screen this visit, as addresses the page can show
// straight from the phone's memory.
const shown = new Map<string, string>();
// Photos being fetched right now, so the same photo on the board and in its
// larger view is only fetched once.
const loading = new Map<string, Promise<string | null>>();

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; reason: "offline" | "failed" };

function show(path: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  shown.set(path, url);
  return url;
}

export async function uploadPhoto(tileId: string, photo: ShrunkPhoto): Promise<UploadResult> {
  if (!navigator.onLine) return { ok: false, reason: "offline" };
  const userId = getSession().userId;
  if (!userId) return { ok: false, reason: "failed" };

  const path = `${userId}/${tileId}.${photo.extension}`;
  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, photo.blob, { contentType: photo.type, upsert: false });
    if (error) return { ok: false, reason: navigator.onLine ? "failed" : "offline" };
  } catch {
    return { ok: false, reason: navigator.onLine ? "failed" : "offline" };
  }

  // The picture is on her phone already: keep it for offline, and show that
  // copy instead of downloading it straight back.
  void cachePhoto(path, photo.blob);
  show(path, photo.blob);
  return { ok: true, path };
}

async function load(path: string): Promise<string | null> {
  const saved = await readCachedPhoto(path);
  if (saved) return show(path, saved);

  if (!navigator.onLine) return null;
  try {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error || !data) return null;
    void cachePhoto(path, data);
    return show(path, data);
  } catch {
    return null;
  }
}

// An address that shows the photo, or null when it can't be had right now
// (not on this phone yet and no internet, or the photo is gone).
export function photoLink(path: string): Promise<string | null> {
  const known = shown.get(path);
  if (known) return Promise.resolve(known);

  let pending = loading.get(path);
  if (!pending) {
    pending = load(path).finally(() => loading.delete(path));
    loading.set(path, pending);
  }
  return pending;
}

function forget(path: string) {
  const url = shown.get(path);
  if (url) URL.revokeObjectURL(url);
  shown.delete(path);
}

// Deletes a photo she took off her board, from her phone and her photo
// folder. Quiet on failure: a leftover photo is only ever reachable by her own
// account, and no board points to it.
export async function deletePhoto(path: string) {
  forget(path);
  void removeCachedPhoto(path);
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    // Stays in her private folder, unseen.
  }
}

// Logging out clears every photo off this phone, the same as her notes.
registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    [...shown.keys()].forEach(forget);
    await wipeCachedPhotos();
  },
});
