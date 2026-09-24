import { useEffect, useId, useRef, useState } from "react";
import { PackIcon } from "@/components/icons";
import { dayLabel } from "@/lib/day-label";
import type { FocusCardCopy } from "../types";

// The original focus stays with the note, even after a new day's card arrives.
export default function FocusInfo({ card }: { card: FocusCardCopy }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const dialogId = useId();

  useEffect(() => {
    if (!open) return;
    const sheet = dialog.current;
    const button = trigger.current;
    const previousOverflow = document.body.style.overflow;
    sheet?.showModal();
    document.body.style.overflow = "hidden";
    return () => {
      sheet?.close();
      document.body.style.overflow = previousOverflow;
      button?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={dialogId}
        onClick={() => setOpen(true)}
        className="flex min-h-11 shrink-0 items-center py-2 text-left text-[13px] text-ink-soft transition-colors duration-200 hover:text-ink active:opacity-80"
      >
        <span className="flex items-center gap-1 font-medium">
          <span className="underline underline-offset-4">View card</span>
          <span className="flex -rotate-45 [&>span]:h-4 [&>span]:w-4">
            <PackIcon name="arrow-right" />
          </span>
        </span>
      </button>

      <dialog
        ref={dialog}
        id={dialogId}
        aria-labelledby={titleId}
        onCancel={() => setOpen(false)}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Native modal backdrops send their clicks to the dialog itself.
          if (event.target !== event.currentTarget) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left || event.clientX > bounds.right ||
            event.clientY < bounds.top || event.clientY > bounds.bottom
          ) setOpen(false);
        }}
        className="fixed inset-0 m-auto max-h-[85dvh] w-[calc(100%-3rem)] max-w-md overflow-y-auto overscroll-contain rounded-sheet border-0 bg-paper px-6 py-7 text-ink shadow-soft backdrop:bg-ink/30 open:animate-fade-in"
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-medium tracking-wider text-muted uppercase">
            Daily focus · {dayLabel(card.date)}
          </p>
          <button
            type="button"
            aria-label="Close daily card"
            onClick={() => setOpen(false)}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-2xl text-ink-soft hover:bg-card"
          >
            ×
          </button>
        </div>
        {card.label && (
          <p className="mt-4 text-[14px] font-medium text-ink-soft">{card.label}</p>
        )}
        <h2 id={titleId} className="mt-2 font-serif text-[32px] leading-tight font-medium">
          {card.title}
        </h2>
        <p className="mt-4 whitespace-pre-line text-[17px] leading-relaxed text-ink-soft">
          {card.statement}
        </p>
        {/* Missing only on a note made before the reflection existed. */}
        {card.reflection && (
          <p className="mt-5 border-t border-line pt-5 text-[15px] leading-relaxed text-ink-soft">
            {card.reflection}
          </p>
        )}
        <div className="mt-5 space-y-4 border-t border-line pt-5">
          <div>
            <p className="text-xs font-medium tracking-wider text-muted uppercase">My intention</p>
            <p className="mt-1 font-serif text-[22px] leading-snug">{card.prompt}</p>
          </div>
          {/* Missing only on a note made before these existed. */}
          {card.beliefPrompt && (
            <div>
              <p className="text-xs font-medium tracking-wider text-muted uppercase">A belief to explore</p>
              <p className="mt-1 font-serif text-[22px] leading-snug">{card.beliefPrompt}</p>
            </div>
          )}
          {card.nextStepPrompt && (
            <div>
              <p className="text-xs font-medium tracking-wider text-muted uppercase">My next step</p>
              <p className="mt-1 font-serif text-[22px] leading-snug">{card.nextStepPrompt}</p>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Back to my note
        </button>
      </dialog>
    </>
  );
}
