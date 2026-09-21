import { dayLabel } from "@/lib/day-label";
import type { DailyFocusCard } from "./types";

// Each part arrives a moment after the last, so opening the card feels like a
// reveal. Nothing about how the day's focus was worked out is shown: no houses
// by number, no Moon, no degrees. The area of life is shown by name, in small
// type above the title.
const fadeIn =
  "animate-fade-in [animation-fill-mode:backwards] motion-reduce:animate-none";

export default function FocusCardView({ card }: { card: DailyFocusCard }) {
  return (
    <section className="rounded-card bg-card px-6 py-7 shadow-soft">
      <p
        className={`${fadeIn} text-xs font-medium tracking-wider text-muted uppercase`}
      >
        {dayLabel(card.localDate)}
      </p>

      <p
        className={`${fadeIn} mt-3 text-[14px] font-medium text-ink-soft`}
        style={{ animationDelay: "80ms" }}
      >
        {card.label}
      </p>

      <h2
        className={`${fadeIn} mt-1 font-serif text-[36px] leading-tight font-medium`}
        style={{ animationDelay: "160ms" }}
      >
        {card.title}
      </h2>

      <p
        className={`${fadeIn} mt-4 text-[16px] leading-relaxed text-ink-soft`}
        style={{ animationDelay: "340ms" }}
      >
        {card.statement}
      </p>

      <div
        className={`${fadeIn} mt-6 border-t border-line pt-5`}
        style={{ animationDelay: "560ms" }}
      >
        <p className="text-xs font-medium tracking-wider text-muted uppercase">
          Today&rsquo;s question
        </p>
        <p className="mt-2 font-serif text-[26px] leading-snug font-medium">
          {card.prompt}
        </p>
      </div>
    </section>
  );
}
