import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { BackIcon } from "@/components/icons";
import BottomNav from "@/components/bottom-nav";
import { HouseIcon, houseBorderColor } from "@/features/daily-focus";
import { useGoBack } from "@/lib/use-go-back";
import { fetchHistory, type Day369 } from "./affirmations-api";
import { retry } from "./daily-369-store";
import { houseLabel } from "./house-label";
import { houseVisual } from "./house-visual";
import SessionBars from "./session-bars";
import {
  currentStreak,
  dayBefore,
  isSessionDone,
  SESSION_LABEL,
  SESSIONS,
  sessionsDone,
  type Counts,
} from "./sessions";
import { useDaily369 } from "./use-daily-369";

const label = "text-xs font-medium tracking-wider text-muted uppercase";

// Same section break as the birth chart page: the small-caps label with a
// thin rule trailing off to the right.
function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className={`${label} shrink-0`}>{children}</h2>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}

// "2026-09-21" as a local calendar date (never through UTC, which could
// shift it a day).
function calendarDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day);
}

const said = (counts: Counts) => counts.morning + counts.afternoon + counts.evening > 0;

// The same warm sweep of light as the focus card: this is still waiting on her.
const shine = (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
  </div>
);

// Today, as a card in the colours of today's house — the same family as the
// focus card on her notes list. Tapping it opens today's practice.
function TodayCard() {
  const state = useDaily369();

  if (state.status === "loading") {
    return <div className="h-[232px] animate-pulse rounded-card bg-card/60 motion-reduce:animate-none" aria-hidden="true" />;
  }

  if (state.status === "error") {
    return (
      <section className="rounded-card border border-line px-5 py-5">
        <p className="font-serif text-[20px] leading-snug font-medium">
          {state.offline ? "You're offline right now" : "Today's line didn't load"}
        </p>
        <p className="mt-1 text-[14px] text-ink-soft">
          {state.offline ? "It'll be here as soon as you're back online." : "It's nothing you did."}
        </p>
        <button
          type="button"
          onClick={retry}
          className="mt-4 inline-flex h-10 items-center rounded-full bg-ink px-4 text-[14px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Try again
        </button>
      </section>
    );
  }

  const visual = houseVisual(state.house);
  const area = houseLabel(state.house);
  const counts = state.status === "ready" ? state.day.counts : null;
  const allDone = counts ? sessionsDone(counts) === 3 : false;
  const started = counts ? said(counts) : false;

  return (
    <Link
      to="/affirmations/today"
      className="relative block overflow-hidden rounded-card border px-5 pt-5 pb-5 shadow-soft transition-opacity duration-200 active:opacity-80"
      style={{ backgroundColor: visual.background, borderColor: houseBorderColor(visual) }}
    >
      <div className="relative flex items-center gap-2.5">
        <HouseIcon visual={visual} className="-ml-1.5 h-8 w-8" />
        <p className={label}>{area ? `Today · ${area}` : "Today"}</p>
      </div>

      {state.status === "choose" ? (
        <div className="relative">
          <p className="mt-5 font-serif text-[27px] leading-[1.15] font-medium">
            Three lines are waiting for you <span className="text-accent">✦</span>
          </p>
          <p className="mt-2 text-[14px] leading-snug text-ink-soft">
            Pick the one that feels most true. You&rsquo;ll carry it through the day.
          </p>
          <span className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
            Choose my line
            <span aria-hidden="true">→</span>
          </span>
        </div>
      ) : (
        <div className="relative">
          <span
            aria-hidden="true"
            className="-mb-6 block font-serif text-[64px] leading-none"
            style={{ color: houseBorderColor(visual, 0.6) }}
          >
            &ldquo;
          </span>
          <p className="font-serif text-[27px] leading-[1.18] font-medium text-ink">
            {state.day.affirmation.text}
          </p>

          <div className="mt-6 border-t pt-4" style={{ borderColor: houseBorderColor(visual) }}>
            <SessionBars counts={state.day.counts} />
          </div>

          <span className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
            {allDone ? "See today" : started ? "Continue" : "Begin"}
            <span aria-hidden="true">→</span>
          </span>
        </div>
      )}

      {!allDone && shine}
    </Link>
  );
}

