import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useNotes } from "@/features/notes";
import { isOfferDue, readInstallOfferState, recordOfferShown, type InstallOfferState } from "./install-offer";
import InstallSheet from "./install-sheet";
import { getInstallState, promptInstall, subscribe } from "./install-store";

// A phone screen is anything narrower than Tailwind's "md" breakpoint (768px),
// the same cut-off install-button.tsx already uses to decide whether there is
// a home screen to add anything to. Read here in code rather than only
// applied as a class, since the decision now needs to change what is shown,
// not just whether something is shown.
function isPhoneWidth() {
  return window.matchMedia("(max-width: 767px)").matches;
}

// Offers her the install nudge, at most 3 times, at progressively longer gaps
// (install-offer.ts), stopping the moment she has actually installed —
// detected live and remembered on her account, so it works even if she starts
// this on a computer and finishes on her phone.
//
// A real popup, darkened background and all, centered on the screen — not a
// card sitting in the page.
//
// Only ever mounted on the notes list (app.tsx), which is what makes the very
// first offer land at the right moment: she can only reach the list by having
// gone back out of the note she just wrote.
export default function InstallOfferPrompt() {
  const { ready, notes } = useNotes();
  const { installed, canPrompt } = useSyncExternalStore(subscribe, getInstallState, getInstallState);
  const [state, setState] = useState<InstallOfferState | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let current = true;
    void readInstallOfferState().then((result) => {
      if (current) setState(result);
    });
    return () => {
      current = false;
    };
  }, []);

  // Her very first daily note is what makes the first offer (count 0) due.
  // Later offers (count 1, 2) are already on a schedule and do not need it.
  const hasWrittenFirstDailyNote = ready && notes.some((note) => note.focusLabel !== null);
  const due =
    !dismissed &&
    !installed &&
    state !== null &&
    isOfferDue(state, new Date()) &&
    (state.count > 0 || hasWrittenFirstDailyNote);

  useEffect(() => {
    if (due && state) void recordOfferShown(state.count);
  }, [due, state]);

  useEffect(() => {
    if (!due) return;
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setDismissed(true);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [due]);

  if (!due) return null;

  function dismiss() {
    setDismissed(true);
  }

  async function install() {
    if (canPrompt) {
      await promptInstall();
      dismiss();
    } else {
      setHelpOpen(true);
    }
  }

  const phone = isPhoneWidth();

  return (
    <>
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
          aria-labelledby="install-offer-title"
          className="relative w-full max-w-sm animate-fade-in rounded-card bg-surface px-6 py-7 shadow-soft"
        >
          {phone ? (
            <>
              <h2 id="install-offer-title" className="font-serif text-[26px] leading-tight font-medium">
                Get the most out of Becomely <span className="text-accent">✦</span>
              </h2>
              <p className="mt-2 text-[15px] text-ink-soft">
                Add it to your home screen so it opens instantly and your daily
                nudges can reach you.
              </p>
              <button
                type="button"
                onClick={() => void install()}
                className="mt-5 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
              >
                Add to home screen
              </button>
              <button
                ref={closeButton}
                type="button"
                onClick={dismiss}
                className="mt-2 h-[52px] w-full rounded-full text-[15px] text-ink-soft transition-colors duration-200 hover:bg-paper"
              >
                Not now
              </button>
            </>
          ) : (
            <>
              <h2 id="install-offer-title" className="font-serif text-[26px] leading-tight font-medium">
                Take Becomely with you <span className="text-accent">✦</span>
              </h2>
              <p className="mt-2 text-[15px] text-ink-soft">
                Open becomely.co on your phone to add it to your home screen
                — that&rsquo;s where your daily focus and reminders work best.
              </p>
              <button
                ref={closeButton}
                type="button"
                onClick={dismiss}
                className="mt-5 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
              >
                Got it
              </button>
            </>
          )}
        </div>
      </div>
      {helpOpen && (
        <InstallSheet
          onClose={() => {
            setHelpOpen(false);
            dismiss();
          }}
        />
      )}
    </>
  );
}
