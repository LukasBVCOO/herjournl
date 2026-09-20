"use server";

// Pin, delete, restore and delete forever. These run on the server so the
// deleted date comes from the server's clock, not from her phone's. Each one
// returns true when it worked.
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isNoteId } from "./content";

function refreshScreens() {
  revalidatePath("/");
  revalidatePath("/recently-deleted");
}

// Changes one note that is either in her notes ("live") or in Recently deleted.
async function updateNote(
  id: string,
  fields: { pinned?: boolean; deleted_at?: string | null },
  where: "live" | "deleted",
) {
  if (!isNoteId(id)) return false;

  const supabase = await createClient();
  const query = supabase.from("notes").update(fields).eq("id", id);
  const { data, error } = await (
    where === "live"
      ? query.is("deleted_at", null)
      : query.not("deleted_at", "is", null)
  ).select("id");

  if (error || !data?.length) return false;
  refreshScreens();
  return true;
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

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", id)
    .not("deleted_at", "is", null)
    .select("id");

  if (error || !data?.length) return false;
  refreshScreens();
  return true;
}
