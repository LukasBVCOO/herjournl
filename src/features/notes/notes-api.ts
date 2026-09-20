// Reading and changing notes. Runs on her phone, talking straight to the
// database. The database only ever returns her own notes, so nothing here
// filters by owner.
import { supabase } from "@/lib/supabase/client";
import {
  isNoteId,
  noteToLines,
  previewFromLines,
  textFromLines,
  titleFromLines,
} from "./content";
import { daysLeft } from "./dates";
import type { DeletedNoteSummary, ListedNote } from "./types";

type NoteRow = {
  id: string;
  content: unknown;
  pinned: boolean;
  updated_at: string;
};

type DeletedRow = {
  id: string;
  content: unknown;
  deleted_at: string;
};

function toListedNote(row: NoteRow): ListedNote {
  const lines = noteToLines(row.content);
  return {
    id: row.id,
    title: titleFromLines(lines),
    preview: previewFromLines(lines),
    text: textFromLines(lines),
    pinned: row.pinned,
    updatedAt: row.updated_at,
  };
}

function toDeletedSummary(row: DeletedRow): DeletedNoteSummary {
  const lines = noteToLines(row.content);
  return {
    id: row.id,
    title: titleFromLines(lines),
    preview: previewFromLines(lines),
    daysLeft: daysLeft(row.deleted_at),
  };
}

// A note she emptied out has nothing in it, so it is removed automatically.
// Nothing waits for this: it runs quietly after the screen is already drawn.
export function removeEmptyNotes() {
  void supabase.from("notes").delete().eq("title", "").is("deleted_at", null);
}

// Pinned notes first, then newest first.
export async function fetchNoteList(): Promise<{
  notes: ListedNote[];
  failed: boolean;
}> {
  const { data, error } = await supabase
    .from("notes")
    .select("id, content, pinned, updated_at")
    .is("deleted_at", null)
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });

  if (error) return { notes: [], failed: true };
  return { notes: ((data ?? []) as NoteRow[]).map(toListedNote), failed: false };
}

// Most recently deleted first.
export async function fetchDeletedNotes(): Promise<{
  notes: DeletedNoteSummary[];
  failed: boolean;
}> {
  const { data, error } = await supabase
    .from("notes")
    .select("id, content, deleted_at")
    .not("deleted_at", "is", null)
    .order("deleted_at", { ascending: false });

  if (error) return { notes: [], failed: true };
  return {
    notes: ((data ?? []) as DeletedRow[]).map(toDeletedSummary),
    failed: false,
  };
}

export type ExistingNote = {
  content: unknown;
  pinned: boolean;
  // Set when the note is sitting in Recently deleted.
  deletedAt: string | null;
};

// null when there is no such note, which also covers someone else's note: the
// database simply doesn't return it. Deleted notes ARE returned, so the writing
// screen can say where the note went instead of pretending it never existed.
export async function fetchNoteExisting(
  id: string,
): Promise<ExistingNote | null> {
  if (!isNoteId(id)) return null;

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
}

// Pin, delete, restore and delete forever. Each one returns true when it worked.

// Changes one note that is either in her notes ("live") or in Recently deleted.
async function updateNote(
  id: string,
  fields: { pinned?: boolean; deleted_at?: string | null },
  where: "live" | "deleted",
) {
  if (!isNoteId(id)) return false;

  const query = supabase.from("notes").update(fields).eq("id", id);
  const { data, error } = await (
    where === "live"
      ? query.is("deleted_at", null)
      : query.not("deleted_at", "is", null)
  ).select("id");

  return !error && Boolean(data?.length);
}

export async function pinNote(id: string, pinned: boolean) {
  return updateNote(id, { pinned }, "live");
}

// Moves the note to Recently deleted.
export async function deleteNote(id: string) {
  return updateNote(id, { deleted_at: new Date().toISOString() }, "live");
}

export async function restoreNote(id: string) {
  return updateNote(id, { deleted_at: null }, "deleted");
}

// Only a note already in Recently deleted can be removed for good.
export async function deleteNoteForever(id: string) {
  if (!isNoteId(id)) return false;

  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .not("deleted_at", "is", null)
    .select("id");

  return !error && Boolean(data?.length);
}
