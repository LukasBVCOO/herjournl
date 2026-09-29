import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router";
import { BackIcon } from "@/components/icons";
import BottomNav from "@/components/bottom-nav";
import { HOUSE_VISUAL, HouseIcon, MOON_FALLBACK_VISUAL } from "@/features/daily-focus";
import { findNoteIdByTitle } from "@/features/notes";
import { markSeen } from "@/lib/seen";
import { useGoBack } from "@/lib/use-go-back";
import RecapDayCard from "./recap-day";
import { hasAnything, houseOf, useWeek, type RecapDay } from "./use-week";
import { SEEN_AREA, useWeeklyMoment } from "./use-weekly-moment";
import { addDays, dayOfMonth, mondayOf, reflectionTitle, resolveWeek, weekdayShort, weekLabel, weekPath } from "./week";

// The week at a glance: a mark per day (its house icon, or an empty dot for a
// quiet day). Tapping one opens that day below and scrolls to it.
function WeekStrip({
  days,
  monday,
  lastDay,
  onPick,
}: {
  days: RecapDay[];
  monday: string;
  lastDay: string;
  onPick: (date: string) => void;
}) {
  const byDate = new Map(days.map((day) => [day.date, day]));
  return (
    <ol className="grid grid-cols-7 gap-1 rounded-card border border-line bg-surface px-2 py-3" aria-label="Your week">
      {Array.from({ length: 7 }, (_, index) => addDays(monday, index)).map((date) => {
        const day = byDate.get(date);
        const house = day ? houseOf(day) : null;
        const filled = day ? hasAnything(day) : false;
        const future = date > lastDay;
        return (
          <li key={date}>
            <a
              href={`#day-${date}`}
              onClick={(event) => {
                event.preventDefault();
                if (!future) onPick(date);
              }}
              className={`flex flex-col items-center gap-1.5 ${future ? "pointer-events-none opacity-40" : ""}`}
            >
              <span className={`text-[11px] ${date === lastDay ? "font-medium text-ink" : "text-muted"}`}>
                {weekdayShort(date).charAt(0)}
              </span>
              {filled ? (
                <HouseIcon visual={(house && HOUSE_VISUAL[house]) || MOON_FALLBACK_VISUAL} className="h-8 w-8" />
              ) : (
                <span className="flex h-8 w-8 items-center justify-center">
                  <span className="h-2 w-2 rounded-full bg-ink/10" />
                </span>
              )}
              <span className="text-[11px] text-muted">{dayOfMonth(date)}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

// Her week, Monday to Sunday, at /week (this week) or /week/<monday> (an
// earlier one): each day's house, her answers, her evening reflection and her
// affirmation. The arrows step between weeks; there's no going past this one.
export default function WeeklyRecapScreen() {
  const goBack = useGoBack();
  const { start } = useParams();
  const week = resolveWeek(start);
  const moment = useWeeklyMoment();

  // Opening any recap counts as having seen the latest ready week, so the
  // calendar icon's dot on her notes list goes.
  useEffect(() => {
    if (moment) markSeen(SEEN_AREA, moment.dueMonday);
  }, [moment]);

  // Anything that isn't a Monday up to this week goes to this week instead.
  if (!week) return start === undefined ? null : <Navigate to="/week" replace />;
  return <Week key={week.monday} {...week} goBack={goBack} />;
}

function Week({
  monday,
  isThisWeek,
  now,
  goBack,
}: {
  monday: string;
  isThisWeek: boolean;
  now: string;
  goBack: () => void;
}) {
  const lastDay = isThisWeek ? now : addDays(monday, 6);
  const week = useWeek(monday, lastDay);
  const previous = addDays(monday, -7);
  const next = addDays(monday, 7);
  const lastWeek = !isThisWeek && next === mondayOf(now);
  const shown = week.days.filter(hasAnything).length;
  // Her reflection on this week, once she has written it (a note).
  const reflectionId = week.ready ? findNoteIdByTitle(reflectionTitle(monday)) : null;
  // Which days are dropped open. All closed to start with.
  const [open, setOpen] = useState<Set<string>>(() => new Set());

  function toggle(date: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  }

  function pick(date: string) {
    setOpen((current) => new Set(current).add(date));
    // After it has opened, so it lands on the whole day.
    requestAnimationFrame(() =>
      document.getElementById(`day-${date}`)?.scrollIntoView({ behavior: "smooth" }),
    );
  }

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
          <h1 className="text-center font-serif text-[20px] font-medium">Your week</h1>
        </header>

        <div className="mb-5 flex items-center justify-between gap-2">
          <Link
            to={`/week/${previous}`}
            replace
            aria-label="Previous week"
            className="-ml-3 flex h-11 w-11 items-center justify-center text-[20px] text-ink-soft transition-colors duration-200 hover:text-ink"
          >
            ‹
          </Link>
          <div className="text-center">
            <p className="text-xs font-medium tracking-wider text-muted uppercase">
              {isThisWeek ? "This week" : lastWeek ? "Last week" : "Week of"}
            </p>
            <h2 className="mt-1 font-serif text-[26px] leading-tight font-medium">{weekLabel(monday)}</h2>
          </div>
          {isThisWeek ? (
            <span className="-mr-3 h-11 w-11" aria-hidden="true" />
          ) : (
            <Link
              to={next === mondayOf(now) ? "/week" : `/week/${next}`}
              replace
              aria-label="Next week"
              className="-mr-3 flex h-11 w-11 items-center justify-center text-[20px] text-ink-soft transition-colors duration-200 hover:text-ink"
            >
              ›
            </Link>
          )}
        </div>

        {!week.ready ? (
          <div className="h-[92px] animate-pulse rounded-card bg-card/60 motion-reduce:animate-none" aria-hidden="true" />
        ) : (
          <>
            <WeekStrip days={week.days} monday={monday} lastDay={lastDay} onPick={pick} />
            <p className="mt-3 text-center text-[13px] text-ink-soft">
              {shown === 0
                ? "Nothing written this week yet."
                : `You showed up ${shown} ${shown === 1 ? "day" : "days"} this week ✦`}
            </p>

            {week.affirmations === "offline" || week.affirmations === "failed" ? (
              <p className="mt-2 text-center text-[12px] text-muted">
                {week.affirmations === "offline"
                  ? "You're offline, so your affirmations aren't shown."
                  : "Your affirmations didn't load this time."}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3">
              {week.days.map((day) => (
                <RecapDayCard
                  key={day.date}
                  day={day}
                  isToday={day.date === now}
                  open={open.has(day.date)}
                  onToggle={() => toggle(day.date)}
                />
              ))}
            </div>

            {/* Reflecting on the week happens on its own screen
                (week-reflect-screen.tsx); once she has, this opens it. */}
            <section className="relative mt-8 overflow-hidden rounded-card bg-blush px-5 py-6 text-center shadow-soft">
              {/* The same warm sweep of light as the daily cards
                  (--animate-card-shine in styles.css): tap me. */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
              </div>
              {reflectionId ? (
                <>
                  <p className="font-serif text-[23px] leading-tight font-medium">
                    You&rsquo;ve reflected on this week <span className="text-accent">✦</span>
                  </p>
                  <Link
                    to={`/notes/${reflectionId}`}
                    className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
                  >
                    Open your reflection
                    <span aria-hidden="true">→</span>
                  </Link>
                </>
              ) : (
                <>
                  <p className="font-serif text-[23px] leading-tight font-medium">
                    Now look at the whole week <span className="text-accent">✦</span>
                  </p>
                  <p className="mt-1.5 text-[14px] leading-snug text-ink-soft">
                    Three questions to close it with intention.
                  </p>
                  <Link
                    to={`${weekPath(monday, isThisWeek)}/reflect`}
                    className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
                  >
                    Reflect on your week
                    <span aria-hidden="true">→</span>
                  </Link>
                </>
              )}
            </section>
          </>
        )}
      </main>
      <BottomNav />
    </>
  );
}
