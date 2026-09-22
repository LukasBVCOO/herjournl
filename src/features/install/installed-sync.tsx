import { useEffect } from "react";
import { useSyncExternalStore } from "react";
import { recordInstalled } from "./install-offer";
import { getInstallState, subscribe } from "./install-store";

// Renders nothing. Watches the browser's own live "is this installed" signal
// (install-store.ts) and, the moment it says yes, tells her account. Mounted
// once for the whole app, not just inside the install-offer popup, so this
// works no matter how she installs — the header button, this popup, or her
// browser's own menu.
export default function InstalledSync() {
  const { installed } = useSyncExternalStore(subscribe, getInstallState, getInstallState);

  useEffect(() => {
    if (installed) void recordInstalled();
  }, [installed]);

  return null;
}
