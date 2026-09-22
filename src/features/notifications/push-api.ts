// Saving and removing her push subscription in the database. Runs on her
// phone. The database only ever returns her own rows, so nothing here filters
// by owner.

import { supabase } from "@/lib/supabase/client";
import type { SubscriptionKeys } from "./push";

// True once it is saved (or was already there — subscribing twice on the same
// device reuses the same endpoint, which the table only allows one row for).
export async function saveSubscription(keys: SubscriptionKeys): Promise<boolean> {
  try {
    const { error } = await supabase.from("push_subscriptions").insert({
      endpoint: keys.endpoint,
      p256dh: keys.p256dh,
      auth_key: keys.auth,
    });
    // 23505: this endpoint is already saved (hers or, if it somehow matched
    // someone else's device, an impossible collision) — either way, fine.
    return !error || error.code === "23505";
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