// How many days in a row, and the last seven as small marks under their
// weekday: a full gold dot for all three sessions, a gold ring for some.
function Rhythm({ days, today }: { days: { date: string; counts: Counts }[]; today: string }) {
  const streak = currentStreak(days, today);
  const byDate = new Map(days.map((day) => [day.date, day.counts]));
  const week: string[] = [];
  for (let i = 0, date = today; i < 7; i++, date = dayBefore(date)) week.unshift(date);

  return (
    <section className="flex items-center justify-between gap-4 rounded-card border border-line px-5 py-4">
      <div className="shrink-0">
        <p className="font-serif text-[26px] leading-none font-medium">
          {streak} <span className="text-[17px] text-ink-soft">{streak === 1 ? "day" : "days"}</span>
        </p>
        <p className="mt-1.5 text-[12px] text-muted">in a row</p>
      </div>
      <ol className="flex gap-2.5" aria-label="The last 7 days">
        {week.map((date) => {
          const counts = byDate.get(date);
          const done = counts ? sessionsDone(counts) : 0;
          const weekday = calendarDate(date).toLocaleDateString("en-GB", { weekday: "short" });
          return (
            <li key={date} className="flex flex-col items-center gap-1.5">
              <span
                className={`text-[10px] ${date === today ? "font-medium text-ink" : "text-muted"}`}
                aria-hidden="true"
              >
                {weekday.charAt(0)}
              </span>
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  done === 3 ? "bg-gold" : done > 0 ? "border-[1.5px] border-gold" : "bg-ink/10"
                }`}
              />
              <span className="sr-only">
                {weekday}: {done === 0 ? "not done" : `${done} of 3`}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

// One past day: the date in its own column, like a journal's margin, then
// the line she said and how far she took it.
function PastDay({ day }: { day: Day369 }) {
  const date = calendarDate(day.date);
  const full = sessionsDone(day.counts) === 3;
  const doneNames = SESSIONS.filter((s) => isSessionDone(day.counts, s)).map((s) => SESSION_LABEL[s]);
  const visual = houseVisual(day.affirmation.house);

  return (
    <li className="flex gap-4 py-4">
      <div className="w-10 shrink-0 pt-0.5 text-center">
        <p className="font-serif text-[26px] leading-none font-medium">{date.getDate()}</p>
        <p className="mt-1 text-[10px] font-medium tracking-wider text-muted uppercase">
          {date.toLocaleDateString("en-GB", { month: "short" })}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-serif text-[19px] leading-snug text-ink">{day.affirmation.text}</p>
        <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-muted">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: visual.color }}
          />
          {full ? (
            <span className="font-medium text-gold">All three ✦</span>
          ) : doneNames.length > 0 ? (
            doneNames.join(" · ")
          ) : (
            "Started"
          )}
        </p>
      </div>
    </li>
  );
}

// Daily Affirmations, from the crown in the bottom bar: today's line (tap it
// to practise — affirmation-practice-screen.tsx), her rhythm, and every line
// she has said before, newest first.
export default function AffirmationsScreen() {
  const goBack = useGoBack();
  const state = useDaily369();
  const [history, setHistory] = useState<Day369[] | null>(null);

  useEffect(() => {
    let current = true;
    void fetchHistory().then((found) => {
      if (current) setHistory(found.ok ? found.value : []);
    });
    return () => {
      current = false;
    };
  }, []);

  const today = state.status === "ready" || state.status === "choose" ? state.cardDay : null;
  const past = (history ?? []).filter((day) => day.date !== today && said(day.counts));
  // Today's live counts in place of whatever the history fetch saw for today.
  const days = [
    ...(state.status === "ready" ? [{ date: state.cardDay, counts: state.day.counts }] : []),
    ...(history ?? []).filter((day) => day.date !== today),
  ];

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
          <h1 className="text-center font-serif text-[20px] font-medium">Daily Affirmations</h1>
        </header>

        {/* Same opening as the birth chart page: a warm headline with the
            illustration bleeding off the right edge behind it. */}
        <div className="relative mb-6">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 -right-10 h-[115px] w-[173px] -translate-y-1/2"
          >
            <img
              src="/birth-chart/header-decorator-birth-chart.png"
              alt=""
              className="h-full w-full object-contain"
            />
            <div
              className="absolute inset-y-0 left-0 w-3/5"
              style={{ background: "linear-gradient(to right, var(--color-paper), transparent)" }}
            />
          </div>
          <div className="relative z-10 max-w-[70%]">
            <h2 className="font-serif text-[26px] leading-tight font-medium">Speak it into being</h2>
            <p className="mt-1 text-[14px] text-ink-soft">
              One line, said 3 times this morning, 6 this afternoon, 9 tonight.
            </p>
          </div>
        </div>

        <TodayCard />

        {today && history && (
          <div className="mt-3">
            <Rhythm days={days} today={today} />
          </div>
        )}

        <div className="mt-9">
          <SectionHeading>Your affirmations</SectionHeading>
          {history === null ? null : past.length === 0 ? (
            <div className="py-10 text-center">
              <p className="font-serif text-[20px] leading-snug text-ink-soft">
                Every line you speak will gather here.
              </p>
              <p className="mt-1.5 text-[13px] text-muted">Today&rsquo;s joins them tomorrow.</p>
            </div>
          ) : (
            <ul className="mt-1 divide-y divide-line">
              {past.map((day) => (
                <PastDay key={day.date} day={day} />
              ))}
            </ul>
          )}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
