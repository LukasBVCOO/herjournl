// Talking to the database. Runs on her phone. The database only ever returns
// her own notes, so nothing here filters by owner.
//
// The screens don't call this directly: they read from the copy of her notes on
// the phone (notes-store.ts), which uses this to stay up to date.
import { supabase } from "@/lib/supabase/client";
import { isNoteId } from "./content";

export type ServerNote = {
  id: string;
  content: unknown;
  pinned: boolean;
  updated_at: string;
  deleted_at: string | null;
};

const PAGE_SIZE = 500;

// Notes changed since the given moment (or all of them, the very first time).
// The moment always comes from the database's clock, never the phone's, so a
// phone with the wrong date can't make it skip anything. Returns null when the
// internet didn't cooperate.
export async function fetchChangedNotes(
  since: string | null,
): Promise<ServerNote[] | null> {
  const all: ServerNote[] = [];
  try {
    for (let from = 0; ; from += PAGE_SIZE) {
      let query = supabase
        .from("notes")
        .select("id, content, pinned, updated_at, deleted_at")
        .order("updated_at", { ascending: true })
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      // "At or after", so two notes changed in the same instant can't be missed.
      if (since) query = query.gte("updated_at", since);

      const { data, error } = await query;
      if (error) return null;
      const page = (data ?? []) as ServerNote[];
      all.push(...page);
      if (page.length < PAGE_SIZE) return all;
    }
  } catch {
    return null;
  }
}

// Every note id she has, and nothing else. That is how the phone notices a note
// was removed for good somewhere else.
export async function fetchAllNoteIds(): Promise<string[] | null> {
  const ids: string[] = [];
  try {
    for (let from = 0; ; from += PAGE_SIZE) {
      const { data, error } = await supabase
        .from("notes")
        .select("id")
        .order("id", { ascending: true })
        .range(from, from + PAGE_SIZE - 1);
      if (error) return null;
      const page = (data ?? []) as { id: string }[];
      ids.push(...page.map((row) => row.id));
      if (page.length < PAGE_SIZE) return ids;
    }
  } catch {
    return null;
  }
}

export type ExistingNote = {
  content: unknown;
  pinned: boolean;
  // Set when the note is sitting in Recently deleted.
  deletedAt: string | null;
};

// For a note the phone doesn't have yet, such as one opened from a link before
// the first sync. null when there is no such note, which also covers someone
// else's note: the database simply doesn't return it.
export async function fetchNoteExisting(
  id: string,
): Promise<ExistingNote | null> {
  if (!isNoteId(id)) return null;

  try {
    const { data } = await supabase
      .from("notes")
      .select("content, pinned, deleted_at")
      .eq("id", id)
      .maybeSingle();
    if (!data) return null;
    return {
      content: data.content,
      pinned: data.pinned,
      deletedAt: data.deleted_at,
    };
  } catch {
    return null;
  }
}

// A note she emptied out has nothing in it, so it is removed automatically.
// Nothing waits for this: it runs quietly in the background.
export function removeEmptyNotes() {
  void supabase
    .from("notes")
    .delete()
    .eq("title", "")
    .is("deleted_at", null)
    .then(
      () => {},
      () => {},
    );
}

// Pin, delete, restore and delete forever. Each one returns true when it worked.

// Changes one note that is either in her notes ("live") or in Recently deleted.
async function updateNote(
  id: string,
  fields: { pinned?: boolean; deleted_at?: string | null },
  where: "live" | "deleted",
) {
  if (!isNoteId(id)) return false;

  try {
    const query = supabase.from("notes").update(fields).eq("id", id);
    const { data, error } = await (
      where === "live"
        ? query.is("deleted_at", null)
        : query.not("deleted_at", "is", null)
    ).select("id");

    return !error && Boolean(data?.length);
  } catch {
    return false;
  }
}

export async function pinNote(id: string, pinned: boolean) {
  return updateNote(id, { pinned }, "live");
}

// Moves the note to Recently deleted.
export async function deleteNote(id: string, deletedAt: string) {
  return updateNote(id, { deleted_at: deletedAt }, "live");
}

export async function restoreNote(id: string) {
  return updateNote(id, { deleted_at: null }, "deleted");
}

// Only a note already in Recently deleted can be removed for good.
export async function deleteNoteForever(id: string) {
  if (!isNoteId(id)) return false;

  try {
    const { data, error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .not("deleted_at", "is", null)
      .select("id");

    return !error && Boolean(data?.length);
  } catch {
    return false;
  }
}
