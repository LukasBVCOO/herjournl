import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { getInstallState, subscribeToInstallState } from "@/features/install";
import { posthog } from "@/lib/posthog";
import { hasOfferedNotifications, markNotificationsOffered } from "./notification-offer";
import { notificationPermission, pushSupported, requestPushSubscription } from "./push";
import { saveSubscription } from "./push-api";

// Waits a moment after it becomes due before popping up, so it never appears
// the instant she lands on the screen.
const SHOW_DELAY_MS = 1500;

// Offered once she has actually installed the app — notifications work best
// (and on iPhone, only work at all) once it is on her home screen, so this
// waits for that rather than asking too early. Shown once; if she has already
// answered (yes or no), the browser remembers that itself and this never asks
// again either way.
//
// The same darkened, centered popup style as install-offer-prompt.tsx.
// Mounted once for the whole app (app.tsx), not tied to any one screen, since
// "just installed" can be noticed no matter where she lands.
export default function NotificationOfferPrompt() {
  const { installed } = useSyncExternalStore(subscribeToInstallState, getInstallState, getInstallState);
  const [dismissed, setDismissed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [delayOver, setDelayOver] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  const due =
    !dismissed &&
    installed &&
    pushSupported() &&
    notificationPermission() === "default" &&
    !hasOfferedNotifications();

  // The delay only starts once it is actually due, and resets if it stops
  // being due before the delay is up.
  useEffect(() => {
    if (!due) return;
    const timer = setTimeout(() => setDelayOver(true), SHOW_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setDelayOver(false);
    };
  }, [due]);

  const visible = due && delayOver;

  function dismiss() {
    markNotificationsOffered();
    setDismissed(true);
  }

  useEffect(() => {
    if (!visible) return;
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") dismiss();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [visible]);

  if (!visible) return null;

  async function allow() {
    setBusy(true);
    const keys = await requestPushSubscription();
    if (keys && (await saveSubscription(keys))) posthog?.capture("notifications_enabled");
    // Offered either way: granted or denied, the browser remembers her answer
    // itself from here on, so there is nothing more for this flag to prevent.
    markNotificationsOffered();
    setDismissed(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={dismiss}
        className="absolute inset-0 animate-fade-in bg-ink/30"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-offer-title"
        className="relative w-full max-w-sm animate-fade-in rounded-card bg-surface px-6 py-7 shadow-soft"
      >
        <h2 id="notification-offer-title" className="font-serif text-[26px] leading-tight font-medium">
          Stay in the loop <span className="text-accent">✦</span>
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          Turn on notifications for a nudge when today&rsquo;s focus is ready,
          and a reminder to reflect in the evening.
        </p>
        <button
          type="button"
          onClick={() => void allow()}
          disabled={busy}
          className="mt-5 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
        >
          {busy ? "One moment…" : "Allow notifications"}
        </button>
        <button
          ref={closeButton}
          type="button"
          onClick={dismiss}
          disabled={busy}
          className="mt-2 h-[52px] w-full rounded-full text-[15px] text-ink-soft transition-colors duration-200 hover:bg-paper"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
