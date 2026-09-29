import { useState, useSyncExternalStore } from "react";
import { getInstallState, InstallSheet, isIphone, subscribeToInstallState } from "@/features/install";
import { posthog } from "@/lib/posthog";
import { cancelPushSubscription, currentPushSubscription, requestPushSubscription } from "./push";
import { removeSubscription, saveSubscription } from "./push-api";
import { usePushState } from "./use-push";

// A row inside a card the page around it draws (Profile's "App" group), so
// no card of its own here.
const rowClass = "px-5 py-4";
const buttonClass =
  "mt-3 flex h-11 w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60";

// The notifications part of Settings: turn her morning and evening reminders on
// or off. Nothing is sent yet — this only saves where to send it once we build
// that part.
export default function NotificationsSection() {
  const { installed } = useSyncExternalStore(
    subscribeToInstallState,
    getInstallState,
    getInstallState,
  );
  const iphone = isIphone();
  const { state, refresh } = usePushState(iphone, installed);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [helpOpen, setHelpOpen] = useState(false);

  async function turnOn() {
    setBusy(true);
    setProblem(null);
    const keys = await requestPushSubscription();
    if (!keys) {
      setProblem(
        notificationPermissionIsDenied()
          ? "Notifications are blocked for this app. You can allow them again in your browser's settings."
          : "Couldn't turn on notifications. Please try again.",
      );
      setBusy(false);
      refresh();
      return;
    }
    const saved = await saveSubscription(keys);
    if (!saved) setProblem("Saved on this phone, but couldn't reach the server. Try again shortly.");
    else posthog?.capture("notifications_enabled");
    setBusy(false);
    refresh();
  }

  async function turnOff() {
    setBusy(true);
    setProblem(null);
    const subscription = await currentPushSubscription();
    const cancelled = await cancelPushSubscription();
    if (cancelled && subscription) await removeSubscription(subscription.endpoint);
    if (!cancelled) setProblem("Couldn't turn off notifications. Please try again.");
    else posthog?.capture("notifications_disabled");
    setBusy(false);
    refresh();
  }

  return (
    <section className={rowClass}>
      <p className="text-[17px] text-ink">Notifications</p>
      <p className="mt-0.5 text-[15px] leading-snug text-ink-soft">
        A nudge in the morning for today&rsquo;s focus, in the afternoon for
        your affirmation, and in the evening to reflect on your day.
      </p>

      {state.status === "checking" ? null : state.status === "unsupported" ? (
        <p className="mt-3 text-[14px] text-ink-soft">
          Not available on this browser.
        </p>
      ) : state.status === "needs-install" ? (
        <>
          <p className="mt-3 text-[14px] text-ink-soft">
            On iPhone, add Becomely to your home screen first.
          </p>
          <button type="button" onClick={() => setHelpOpen(true)} className={buttonClass}>
            Show me how
          </button>
          {helpOpen && <InstallSheet onClose={() => setHelpOpen(false)} />}
        </>
      ) : state.status === "denied" ? (
        <p className="mt-3 text-[14px] text-ink-soft">
          Notifications are blocked for this app. Allow them again in your
          browser&rsquo;s settings to turn this on.
        </p>
      ) : state.status === "on" ? (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-[15px] text-ink">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold" />
            On for this phone
          </p>
          <button
            type="button"
            onClick={turnOff}
            disabled={busy}
            className="-mr-2 flex h-11 items-center px-2 text-[15px] font-medium text-ink-soft underline decoration-line underline-offset-4 transition-colors duration-200 hover:text-ink disabled:opacity-40"
          >
            {busy ? "One moment…" : "Turn off"}
          </button>
        </div>
      ) : (
        <button type="button" onClick={turnOn} disabled={busy} className={buttonClass}>
          {busy ? "One moment…" : "Allow notifications"}
        </button>
      )}

      {problem && (
        <p role="alert" className="mt-3 animate-fade-in text-[14px] text-alert">
          {problem}
        </p>
      )}
    </section>
  );
}

function notificationPermissionIsDenied() {
  return typeof Notification !== "undefined" && Notification.permission === "denied";
}
