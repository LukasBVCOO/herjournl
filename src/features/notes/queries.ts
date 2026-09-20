// Reading notes from the database, on the server. The database only ever
// returns her own notes, so nothing here filters by owner.
import { createClient } from "@/lib/supabase/server";
import {
  isNoteId,
  noteToLines,
  previewFromLines,
  textFromLines,
  titleFromLines,
} from "./content";
import { daysLeft, expiryCutoff } from "./dates";
import type { DeletedNoteSummary, ListedNote } from "./types";

type Db = Awaited<ReturnType<typeof createClient>>;

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

// Deleted notes are removed for good once they have been in Recently deleted
// for 30 days. Uses the server's clock, never the phone's.
async function removeExpiredNotes(supabase: Db) {
  await supabase
    .from("notes")
    .delete()
    .lt("deleted_at", expiryCutoff().toISOString());
}

// A note she emptied out has nothing in it, so it is removed automatically.
async function removeEmptyNotes(supabase: Db) {
  await supabase.from("notes").delete().eq("title", "").is("deleted_at", null);
}

// Pinned notes first, then newest first.
export async function fetchNoteList(): Promise<{
  notes: ListedNote[];
  failed: boolean;
}> {
  const supabase = await createClient();
  await Promise.all([removeEmptyNotes(supabase), removeExpiredNotes(supabase)]);

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
  const supabase = await createClient();
  await removeExpiredNotes(supabase);

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

// null when the note doesn't exist, was deleted, or belongs to someone else.
export async function fetchNoteContent(
  id: string,
): Promise<{ content: unknown; pinned: boolean } | null> {
  if (!isNoteId(id)) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("notes")
    .select("content, pinned")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  return data;
}
