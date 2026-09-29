// Keeps the database's copy of this phone's push address in step with the
// phone itself. No screens.
//
// Two ways they drift apart, both of which silently stopped notifications:
//   - someone else signs in on a phone that already allowed notifications:
//     the browser still has its address, so nothing asks again, but the
//     address was saved under the previous account;
//   - the browser quietly swaps its address for a new one now and then: the
//     server keeps sending to the old one, gets "gone", and deletes it.
// Re-saving the browser's current address for whoever is signed in, each time
// the app is opened, fixes both. It never subscribes anew or asks her
// anything: if she turned notifications off, there is no address to save.

import { getSession, registerSignOutHandler } from "@/lib/session";
import { currentPushSubscription, notificationPermission } from "./push";
import { removeSubscription, saveSubscription } from "./push-api";

export type SyncResult = "saved" | "none" | "failed";

let inFlight: Promise<SyncResult> | null = null;

export function syncPushSubscription(): Promise<SyncResult> {
  inFlight ??= (async (): Promise<SyncResult> => {
    if (getSession().status !== "signed-in") return "none";
    if (notificationPermission() !== "granted") return "none";
    const keys = await currentPushSubscription();
    if (!keys) return "none";
    return (await saveSubscription(keys)) ? "saved" : "failed";
  })().finally(() => {
    inFlight = null;
  });
  return inFlight;
}

// Log out: this phone stops getting her notifications. Runs before the login
// ends, while the database still knows it's her. The browser keeps its
// permission and address, so whoever signs in next picks it up with the sync
// above. If this fails (offline), the next person to sign in here claims the
// address anyway.
registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    const keys = await currentPushSubscription();
    if (keys) await removeSubscription(keys.endpoint);
  },
});
