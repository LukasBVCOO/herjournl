import { useEffect, useSyncExternalStore } from "react";
import { getSession, subscribe } from "@/lib/session";
import { syncPushSubscription } from "./push-sync";

// Renders nothing. Mounted once for the whole app: whenever someone is signed
// in, and again each time she comes back to the app, it re-saves this
// phone's push address for her (push-sync.ts says why).
export default function PushSyncOnOpen() {
  const { userId } = useSyncExternalStore(subscribe, getSession, getSession);

  useEffect(() => {
    if (!userId) return;
    void syncPushSubscription();
    function onVisible() {
      if (document.visibilityState === "visible") void syncPushSubscription();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [userId]);

  return null;
}
