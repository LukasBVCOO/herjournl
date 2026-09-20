import { useState, useSyncExternalStore } from "react";
import { DownloadIcon } from "./download-icon";
import InstallSheet from "./install-sheet";
import { getInstallState, promptInstall, subscribe } from "./install-store";

// The download icon in the notes list header. Gone once the app is installed.
export default function InstallButton() {
  const { installed, canPrompt } = useSyncExternalStore(
    subscribe,
    getInstallState,
    getInstallState,
  );
  const [helpOpen, setHelpOpen] = useState(false);

  if (installed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => (canPrompt ? void promptInstall() : setHelpOpen(true))}
        aria-label="Add to home screen"
        // Only offered on phone-sized screens; on a computer there is no home
        // screen to add it to. The width, not the device, decides, so it still
        // shows when a browser window is shrunk to phone size for testing.
        className="flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink md:hidden"
      >
        <DownloadIcon />
      </button>
      {helpOpen && <InstallSheet onClose={() => setHelpOpen(false)} />}
    </>
  );
}
