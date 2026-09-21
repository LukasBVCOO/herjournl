import { useEffect, useRef } from "react";

// A "are you sure?" sheet that slides up from the bottom. The safe answer,
// Cancel, is the one that has focus when it opens.
export default function ConfirmSheet({
  title,
  children,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: React.ReactNode;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    cancelButton.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onCancel}
        className="absolute inset-0 animate-fade-in bg-ink/30"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-md animate-fade-in rounded-t-sheet bg-surface px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <h2 id="confirm-title" className="font-serif text-[28px] leading-tight font-medium">
          {title}
        </h2>
        <div className="mt-3 text-[17px] leading-snug text-ink-soft">{children}</div>

        <button
          type="button"
          onClick={onConfirm}
          className="mt-6 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          {confirmLabel}
        </button>
        <button
          ref={cancelButton}
          type="button"
          onClick={onCancel}
          className="mt-2 h-[52px] w-full rounded-full font-medium text-ink transition-opacity duration-200 hover:opacity-70"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
