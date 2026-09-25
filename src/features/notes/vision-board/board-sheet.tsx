import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useKeyboardOffset } from "../editor/use-keyboard-offset";

// The frame every vision board sheet shares: slides up from the bottom, rides
// above the phone's keyboard, closes on a tap outside it or Escape.
//
// Drawn into the page body, not inside the note: the board sits inside the
// editor's own typing area, and a text box in there would have its keys
// picked up by the note's editor as well.
export default function BoardSheet({
  labelId,
  onClose,
  onSubmit,
  children,
}: {
  labelId: string;
  onClose: () => void;
  // Given for a sheet that is a form (the word sheet), so Enter-to-save and
  // the phone keyboard's Go button work.
  onSubmit?: (event: React.FormEvent) => void;
  children: React.ReactNode;
}) {
  const keyboard = useKeyboardOffset();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const panelClass =
    "relative w-full max-w-md animate-fade-in rounded-t-sheet bg-surface px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet";

  return createPortal(
    // ph-no-capture: the analytics tool never records what's in these sheets
    // (her words, her photos).
    <div className="ph-no-capture fixed inset-0 z-50 flex items-end justify-center" style={{ paddingBottom: keyboard }}>
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-ink/30"
      />
      {onSubmit ? (
        <form role="dialog" aria-modal="true" aria-labelledby={labelId} onSubmit={onSubmit} className={panelClass}>
          {children}
        </form>
      ) : (
        <div role="dialog" aria-modal="true" aria-labelledby={labelId} className={panelClass}>
          {children}
        </div>
      )}
    </div>,
    document.body,
  );
}

export const primaryButtonClass =
  "h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-40";
export const quietButtonClass =
  "h-[52px] w-full rounded-full font-medium text-ink transition-opacity duration-200 hover:opacity-70";
export const removeButtonClass =
  "h-[52px] w-full rounded-full font-medium text-alert transition-opacity duration-200 hover:opacity-70";
