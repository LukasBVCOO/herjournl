import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { startNoteFromFocus } from "@/features/notes";
import { clearDraft, readDraft, saveDraft } from "./focus-draft";
import { recordDone } from "./today";
import type { DailyFocusCard } from "./types";

// Under the revealed card: where she writes her answer, and "Done", which turns
// it into a note and opens it. A card that has been answered (it says so in the
// database) offers no writing box: the day has one answer, and it is a note now.
export default function FocusResponse({ card }: { card: DailyFocusCard }) {
  return card.done ? (
    <section className="mt-6 animate-fade-in text-center">
      <p className="font-serif text-[24px] leading-tight text-ink-soft">
        You&rsquo;ve answered today&rsquo;s focus <span className="text-accent">✦</span>
      </p>
      <p className="mt-2 text-[15px] text-ink-soft">
        Your answer is in your notes. Your next focus arrives tomorrow.
      </p>
      <Link
        to="/"
        className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
      >
        Back to your notes
      </Link>
    </section>
  ) : (
    <FocusWriting card={card} />
  );
}

function FocusWriting({ card }: { card: DailyFocusCard }) {
  const navigate = useNavigate();
  // Picks up where she left off if she came back to this card.
  const [text, setText] = useState(() => readDraft(card.localDate));
  const [finished, setFinished] = useState(false);

  function change(value: string) {
    setText(value);
    saveDraft(card.localDate, value);
  }

  function done() {
    if (finished || text.trim() === "") return;
    const id = startNoteFromFocus(
      {
        date: card.localDate,
        title: card.title,
        statement: card.statement,
        prompt: card.prompt,
        label: card.label,
        // Only a full-personalisation card has a real house (see
        // types.ts's DailyFocusCard) — never stood in for on a reduced one.
        ...(card.activeHouse ? { house: card.activeHouse } : {}),
      },
      text,
    );
    if (!id) return;
    setFinished(true);
    clearDraft(card.localDate);
    // Marks the card as done, so it leaves the top of her list for the day.
    recordDone(card);
    // Replaces this screen, so "back" from the note goes to her notes, not to a
    // card she has already answered.
    navigate(`/notes/${id}`, { replace: true });
  }

  return (
    <section className="mt-4">
      <textarea
        value={text}
        onChange={(event) => change(event.target.value)}
        placeholder="Start writing…"
        aria-label="Your answer"
        rows={6}
        className="field-sizing-content block min-h-44 w-full resize-none rounded-card bg-surface px-5 py-4 text-[17px] leading-relaxed shadow-soft placeholder:text-muted"
      />
      <button
        type="button"
        onClick={done}
        disabled={finished || text.trim() === ""}
        className="mt-4 flex h-12 w-full items-center justify-center rounded-full bg-accent font-medium text-ink shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-40"
      >
        Done
      </button>
    </section>
  );
}
