import { useState } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { runBeforeReload } from "@/lib/before-reload";

const CHECK_EVERY_MS = 60 * 60 * 1000;

// Tells her when a new version of the app has been downloaded, and lets her
// switch to it when she is ready. The app never reloads on its own, so it can't
// interrupt her writing. Tapping Refresh first makes sure her writing is safe.
export default function UpdatePrompt() {
  const [busy, setBusy] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      // The app can stay open for days once it is on the home screen, so ask
      // now and then whether there is something newer.
      if (registration) setInterval(() => void registration.update(), CHECK_EVERY_MS);
    },
  });

  if (!needRefresh || dismissed) return null;

  async function refresh() {
    setBusy(true);
    await runBeforeReload();
    await updateServiceWorker(true);
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-6 pb-[max(6.5rem,env(safe-area-inset-bottom))]">
      <div
        role="status"
        className="pointer-events-auto flex animate-fade-in items-center gap-3 rounded-full bg-ink py-2 pr-2 pl-5 text-[15px] text-paper shadow-soft"
      >
        <span>A new version is ready</span>
        <button
          type="button"
          onClick={refresh}
          disabled={busy}
          className="h-9 rounded-full bg-paper px-4 font-medium text-ink transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "One moment…" : "Refresh"}
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          disabled={busy}
          aria-label="Not now"
          className="flex h-9 w-9 items-center justify-center text-lg text-paper/70"
        >
          ×
        </button>
      </div>
    </div>
  );
}
