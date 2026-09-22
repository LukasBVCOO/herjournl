import { useState, useSyncExternalStore } from "react";
import { getInstallState, InstallSheet, isIphone, subscribeToInstallState } from "@/features/install";
import { cancelPushSubscription, currentPushSubscription, requestPushSubscription } from "./push";
import { removeSubscription, saveSubscription } from "./push-api";
import { usePushState } from "./use-push";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";
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
    setBusy(false);
    refresh();
  }

  return (
    <section className={cardClass}>
      <p className="font-medium text-[17px]">Notifications</p>
      <p className="mt-1 text-[15px] text-ink-soft">
        A nudge in the morning for today&rsquo;s focus, and in the evening to
        reflect on your day.
      </p>

      {state.status === "checking" ? null : state.status === "unsupported" ? (
        <p className="mt-3 text-[14px] text-muted">
          Not available on this browser.
        </p>
      ) : state.status === "needs-install" ? (
        <>
          <p className="mt-3 text-[14px] text-muted">
            On iPhone, add Becomely to your home screen first.
          </p>
          <button type="button" onClick={() => setHelpOpen(true)} className={buttonClass}>
            Show me how
          </button>
          {helpOpen && <InstallSheet onClose={() => setHelpOpen(false)} />}
        </>
      ) : state.status === "denied" ? (
        <p className="mt-3 text-[14px] text-muted">
          Notifications are blocked for this app. Allow them again in your
          browser&rsquo;s settings to turn this on.
        </p>
      ) : state.status === "on" ? (
        <button type="button" onClick={turnOff} disabled={busy} className={buttonClass}>
          {busy ? "One moment…" : "Turn off"}
        </button>
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
