import { useEffect, useRef } from "react";
import { isIphone } from "./install-store";

// Safari's own icons, so she can spot the real ones on her screen. The file
// names have spaces in them, so the addresses have them written out.
const SHARE_ICON = "/Apple%20Icons/share%20button%20-%20safari.jpg";
const ADD_TO_HOME_ICON = "/Apple%20Icons/add%20to%20home%20screen%20icon.png";

const bold = "font-medium";

// Shown when the browser can't put up its own install dialog. iPhone never can,
// so it always gets these steps; other browsers get them if the dialog isn't on
// offer (for example, it has already been dismissed once).
export default function InstallSheet({ onClose }: { onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const steps = isIphone() ? iphoneSteps() : otherSteps();

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
          Add to your home screen
        </h2>

        <ol className="mt-5 flex flex-col gap-3 text-[17px]">
          {steps.map((step, index) => (
            <li key={index} className="flex gap-3">
              <span
                aria-hidden="true"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-card text-sm text-ink-soft"
              >
                {index + 1}
              </span>
              <span className="pt-0.5 leading-snug">{step}</span>
            </li>
          ))}
        </ol>

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

// On iPhone only Safari does this reliably, so that is the first thing she is
// told, always.
function iphoneSteps() {
  return [
    <>
      Open this page in <strong className={bold}>Safari</strong>.
    </>,
    <>
      Tap <strong className={bold}>Share</strong>{" "}
      <img
        src={SHARE_ICON}
        alt=""
        aria-hidden="true"
        width={28}
        height={28}
        className="mx-0.5 inline-block h-7 w-7 rounded-md align-middle"
      />{" "}
      at the bottom.
    </>,
    <>
      Tap <strong className={bold}>Add to Home Screen</strong>{" "}
      <img
        src={ADD_TO_HOME_ICON}
        alt=""
        aria-hidden="true"
        width={24}
        height={24}
        className="mx-0.5 inline-block h-6 w-6 align-middle"
      />
      , then <strong className={bold}>Add</strong>.
    </>,
  ];
}

function otherSteps() {
  return [
    <>Open your browser&rsquo;s menu (the three dots).</>,
    <>
      Tap <strong className={bold}>Install app</strong> or{" "}
      <strong className={bold}>Add to Home screen</strong>.
    </>,
  ];
}
