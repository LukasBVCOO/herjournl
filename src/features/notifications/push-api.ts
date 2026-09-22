// Saving and removing her push subscription in the database. Runs on her
// phone. The database only ever returns her own rows, so nothing here filters
// by owner.

import { supabase } from "@/lib/supabase/client";
import type { SubscriptionKeys } from "./push";

// True once it is saved. If this device already has a row (same endpoint —
// re-subscribing while already on, say after travelling, or if turning
// notifications off didn't fully clear the old one first), that row is
// refreshed rather than rejected.
export async function saveSubscription(keys: SubscriptionKeys): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("push_subscriptions")
      .upsert(
        {
          endpoint: keys.endpoint,
          p256dh: keys.p256dh,
          auth_key: keys.auth,
          timezone: keys.timezone,
        },
        { onConflict: "endpoint" },
      );
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
