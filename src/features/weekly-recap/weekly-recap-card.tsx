import { Link } from "react-router";
import { HOUSE_VISUAL, MOON_FALLBACK_VISUAL } from "@/features/daily-focus";
import { hasAnything, houseOf, useWeek } from "./use-week";
import { useWeeklyMoment } from "./use-weekly-moment";
import { addDays, weekDays, weekLabel } from "./week";

const label = "text-xs font-medium tracking-wider text-muted uppercase";

// "Your week in review" on her notes list, from Sunday 18:00 until Monday
// 08:00 (week.ts's weeklyMoment), in place of the evening reflection: a dot
// per day in the colour of its house, leading to the full recap (/week).
export default function WeeklyRecapCard() {
  const moment = useWeeklyMoment();
  if (!moment?.inWindow) return null;
  return <Card monday={moment.dueMonday} />;
}

function Card({ monday }: { monday: string }) {
  const week = useWeek(monday, addDays(monday, 6));
  const byDate = new Map(week.days.map((day) => [day.date, day]));
  const shown = week.days.filter(hasAnything).length;

  return (
    // Sunday's own colour: a soft lavender, the only purple in the app, so the
    // week's card never looks like one of the daily ones.
    <Link
      to="/week"
      className="relative block animate-fade-in overflow-hidden rounded-card border border-[#ddd3ea] bg-[#ece6f3] px-5 py-6 shadow-soft transition-opacity duration-200 active:opacity-80"
    >
      {/* The journal, moon and lavender, sized by the card's height and slid
          off the right edge (the card clips it), like the evening reflection
          card's picture. Its background is see-through, so the words stay
          clear; it comes first so they paint over it. */}
      <img
        src="/weekly-recap/weekly-recap-journal-moon-lavender.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-0 h-[120%] w-auto max-w-none translate-x-[18%] -translate-y-1/2"
      />
      {/* A lavender fade over the picture's left side, so the lavender stems
          behind the words never make them hard to read. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#ece6f3_0%,#ece6f3_45%,rgba(236,230,243,0.85)_58%,rgba(236,230,243,0)_78%)]"
      />

      <div className="relative max-w-[60%]">
        <p className={label}>{weekLabel(monday)}</p>
        <h2 className="mt-2 font-serif text-[25px] leading-[1.15] font-medium">
          Your week in review <span className="text-[#9a84bd]">✦</span>
        </h2>
        <p className="mt-1.5 text-[14px] leading-snug text-ink-soft">
          {shown === 0
            ? "Look back on each day, and what it asked of you."
            : `You showed up ${shown} ${shown === 1 ? "day" : "days"}. Look back on what each one asked of you.`}
        </p>

        <ol className="mt-4 flex gap-2" aria-hidden="true">
          {weekDays(monday).map((date) => {
            const day = byDate.get(date);
            const house = day && hasAnything(day) ? houseOf(day) : undefined;
            const color =
              house === undefined ? null : ((house && HOUSE_VISUAL[house]) || MOON_FALLBACK_VISUAL).color;
            return (
              <li
                key={date}
                className={`h-2.5 w-2.5 rounded-full ${color ? "" : "bg-ink/10"}`}
                style={color ? { backgroundColor: color } : undefined}
              />
            );
          })}
        </ol>

        <span className="mt-5 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
          See my week
          <span aria-hidden="true">→</span>
        </span>
      </div>

      {/* The same warm sweep of light as the daily cards: tap me. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
      </div>
    </Link>
  );
}
