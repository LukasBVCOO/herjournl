import { useEffect, useId, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router";
import { BackIcon } from "@/components/icons";
import { appendToNote, findTodaysFocusNoteId } from "@/features/notes";
import { posthog } from "@/lib/posthog";
import { posthogLogger } from "@/lib/posthog-logger";
import { deviceTimeZone, localHourIn } from "./local-day";
import { REFLECT_HOUR } from "./reflect-slot";
import { recordReflectionDone, recordReflectionOpened } from "./today";
import type { DailyFocusCard } from "./types";
import { useTodaysFocus } from "./use-todays-focus";

const buttonClass =
  "mt-5 inline-flex h-11 items-center rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90";

// Shown when there is no reflection to have, and why. Never a made-up one —
// same shape as focus-screen.tsx's own Notice.
function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 animate-fade-in text-center">
      <p className="font-serif text-[28px] leading-tight font-medium">{title}</p>
      <div className="mt-3 flex flex-col items-center text-[16px] leading-snug text-ink-soft">
        {children}
      </div>
    </section>
  );
}

// See ReflectScreen's own affirmationSlot.
type AffirmationSlot = (onComplete: () => void) => ReactNode;

function ReflectWriting({
  card,
  affirmationSlot,
}: {
  card: DailyFocusCard;
  affirmationSlot?: AffirmationSlot;
}) {
  const navigate = useNavigate();
  const recapId = useId();
  const writingId = useId();
  const [text, setText] = useState("");

  // After the ninth repetition, straight on to the recap: bring her question
  // into view and put the cursor in the writing box.
  function toRecap() {
    document.getElementById(recapId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById(writingId)?.focus({ preventScroll: true });
  }
  const [finished, setFinished] = useState(false);
  // Only expected if today's note has since been deleted — the list slot
  // already guarantees the morning card (and so the note) exists before this
  // screen is ever reachable.
  const [missingNote, setMissingNote] = useState(false);

  function done() {
    if (finished || text.trim() === "" || !card.eveningReflectionPrompt) return;
    const noteId = findTodaysFocusNoteId(card.localDate);
    if (!noteId || !appendToNote(noteId, card.eveningReflectionPrompt, text)) {
      setMissingNote(true);
      return;
    }
    setFinished(true);
    recordReflectionDone(card);
    posthog?.capture("evening_reflection_completed");
    posthogLogger.info("Evening reflection saved.");
    // Replaces this screen, so "back" from the note goes to her notes.
    navigate(`/notes/${noteId}`, { replace: true });
  }

  return (
    <section className="mt-2">
      {/* The evening 9x of the day's affirmation comes first, before her
          journal — never required, the writing below works either way. */}
      {affirmationSlot && <div className="mb-6">{affirmationSlot(toRecap)}</div>}
      <div id={recapId} className="scroll-mt-4" />
      {/* A square card of its own: "Time to reflect" and her question centred,
          the sunset over the hills running the full width along the bottom.
          The picture is square too and see-through across its top
          two-thirds, so it fills the card edge to edge without covering the
          words; pb-[30%] lifts them clear of the hills. */}
      <div className="relative mb-6 flex aspect-square flex-col items-center justify-center overflow-hidden rounded-card bg-[#f2e0d8] px-6 pb-[30%] text-center shadow-soft">
        <img
          src="/daily-cards/reflection-sunset-hills.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
        />
        <div className="relative">
          <p className="text-xs font-medium tracking-wider text-muted uppercase">Time to reflect ✦</p>
          <p className="mt-3 font-serif text-[24px] leading-snug font-medium">
            {card.eveningReflectionPrompt}
          </p>
        </div>
      </div>
      <textarea
        id={writingId}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="Start writing…"
        aria-label="Your reflection"
        rows={6}
        className="field-sizing-content block min-h-44 w-full resize-none rounded-card bg-surface px-5 py-4 text-[17px] leading-relaxed shadow-soft placeholder:text-muted"
      />
      {missingNote && (
        <p role="alert" className="mt-3 animate-fade-in text-sm text-alert">
          We couldn&rsquo;t find today&rsquo;s note to add this to.
        </p>
      )}
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

// The evening reflection, in full. She arrives here from the reflect card on
// her notes list, which only ever shows once the morning card is done and
// it's actually evening (see reflect-slot.ts) — so the "not quite yet"
// branch below shouldn't really be reachable, but the screen never assumes
// that rather than checking (a stale link, say).
//
// `affirmationSlot` is the evening 9x of the day's affirmation, handed in by
// the app (so this feature knows nothing about it) and called with what to
// do once the ninth is done: move on to the recap.
export default function ReflectScreen({ affirmationSlot }: { affirmationSlot?: AffirmationSlot }) {
  const { state, retry } = useTodaysFocus();
  const isEvening = localHourIn(new Date(), deviceTimeZone()) >= REFLECT_HOUR;
  const ready =
    state.status === "ready" && state.card.done && state.card.eveningReflectionPrompt !== null && isEvening;

  useEffect(() => {
    if (ready && state.status === "ready") recordReflectionOpened(state.card);
  }, [ready, state]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-12">
      <header className="flex items-center gap-1 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
        <Link
          to="/"
          aria-label="Back to notes"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </Link>
        <h1 className="font-serif text-[28px] font-medium">Evening reflection</h1>
      </header>

      {state.status === "loading" ? (
        <p
          className="mt-24 animate-breathe text-center font-serif text-[26px] text-ink-soft motion-reduce:animate-none"
          role="status"
        >
          Aligning your reflection <span className="text-accent">✦</span>
        </p>
      ) : ready && state.status === "ready" ? (
        state.card.eveningReflectionDone ? (
          <section className="mt-10 animate-fade-in text-center">
            <p className="font-serif text-[24px] leading-tight text-ink-soft">
              You&rsquo;ve reflected on today <span className="text-accent">✦</span>
            </p>
            <p className="mt-2 text-[15px] text-ink-soft">
              Your answer is at the end of today&rsquo;s note.
            </p>
            <Link to="/" className={buttonClass}>
              Back to your notes
            </Link>
          </section>
        ) : (
          <ReflectWriting card={state.card} affirmationSlot={affirmationSlot} />
        )
      ) : state.status === "ready" && !state.card.done ? (
        <Notice title="Not quite yet.">
          <p>Answer today&rsquo;s focus card first, and your reflection will be waiting here.</p>
          <Link to="/focus" className={buttonClass}>
            Go to today&rsquo;s focus
          </Link>
        </Notice>
      ) : state.status === "ready" ? (
        <Notice title="Not quite yet.">
          <p>Your reflection opens up in the evening — come back later today.</p>
          <Link to="/" className={buttonClass}>
            Back to your notes
          </Link>
        </Notice>
      ) : state.status === "offline" ? (
        <Notice title="You're offline.">
          <p>Your reflection will be ready as soon as you&rsquo;re back online.</p>
          <button type="button" onClick={retry} className={buttonClass}>
            Try again
          </button>
        </Notice>
      ) : state.status === "no-chart" ? (
        <Notice title="Let's check your birth details.">
          <p>Your daily focus is built from your chart, and we couldn&rsquo;t find it.</p>
          <Link to="/profile" className={buttonClass}>
            Review birth details
          </Link>
        </Notice>
      ) : (
        <Notice title="Still aligning.">
          <p>We couldn&rsquo;t prepare today&rsquo;s reflection yet.</p>
          <button type="button" onClick={retry} className={buttonClass}>
            Try again
          </button>
        </Notice>
      )}
    </main>
  );
}
