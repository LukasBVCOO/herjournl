import { useId, useState, useSyncExternalStore } from "react";
import { posthog } from "@/lib/posthog";
import InstallSheet from "./install-sheet";
import { getInstallState, promptInstall, subscribe } from "./install-store";

const primaryButton =
  "h-10 rounded-full bg-ink px-4 text-[14px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 active:opacity-80";
const quietButton =
  "h-10 rounded-full px-3 text-[14px] font-medium text-ink-soft transition-colors duration-200 hover:text-ink";

// The "Get the Becomely App" card itself, used in two places:
//   - on the notes list (install-offer-card.tsx), which can be put away:
//     pass `onPutAway` for the × and "Not now";
//   - on Profile (profile-install-card.tsx), which is always there: no
//     `onPutAway`, so just Download.
// "Download" opens the browser's own install dialog where it has one, and the
// step-by-step "Add to Home Screen" guide where it doesn't (iPhone). Only ever
// shown on a phone: each caller checks isPhoneWidth (install-display.ts).
export default function InstallAppCard({
  onPutAway,
  source,
  className = "",
}: {
  onPutAway?: () => void;
  // Which card was tapped, for analytics ("notes_list" / "profile").
  source: string;
  className?: string;
}) {
  const { canPrompt } = useSyncExternalStore(subscribe, getInstallState, getInstallState);
  const [helpOpen, setHelpOpen] = useState(false);
  const titleId = useId();

  async function download() {
    posthog?.capture("install_offer_download_tapped", { native_prompt: canPrompt, source });
    if (canPrompt) {
      await promptInstall();
    } else {
      setHelpOpen(true);
    }
  }

  return (
    <section
      aria-labelledby={titleId}
      className={`relative rounded-card bg-surface px-3.5 pt-3.5 pb-2.5 shadow-soft ${className}`}
    >
      {onPutAway && (
        // The little ×: the same as "Not now". The tap area is 40px even
        // though the mark is small, tucked into the corner.
        <button
          type="button"
          onClick={onPutAway}
          aria-label="Close"
          className="absolute top-1 right-1 flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      )}
      <div className="flex items-center gap-3">
        <img src="/icon-192.png" alt="" width={40} height={40} className="h-10 w-10 shrink-0 rounded-[11px]" />
        <div className={`min-w-0 ${onPutAway ? "pr-7" : ""}`}>
          <h2 id={titleId} className="text-[16px] leading-tight font-medium text-ink">
            Get the Becomely App
          </h2>
          <p className="mt-0.5 text-[13px] leading-snug text-ink-soft">
            Your daily focus in one tap, and reminders that actually reach you.
          </p>
        </div>
      </div>

      <div className="mt-1.5 flex justify-end">
        {onPutAway && (
          <button type="button" onClick={onPutAway} className={quietButton}>
            Not now
          </button>
        )}
        <button type="button" onClick={() => void download()} className={primaryButton}>
          Download
        </button>
      </div>

      {helpOpen && <InstallSheet onClose={() => setHelpOpen(false)} />}
    </section>
  );
}
