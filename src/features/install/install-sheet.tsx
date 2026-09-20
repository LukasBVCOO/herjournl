import { useEffect, useRef } from "react";
import { isIphone } from "./install-store";

// Shown when the browser can't put up its own install dialog. iPhone never can,
// so it always gets these steps; other browsers get them if the dialog isn't on
// offer (for example, it has already been dismissed once).
export default function InstallSheet({ onClose }: { onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const iphone = isIphone();

  useEffect(() => {
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/30"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="install-title"
        className="relative w-full max-w-md animate-fade-in rounded-t-sheet bg-surface px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <h2 id="install-title" className="font-serif text-[28px] leading-tight font-medium">
          Keep HerJournl on your home screen
        </h2>
        <p className="mt-2 text-[15px] text-ink-soft">
          It opens full screen, like any other app, and your notes are there even
          with no internet.
        </p>

        <ol className="mt-5 flex flex-col gap-3 text-[17px]">
          {iphone ? (
            <>
              <Step n={1}>
                Tap the <strong className="font-medium">Share</strong> button at the
                bottom of Safari.
              </Step>
              <Step n={2}>
                Scroll down and tap{" "}
                <strong className="font-medium">Add to Home Screen</strong>.
              </Step>
              <Step n={3}>
                Tap <strong className="font-medium">Add</strong>.
              </Step>
            </>
          ) : (
            <>
              <Step n={1}>
                Open your browser&rsquo;s menu (the three dots).
              </Step>
              <Step n={2}>
                Tap <strong className="font-medium">Install app</strong> or{" "}
                <strong className="font-medium">Add to Home screen</strong>.
              </Step>
              <Step n={3}>
                Tap <strong className="font-medium">Install</strong>.
              </Step>
            </>
          )}
        </ol>

        {iphone && (
          <p className="mt-4 text-sm text-muted">
            This only works from Safari. If you&rsquo;re in another browser, open
            this page in Safari first.
          </p>
        )}

        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          className="mt-6 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span
        aria-hidden="true"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card text-sm text-ink-soft"
      >
        {n}
      </span>
      <span className="pt-0.5 leading-snug">{children}</span>
    </li>
  );
}
