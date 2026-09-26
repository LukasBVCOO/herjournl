import { useId, useState } from "react";
import { houseBorderColor, type HouseVisual } from "./content/house-visuals";
import { whyThisCard } from "./content/why-card";
import type { DailyFocusCard } from "./types";

function mask(file: string) {
  return {
    mask: `url("/Iconspack/${file}") center / contain no-repeat`,
    WebkitMask: `url("/Iconspack/${file}") center / contain no-repeat`,
  };
}

// The last thing on the daily focus card: a pill saying where today's Moon is
// ("Moon · 10th house"). A tap opens a small bubble underneath it, pointing
// back at the pill, with a two-line, plain-words explanation of why she got
// this card today (content/why-card.ts). A tap on the pill again closes it.
//
// The bubble sits in the card's normal flow rather than floating over it, so
// the card simply grows to make room and nothing is ever clipped or covered.
export default function WhyCardPill({ card, visual }: { card: DailyFocusCard; visual: HouseVisual }) {
  const [open, setOpen] = useState(false);
  const bubbleId = useId();
  const why = whyThisCard(card);
  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={bubbleId}
        title="Why this card?"
        // Plain underlined text rather than a pill — quiet, but clearly a
        // link — with the moon mark before it and a small arrow after.
        className="-mx-1 inline-flex min-h-11 items-center gap-2 rounded-md px-1 text-[14px] font-medium text-ink transition-opacity duration-200 hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <span aria-hidden="true" className="h-4 w-4 shrink-0" style={{ backgroundColor: visual.color, ...mask("moon-stars.svg") }} />
        <span
          className="underline decoration-1 underline-offset-4"
          style={{ textDecorationColor: houseBorderColor(visual, 0.6) }}
        >
          {why.pill}
        </span>
        <span className="sr-only">. Why this card?</span>
        <span
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 bg-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          style={mask("chevron-down.svg")}
        />
      </button>

      {open && (
        <div id={bubbleId} role="region" aria-label="Why this card" className="relative mt-3 animate-fade-in">
          {/* The little point that ties the bubble back to the pill. */}
          <span
            aria-hidden="true"
            className="absolute -top-1.5 left-6 h-3 w-3 rotate-45 rounded-[2px] bg-surface"
          />
          <div className="relative rounded-2xl bg-surface px-4 py-3.5 shadow-soft">
            <p className="text-xs font-medium tracking-wider text-muted uppercase">Why this card</p>
            {why.lines.map((line) => (
              <p key={line} className="mt-1.5 text-[15px] leading-relaxed text-ink">
                {line}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
