import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { startNoteFromFocus } from "@/features/notes";
import { posthog } from "@/lib/posthog";
import { posthogLogger } from "@/lib/posthog-logger";
import { clearDraft, readDraft, saveDraft, type FocusDraftField } from "./focus-draft";
import { recordDone } from "./today";
import type { DailyFocusCard } from "./types";

// Under the revealed card: where she writes her answers, and "Done", which
// turns them into a note and opens it. A card that has been answered (it
// says so in the database) offers no writing box: the day has one answer,
// and it is a note now.
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

// One prompt and its own answer box. "required" only changes the label — the
// Done button below is what actually enforces it.
function FocusField({
  label,
  required,
  prompt,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  prompt: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-medium tracking-wider text-muted uppercase">
        {label}
        {!required && <span className="normal-case text-muted/70"> · optional</span>}
      </p>
      <p className="mt-2 mb-3 font-serif text-[20px] leading-snug font-medium">{prompt}</p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start writing…"
        aria-label={label}
        rows={4}
        className="field-sizing-content block min-h-32 w-full resize-none rounded-card bg-surface px-5 py-4 text-[17px] leading-relaxed shadow-soft placeholder:text-muted"
      />
    </div>
  );
}

function FocusWriting({ card }: { card: DailyFocusCard }) {
  const navigate = useNavigate();
  // A card saved before the belief/next-step prompts existed only has "My
  // intention" — the same single-question flow it's always had, rather than
  // showing two prompts with nothing to ask.
  const structured = card.beliefPrompt !== null && card.nextStepPrompt !== null;

  // Picks up where she left off if she came back to this card.
  const [intention, setIntention] = useState(() => readDraft(card.localDate, "intention"));
  const [belief, setBelief] = useState(() => readDraft(card.localDate, "belief"));
  const [nextStep, setNextStep] = useState(() => readDraft(card.localDate, "nextStep"));
  const [finished, setFinished] = useState(false);

  function change(field: FocusDraftField, setter: (value: string) => void, value: string) {
    setter(value);
    saveDraft(card.localDate, field, value);
  }

  function done() {
    if (finished || intention.trim() === "") return;
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
        ...(card.reflection ? { reflection: card.reflection } : {}),
        ...(card.beliefPrompt ? { beliefPrompt: card.beliefPrompt } : {}),
        ...(card.nextStepPrompt ? { nextStepPrompt: card.nextStepPrompt } : {}),
      },
      { intention, belief, nextStep },
    );
    if (!id) return;
    setFinished(true);
    clearDraft(card.localDate);
    // Marks the card as done, so it leaves the top of her list for the day.
    recordDone(card);
    posthog?.capture("daily_focus_completed");
    posthogLogger.info("Daily focus response saved.");
    // Replaces this screen, so "back" from the note goes to her notes, not to a
    // card she has already answered.
    navigate(`/notes/${id}`, { replace: true });
  }

  return (
    <section className="mt-4 space-y-6">
      <FocusField
        label="My intention"
        required
        prompt={card.prompt}
        value={intention}
        onChange={(value) => change("intention", setIntention, value)}
      />
      {structured && (
        <>
          <FocusField
            label="A belief to explore"
            prompt={card.beliefPrompt as string}
            value={belief}
            onChange={(value) => change("belief", setBelief, value)}
          />
          <FocusField
            label="My next step"
            prompt={card.nextStepPrompt as string}
            value={nextStep}
            onChange={(value) => change("nextStep", setNextStep, value)}
          />
        </>
      )}
      <button
        type="button"
        onClick={done}
        disabled={finished || intention.trim() === ""}
        className="flex h-12 w-full items-center justify-center rounded-full bg-accent font-medium text-ink shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-40"
      >
        Done
      </button>
    </section>
  );
}
