import { useEffect, useState } from "react";
import { dayLabel } from "@/lib/day-label";
import type { FocusCardCopy } from "../types";

// The small ✦ in the corner of a note written from a daily focus card. Tapping it
// shows the day and the card's own words, which stay with the note for good.
export default function FocusInfo({ card }: { card: FocusCardCopy }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="The focus this note was written for"
        aria-expanded={open}
        onClick={() => setOpen((isOpen) => !isOpen)}
        className="flex h-11 w-9 items-center justify-center text-[18px] text-accent transition-opacity duration-200 hover:opacity-80"
      >
        ✦
      </button>

      {open && (
        <>
          {/* Tapping anywhere else closes it */}
          <button
            type="button"
            tabIndex={-1}
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-10 cursor-default"
          />
          <div className="absolute top-full right-0 z-20 mt-1 w-72 animate-fade-in rounded-card bg-surface px-5 py-4 shadow-soft">
            <p className="text-xs font-medium tracking-wider text-muted uppercase">
              {dayLabel(card.date)}
            </p>
            {card.label && (
              <p className="mt-2 text-[13px] font-medium text-ink-soft">{card.label}</p>
            )}
            <p className="mt-1 font-serif text-[22px] leading-tight font-medium">
              {card.title}
            </p>
            <p className="mt-2 text-[14px] leading-snug text-ink-soft">
              {card.statement}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
