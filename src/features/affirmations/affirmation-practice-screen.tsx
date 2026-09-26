import { useState } from "react";
import { BackIcon, PackIcon } from "@/components/icons";
import BottomNav from "@/components/bottom-nav";
import { deviceTimeZone, HouseIcon, houseBorderColor, localHourIn } from "@/features/daily-focus";
import { useGoBack } from "@/lib/use-go-back";
import AffirmationSession from "./affirmation-session";
import { changeLine, togglePin } from "./daily-369-store";
import { houseLabel } from "./house-label";
import { houseVisual } from "./house-visual";
import {
  isSessionDone,
  SESSION_LABEL,
  sessionForHour,
  SESSIONS,
  TARGET,
  type Counts,
  type Session,
} from "./sessions";
import { useDaily369 } from "./use-daily-369";

// The session to open on: the one the time of day suggests, unless it's
// already done — then the first one still open (a missed morning can still be
// done in the afternoon, and is shown as late).
function startingSession(counts: Counts | null): Session {
  const suggested = sessionForHour(localHourIn(new Date(), deviceTimeZone()));
  if (!counts || !isSessionDone(counts, suggested)) return suggested;
  return SESSIONS.find((session) => !isSessionDone(counts, session)) ?? suggested;
}

// Today's practice, opened from today's card on the Daily Affirmations screen
// (and from the 2pm afternoon nudge): today's line, keeping it, and all three
// sessions of the 369 — this is where the afternoon 6x is done.
export default function AffirmationPracticeScreen() {
  const goBack = useGoBack();
  const state = useDaily369();
  const [picked, setPicked] = useState<Session | null>(null);

  const ready = state.status === "ready" ? state : null;
  const selected = picked ?? startingSession(ready?.day.counts ?? null);

  return (
    <>
      <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-32">
        <header className="grid grid-cols-[44px_1fr_44px] items-center pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
          <button
            type="button"
            onClick={goBack}
            aria-label="Back"
            className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            <BackIcon />
          </button>
          <h1 className="text-center font-serif text-[20px] font-medium">Today&rsquo;s affirmation</h1>
        </header>

        {!ready ? (
          <AffirmationSession session={selected} />
        ) : (
          <>
            <LineCard />

            {/* A segmented control, like a native one: a soft track with the
                chosen session lifted out of it in white. */}
            <div role="tablist" aria-label="Sessions" className="mt-6 grid grid-cols-3 rounded-full bg-card p-1">
              {SESSIONS.map((session) => {
                const done = isSessionDone(ready.day.counts, session);
                const active = session === selected;
                return (
                  <button
                    key={session}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setPicked(session)}
                    className={`flex h-10 items-center justify-center gap-1.5 rounded-full text-[13px] transition-all duration-200 ${
                      active ? "bg-surface font-medium text-ink shadow-soft" : "text-ink-soft"
                    }`}
                  >
                    {SESSION_LABEL[session]}
                    <span className={done ? "text-gold" : "text-muted"}>
                      {done ? "✦" : `${TARGET[session]}×`}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8">
              <AffirmationSession key={selected} session={selected} plain />
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}

// Today's line, large, on the colours of today's house (the same card family
// as the Daily Affirmations screen and the focus card), with the choice to
// keep it past today.
function LineCard() {
  const state = useDaily369();
  if (state.status !== "ready") return null;

  const { day } = state;
  const visual = houseVisual(state.house);
  const area = houseLabel(state.house);
  const started = day.counts.morning + day.counts.afternoon + day.counts.evening > 0;

  return (
    <section
      className="rounded-card border px-5 pt-5 pb-6 shadow-soft"
      style={{ backgroundColor: visual.background, borderColor: houseBorderColor(visual) }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <HouseIcon visual={visual} className="-ml-1.5 h-8 w-8 shrink-0" />
          <p className="truncate text-xs font-medium tracking-wider text-muted uppercase">
            {area ?? "Today's line"}
          </p>
        </div>
        <button
          type="button"
          onClick={togglePin}
          aria-pressed={day.pinned}
          className={`flex h-8 shrink-0 items-center gap-1 rounded-full pr-3 pl-1.5 text-[12px] font-medium transition-colors duration-200 ${
            day.pinned ? "bg-ink text-paper" : "bg-surface/70 text-ink-soft"
          }`}
        >
          <span className="scale-[0.6]">
            <PackIcon name="pin" />
          </span>
          {day.pinned ? "Kept" : "Keep this line"}
        </button>
      </div>

      <p className="mt-7 text-center font-serif text-[30px] leading-[1.18] font-medium text-ink">
        {day.affirmation.text}
      </p>

      <div className="mx-auto mt-6 h-px w-10" style={{ backgroundColor: houseBorderColor(visual, 0.6) }} />
      <p className="mt-3 text-center text-[12px] leading-snug text-muted">
        {day.pinned
          ? "Kept — it stays with you until you let it go."
          : "A new line comes when your focus moves on."}
      </p>
      {!started && (
        <button
          type="button"
          onClick={changeLine}
          className="mx-auto mt-2 block text-[13px] text-ink-soft underline underline-offset-4"
        >
          Choose a different line
        </button>
      )}
    </section>
  );
}
