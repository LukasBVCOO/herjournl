// The service worker: a small background script that keeps a copy of the app on
// the phone (so it opens with no internet) and now also listens for push
// notifications.
//
// This replaces the app files that vite-plugin-pwa used to generate
// automatically (via its "generateSW" mode). It does the same job by hand, plus
// the push handling that generateSW has no way to add:
//   1. keep a copy of the app's own files on the phone (precaching)
//   2. any web address opens the app (so a refresh on a note still works)
//   3. wait for her to tap Refresh before switching to a new version
//   4. show a notification when one arrives, and open the app when she taps it
//
// Her notes are never stored here: they live in the phone's IndexedDB database
// (see notes-store.ts), and nothing from Supabase is cached, so nobody's
// writing ends up in the wrong place.

/// <reference lib="webworker" />
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Any address opens the app (a refresh on /notes/<id>, the return trip from
// Google sign-in, and so on), the same as navigateFallback did before.
registerRoute(new NavigationRoute(createHandlerBoundToURL("index.html")));

// registerType "prompt": a new version sits waiting until she taps Refresh
// (update-prompt.tsx), which sends this message.
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

// --- Push notifications -----------------------------------------------------

type PushPayload = { title: string; body: string; url?: string };

// Read cautiously: a push's contents come from outside this code, and a
// malformed one must never crash the handler or show a blank notification.
function readPayload(event: PushEvent): PushPayload {
  const fallback: PushPayload = { title: "Becomely", body: "You have something new." };
  try {
    const data: unknown = event.data?.json();
    if (typeof data !== "object" || data === null) return fallback;
    const { title, body, url } = data as Record<string, unknown>;
    return {
      title: typeof title === "string" && title !== "" ? title : fallback.title,
      body: typeof body === "string" && body !== "" ? body : fallback.body,
      url: typeof url === "string" && url !== "" ? url : undefined,
    };
  } catch {
    return fallback;
  }
}

self.addEventListener("push", (event) => {
  const { title, body, url } = readPayload(event);
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      // Android tints and masks whatever this points to itself, so it has to
      // already be a plain white shape on full transparency — a normal
      // full-colour icon (icon-192.png) gets flattened into a solid blob
      // instead of the "B", which is what made notifications look "very
      // basic, no icon" on Android. badge-192.png is a white silhouette of
      // the same mark on transparency, made for exactly this.
      badge: "/badge-192.png",
      // Where tapping it should open. Kept on the notification object itself
      // (not just read from the push payload again) because the payload is not
      // available any more once a notificationclick event fires.
      data: { url: url ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/";

  event.waitUntil(
    (async () => {
      const clientList = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      // If the app is already open in a tab, use that tab rather than opening a
      // second one.
      const existing = clientList.find((client) => "focus" in client);
      if (existing) {
        await existing.focus();
        if ("navigate" in existing) await (existing as WindowClient).navigate(url);
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
