// Reading and changing her profile row in the database. Only she can see or
// change it: the database's privacy rules see to that. The turning of profile
// into columns, and back, is in profile-row.ts. Nothing here logs what she has
// written.
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";
import {
  PROFILE_COLUMNS,
  profileFromRow,
  rowFromChanges,
  type Profile,
  type ProfileChanges,
  type ProfileRow,
} from "./profile-row";

export { NAME_MAX_LENGTH, tidyName } from "./profile-row";
export type { Profile, ProfileChanges } from "./profile-row";

// null when she has no profile yet. Throws when the database can't be reached.
export async function fetchProfile(): Promise<Profile | null> {
  const userId = getSession().userId;
  if (!userId) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  return profileFromRow(data as ProfileRow);
}

// True when it was all saved.
export async function updateProfile(changes: ProfileChanges): Promise<boolean> {
  const userId = getSession().userId;
  if (!userId) return false;

  try {
    const { error } = await supabase
      .from("profiles")
      .upsert(rowFromChanges(userId, changes));
    return !error;
  } catch {
    return false;
  }
}
