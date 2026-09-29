import { useEffect, useState } from "react";
import { notificationPermission, pushSupported } from "./push";
import { syncPushSubscription } from "./push-sync";

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
      // "On" means the server can reach her here, not just that the browser
      // has an address: re-save it for her account first, since it may still
      // be saved under someone who used this phone before. "failed" is
      // usually no internet, where the browser's word is the best we have.
      const result = await syncPushSubscription();
      if (current) setState({ status: result === "none" ? "off" : "on" });
    }
    void check();
    return () => {
      current = false;
    };
  }, [isIphone, installed, attempt]);

  return { state, refresh: () => setAttempt((count) => count + 1) };
}
