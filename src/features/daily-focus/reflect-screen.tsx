import { useEffect, useState, type ReactNode } from "react";
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

function ReflectWriting({ card }: { card: DailyFocusCard }) {
  const navigate = useNavigate();
  const [text, setText] = useState("");
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
    <section className="mt-6">
      <p className="text-xs font-medium tracking-wider text-muted uppercase">Time to reflect ✦</p>
      <p className="mt-2 mb-6 font-serif text-[24px] leading-snug font-medium">
        {card.eveningReflectionPrompt}
      </p>
      <textarea
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
export default function ReflectScreen() {
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
          <ReflectWriting card={state.card} />
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
