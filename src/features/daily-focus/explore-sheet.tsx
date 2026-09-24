import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { docFromChecklist } from "@/features/notes";

// Where "Explore more" on the closing card (done-for-today-card.tsx) leads:
// a plain checklist, a plain note, her birth chart, or just a look back at
// what she's already written — the last one only closes this sheet, since
// her journal is already the list sitting right behind it.
export default function ExploreSheet({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const firstOption = useRef<HTMLButtonElement>(null);

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

  const options = [
    {
      label: "Make a list",
      description: "Organise what's on your mind.",
      onSelect: newChecklist,
    },
    {
      label: "Write a note",
      description: "Give your thoughts a little space.",
      onSelect: newNote,
    },
    {
      label: "View your birth chart",
      description: "Get to know yourself better.",
      onSelect: () => go("/profile/chart"),
    },
    {
      label: "Revisit your journal",
      description: "Look back on past entries.",
      onSelect: onClose,
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
        <h2 id="explore-title" className="px-3 font-serif text-[28px] leading-tight font-medium">
          Explore more
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
              <span className="text-[16px] font-medium text-ink">{option.label}</span>
              <span className="text-[14px] text-ink-soft">{option.description}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
