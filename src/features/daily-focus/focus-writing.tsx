import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { startNoteFromFocus } from "@/features/notes";
import { posthog } from "@/lib/posthog";
import { posthogLogger } from "@/lib/posthog-logger";
import { clearDraft, readDraft, saveDraft, type FocusDraftField } from "./focus-draft";
import { OpenBookIcon, RisingSunIcon, SproutIcon } from "./prompt-icons";
import { recordDone } from "./today";
import type { DailyFocusCard } from "./types";

// Under the revealed card: where she writes her answers, and "Done", which
// turns them into a note and opens it. A card that has been answered (it
// says so in the database) offers no writing box: the day has one answer,
// and it is a note now.
export default function FocusResponse({
  card,
  affirmationSlot,
}: {
  card: DailyFocusCard;
  affirmationSlot?: ReactNode;
}) {
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
    <FocusWriting card={card} affirmationSlot={affirmationSlot} />
  );
}

// One prompt and its own answer box, on a white card of its own: a small
// gold mark on the left, the label and question beside it, a hairline, then
// a soft writing box. The one required question ("My intention") is outlined
// in gold so it's clear where to begin; the other two say "Optional". That
// label is only a signal — the Done button below is what actually enforces it.
function FocusField({
  label,
  icon,
  required,
  prompt,
  value,
  onChange,
}: {
  label: string;
  icon: ReactNode;
  required?: boolean;
  prompt: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div
      className={`rounded-card bg-surface px-5 pt-5 pb-5 shadow-soft ${required ? "border border-gold/60" : ""}`}
    >
      <div className="grid grid-cols-[2.25rem_1fr] gap-x-3">
        <span className="pt-1 text-gold">{icon}</span>
        <div>
          <p className="text-xs font-medium tracking-[0.14em] text-ink-soft uppercase">
            {label}
            {!required && <span className="tracking-normal text-muted normal-case"> · Optional</span>}
          </p>
          <p className="mt-2 font-serif text-[21px] leading-snug font-medium text-ink">{prompt}</p>
        </div>
      </div>
      <div aria-hidden="true" className="mt-5 border-t border-line" />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Start writing…"
        aria-label={label}
        rows={3}
        className="field-sizing-content mt-5 block min-h-28 w-full resize-none rounded-2xl bg-paper px-5 py-4 text-[17px] leading-relaxed text-ink placeholder:text-muted focus:outline-2 focus:outline-offset-2 focus:outline-gold/50"
      />
    </div>
  );
}

function FocusWriting({
  card,
  affirmationSlot,
}: {
  card: DailyFocusCard;
  affirmationSlot?: ReactNode;
}) {
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
    <section className="mt-5 space-y-5">
      <FocusField
        label="My intention"
        icon={<SproutIcon />}
        required
        prompt={card.prompt}
        value={intention}
        onChange={(value) => change("intention", setIntention, value)}
      />
      {structured && (
        <>
          <FocusField
            label="A belief to explore"
            icon={<OpenBookIcon />}
            prompt={card.beliefPrompt as string}
            value={belief}
            onChange={(value) => change("belief", setBelief, value)}
          />
          <FocusField
            label="My next step"
            icon={<RisingSunIcon />}
            prompt={card.nextStepPrompt as string}
            value={nextStep}
            onChange={(value) => change("nextStep", setNextStep, value)}
          />
        </>
      )}
      {/* The morning 3x of the day's affirmation, as the last part of the
          entry. Never required: Done works whether she's said it or not. */}
      {affirmationSlot}
      <button
        type="button"
        onClick={done}
        disabled={finished || intention.trim() === ""}
        className="flex h-14 w-full items-center justify-center rounded-full bg-accent-ink/80 text-[17px] font-medium text-paper shadow-soft transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-45"
      >
        Done
      </button>
    </section>
  );
}
