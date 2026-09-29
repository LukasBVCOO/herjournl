// Saving and removing her push subscription in the database. Runs on her
// phone. The database only ever returns her own rows, so nothing here filters
// by owner.

import { supabase } from "@/lib/supabase/client";
import type { SubscriptionKeys } from "./push";

// True once it is saved for whoever is signed in now. If this device already
// has a row (hers, refreshed after travelling; or another account's, from
// someone else who used this phone before), it becomes hers. A plain upsert
// can't do that: the other account's row is invisible to her, so the save
// used to fail silently (see the claim_push_subscription migration).
export async function saveSubscription(keys: SubscriptionKeys): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("claim_push_subscription", {
      p_endpoint: keys.endpoint,
      p_p256dh: keys.p256dh,
      p_auth_key: keys.auth,
      p_timezone: keys.timezone,
    });
    return !error;
  } catch {
    return false;
  }
}

// Removes this device's row, if it has one. True either way, unless the
// database could not be reached.
export async function removeSubscription(endpoint: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
    return !error;
  } catch {
    return false;
  }
}
