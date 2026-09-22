import { useEffect, useState } from "react";
import { currentPushSubscription, notificationPermission, pushSupported } from "./push";

export type PushState =
  | { status: "checking" }
  | { status: "unsupported" }
  // On iPhone specifically, push only works once the app is on her home screen.
  | { status: "needs-install" }
  | { status: "off" }
  | { status: "denied" }
  | { status: "on" };

// Where notifications stand for this browser right now. Reads only; turning
// them on or off is done from the screen (notifications-section.tsx), which
// then calls `refresh` to pick up the change.
export function usePushState(isIphone: boolean, installed: boolean) {
  const [state, setState] = useState<PushState>({ status: "checking" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    async function check() {
      if (!pushSupported()) {
        if (current) setState({ status: "unsupported" });
        return;
      }
      if (isIphone && !installed) {
        if (current) setState({ status: "needs-install" });
        return;
      }
      const permission = notificationPermission();
      if (permission === "denied") {
        if (current) setState({ status: "denied" });
        return;
      }
      const subscription = await currentPushSubscription();
      if (current) setState({ status: subscription ? "on" : "off" });
    }
    void check();
    return () => {
      current = false;
    };
  }, [isIphone, installed, attempt]);

  return { state, refresh: () => setAttempt((count) => count + 1) };
}
