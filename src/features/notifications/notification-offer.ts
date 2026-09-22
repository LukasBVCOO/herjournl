// Whether to offer turning notifications on, once she has actually installed
// the app. Kept per device (not her account): a push subscription is already a
// per-device thing (one row per phone/browser in push_subscriptions), and once
// she has answered — yes or no — the browser remembers that itself forever
// (Notification.permission), so there is nothing to repeat here across
// devices the way there was for the install nudge.
//
// Shown once. If she taps "Not now" rather than actually deciding, the
// browser's own permission is still "default" and would otherwise ask again
// every time she reopens the app — this one small flag stops that.

import { getSession, registerSignOutHandler } from "@/lib/session";

const PREFIX = "becomely:notification-offer-shown:";

function key(): string | null {
  const userId = getSession().userId;
  return userId ? `${PREFIX}${userId}` : null;
}

export function hasOfferedNotifications(): boolean {
  try {
    const k = key();
    return Boolean(k && localStorage.getItem(k));
  } catch {
    return false;
  }
}

export function markNotificationsOffered() {
  try {
    const k = key();
    if (k) localStorage.setItem(k, "1");
  } catch {
    // Nothing to do: worst case, she is offered again next time.
  }
}

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      // Storage blocked: there is nothing stored to clear.
    }
  },
});
