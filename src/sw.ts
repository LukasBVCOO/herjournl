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
import { cleanupOutdatedCaches, matchPrecache, precacheAndRoute } from "workbox-precaching";
import { NavigationRoute, registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst } from "workbox-strategies";

declare const self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Any address opens the app (a refresh on /notes/<id>, the return trip from
// Google sign-in, and so on) — a real page load, not a made-up 404.
//
// This used to always hand back the index.html that was precached when THIS
// service worker installed (createHandlerBoundToURL). That's the file a
// plain refresh got the moment a new version went out, before she'd tapped
// the "new version" Refresh button: still the OLD index.html, pointing at
// the OLD build's hashed script/style files — files a new deploy no longer
// serves. The page went white because the browser couldn't load a script
// that no longer exists, and it only came right on a second refresh once
// the new service worker had had a moment to install itself in the
// background.
//
// Network-first fixes the actual cause: while she has internet, a refresh
// always asks the server for the current index.html (whose script/style
// references always match what's actually deployed, since they're built and
// shipped together). Offline, it falls back to whatever page this was able
// to load last time — the same "read past entries with no internet" promise
// as before, just no longer the thing that goes stale the moment a new
// version ships.
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: "pages",
      networkTimeoutSeconds: 3,
    }),
  ),
);

// The rare case network-first can't cover: offline, and nothing has loaded
// successfully on this service worker yet to fall back to. Rather than a
// browser-level connection-error page, this hands back the shell that was
// precached when the app installed — dated, at worst, never blank.
setCatchHandler(async ({ request }) => {
  if (request.mode === "navigate") return (await matchPrecache("index.html")) ?? Response.error();
  return Response.error();
});

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
      // The large icon on the right, in full colour — this one has read
      // correctly every time it's been tried.
      icon: "/icon-192.png",
      // Android forces this small icon (left) through a monochrome mask,
      // tinted with the site's theme colour (index.html / the manifest). A
      // detailed letterform (the "B") stayed too small to read at that size
      // even once the tint contrast was fixed. badge-512.png is now the
      // app's own sparkle mark instead (the "✦" already used throughout its
      // copy) — plain geometry filling almost the whole frame, so there's no
      // fine detail left to lose at a tiny size.
      badge: "/badge-512.png",
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
