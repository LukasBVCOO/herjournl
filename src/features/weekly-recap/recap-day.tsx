import { useId } from "react";
import { Link } from "react-router";
import { sessionsDone } from "@/features/affirmations";
import { HOUSE_CONTENT, HOUSE_VISUAL, HouseIcon, MOON_FALLBACK_VISUAL, houseBorderColor, type HouseNumber } from "@/features/daily-focus";
import { dayLabel } from "@/lib/day-label";
import { hasAnything, houseOf, saidAny, type RecapDay } from "./use-week";

const label = "text-xs font-medium tracking-wider text-muted uppercase";

const chevron = {
  mask: `url("/Iconspack/chevron-down.svg") center / contain no-repeat`,
  WebkitMask: `url("/Iconspack/chevron-down.svg") center / contain no-repeat`,
};

// One day of her week, as a drop-down in the colours of its house. Closed, it
// shows the day, the area of life that was lit up and the card's title; open,
// each question with what she wrote, and the line she said. A day with nothing
// in it is one quiet line instead, with nothing to open.
export default function RecapDayCard({
  day,
  isToday,
  open,
  onToggle,
}: {
  day: RecapDay;
  isToday: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const bodyId = useId();
  const house = houseOf(day);

  if (!hasAnything(day)) {
    return (
      <section id={`day-${day.date}`} className="scroll-mt-6 border-b border-line px-1 py-4">
        <p className={label}>{isToday ? "Today" : dayLabel(day.date)}</p>
        <p className="mt-1 font-serif text-[18px] text-ink-soft">
          {isToday ? "Still unfolding ✦" : "A quiet day"}
        </p>
      </section>
    );
  }

  const visual = (house && HOUSE_VISUAL[house]) || MOON_FALLBACK_VISUAL;
  const line = houseBorderColor(visual);
  const area = day.entry?.card.label ?? (house ? HOUSE_CONTENT[house as HouseNumber]?.label : null);
  const affirmation = saidAny(day) ? day.affirmation : null;
  const sessions = affirmation ? sessionsDone(affirmation.counts) : 0;

  return (
    <section
      id={`day-${day.date}`}
      className="scroll-mt-6 overflow-hidden rounded-card border shadow-soft"
      style={{ backgroundColor: visual.background, borderColor: line }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={bodyId}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-opacity duration-200 active:opacity-70"
      >
        <HouseIcon visual={visual} className="-ml-2 h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <p className={label}>{isToday ? "Today" : dayLabel(day.date)}</p>
          {area && <p className="mt-0.5 text-[14px] font-medium text-ink">{area}</p>}
          {day.entry && (
            <p className="mt-1 truncate font-serif text-[18px] leading-snug text-ink-soft">
              {day.entry.card.title}
            </p>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`h-5 w-5 shrink-0 bg-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={chevron}
        />
      </button>

      {open && (
        <div id={bodyId} className="animate-fade-in px-5 pb-5">
          {day.entry && (
            <>
              <h3 className="font-serif text-[23px] leading-[1.18] font-medium">{day.entry.card.title}</h3>

              {day.entry.answers.length > 0 && (
                <div className="mt-4 flex flex-col gap-4 border-t pt-4" style={{ borderColor: line }}>
                  {day.entry.answers.map((answer, index) => (
                    <div key={index}>
                      {answer.label && <p className={label}>{answer.label}</p>}
                      <p className="mt-1 font-serif text-[16px] leading-snug text-ink-soft italic">{answer.question}</p>
                      <p className="mt-1.5 text-[15px] leading-relaxed whitespace-pre-line text-ink">{answer.answer}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {affirmation && (
            <div className={day.entry ? "mt-4 border-t pt-4" : ""} style={{ borderColor: line }}>
              <p className={label}>Affirmation</p>
              <p className="mt-1.5 font-serif text-[18px] leading-snug text-ink">
                &ldquo;{affirmation.affirmation.text}&rdquo;
              </p>
              <p className="mt-1.5 text-[12px] text-muted">
                {sessions === 3 ? (
                  <span className="font-medium text-gold">All three sessions ✦</span>
                ) : (
                  `${sessions} of 3 sessions`
                )}
              </p>
            </div>
          )}

          {day.entry && (
            <Link
              to={`/notes/${day.entry.noteId}`}
              className="mt-5 inline-flex h-9 items-center gap-1.5 rounded-full border border-ink/15 bg-surface/60 px-4 text-[13px] font-medium text-ink transition-opacity duration-200 active:opacity-70"
            >
              Open note
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
