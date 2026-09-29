import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useVisionBoardLimit } from "@/features/billing";
import { docFromChecklist, docFromVisionBoard, visionBoardCount } from "@/features/notes";
import { seenValue } from "@/lib/seen";
import { currentCardDay } from "./today";

// Where "Explore more" on the closing card (done-for-today-card.tsx) leads:
// a plain note, a checklist, a vision board, her daily affirmations or her
// birth chart. The X in its corner (or tapping outside) closes it.
export default function ExploreSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const firstOption = useRef<HTMLButtonElement>(null);
  const boardLimit = useVisionBoardLimit();

  useEffect(() => {
    firstOption.current?.focus();
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  function go(path: string) {
    onClose();
    navigate(path);
  }

  function newNote() {
    onClose();
    navigate(`/notes/${crypto.randomUUID()}`, { state: { isNew: true } });
  }

  function newChecklist() {
    onClose();
    navigate(`/notes/${crypto.randomUUID()}`, {
      state: { isNew: true, preset: docFromChecklist() },
    });
  }

  // Until she pays she has room for one board; a second leads to Premium.
  function newVisionBoard() {
    onClose();
    if (boardLimit && visionBoardCount() >= boardLimit.boards) {
      navigate("/premium", { state: { reason: "vision-board" } });
      return;
    }
    navigate(`/notes/${crypto.randomUUID()}`, {
      state: { isNew: true, preset: docFromVisionBoard() },
    });
  }

  // Until she pays: how many of her one vision board she has used, beside
  // that option ("0/1", or "1/1" once she has it).
  const boards = boardLimit ? Math.min(visionBoardCount(), boardLimit.boards) : null;
  const boardsFull = boardLimit !== null && boards !== null && boards >= boardLimit.boards;

  // A gold dot (the same one as on the crown in the bottom bar) beside
  // what she hasn't looked at yet: affirmations not opened today, and her
  // birth chart never opened at all (lib/seen.ts).
  const affirmationsWaiting = seenValue("affirmations-day") !== currentCardDay();
  const chartWaiting = seenValue("birth-chart") === null;

  const options: {
    label: string;
    description: string;
    onSelect: () => void;
    count?: string;
    waiting?: boolean;
  }[] = [
    {
      label: "Write a note",
      description: "Give your thoughts a little space.",
      onSelect: newNote,
    },
    {
      label: "Make a list",
      description: "Organise what's on your mind.",
      onSelect: newChecklist,
    },
    {
      label: "Create a vision board",
      description: boardsFull
        ? "You've made your board. Becomely+ makes room for more."
        : "Picture the life you're calling in.",
      onSelect: newVisionBoard,
      count: boardLimit && boards !== null ? `${boards}/${boardLimit.boards}` : undefined,
    },
    {
      label: "Your daily affirmations",
      description: "Speak today's line into being.",
      onSelect: () => go("/affirmations"),
      waiting: affirmationsWaiting,
    },
    {
      label: "View your birth chart",
      description: "Get to know yourself better.",
      onSelect: () => go("/profile/chart"),
      waiting: chartWaiting,
    },
  ];

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
        aria-labelledby="explore-title"
        className="relative w-full max-w-md animate-fade-in rounded-t-sheet bg-surface px-3 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:bg-card hover:text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <h2 id="explore-title" className="px-3 font-serif text-[28px] leading-tight font-medium">
          Explore more <span className="text-accent">✦</span>
        </h2>

        <div className="mt-4 flex flex-col">
          {options.map((option, index) => (
            <button
              key={option.label}
              ref={index === 0 ? firstOption : undefined}
              type="button"
              onClick={option.onSelect}
              className="flex w-full flex-col items-start gap-0.5 rounded-card px-3 py-3.5 text-left transition-colors duration-200 hover:bg-card"
            >
              <span className="flex items-center gap-2">
                <span className="text-[16px] font-medium text-ink">{option.label}</span>
                {option.count && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium tabular-nums ${
                      boardsFull ? "bg-blush text-accent-ink" : "bg-card text-ink-soft"
                    }`}
                  >
                    {option.count}
                  </span>
                )}
                {option.waiting && (
                  <>
                    <span aria-hidden="true" className="h-2 w-2 rounded-full bg-gold" />
                    <span className="sr-only">(new)</span>
                  </>
                )}
              </span>
              <span className="text-[14px] text-ink-soft">{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
