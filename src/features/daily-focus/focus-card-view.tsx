import { dayLabel } from "@/lib/day-label";
import { HOUSE_VISUAL, houseFadeColor, MOON_FALLBACK_VISUAL } from "./content/house-visuals";
import ReflectionCard from "./reflection-card";
import type { DailyFocusCard } from "./types";
import WhyCardPill from "./why-card-pill";

// Each part arrives a moment after the last, so opening the card feels like a
// reveal. Nothing about how the day's focus was worked out is shown in the
// card's own words: no houses by number, no Moon, no degrees. The area of
// life is shown by name, in small type above the title. The one place the
// "how" is told is the "Why this card" pill at the bottom, for anyone who
// taps it.
//
// Two cards, one after the other: the focus itself (area, title, statement),
// then — on its own card, so it carries its own weight — the thought to
// reflect on before she answers the questions below.
const fadeIn =
  "animate-fade-in [animation-fill-mode:backwards] motion-reduce:animate-none";

export default function FocusCardView({ card }: { card: DailyFocusCard }) {
  // Not every house has its own corner illustration yet — when one doesn't,
  // this card simply shows without it, the way it always has.
  const visual = card.activeHouse ? HOUSE_VISUAL[card.activeHouse] : undefined;
  const cornerImage = visual?.cornerImage;
  // The colours for the "why" pill. A reduced-mode card
  // (no birth time, so no house) uses the app's own tan.
  const colours = visual ?? MOON_FALLBACK_VISUAL;

  return (
    <>
      <section
        // Tinted with the house's own colour, same as the notes-list card. A
        // reduced-mode card (no house) keeps the plain --color-card tan.
        className={`relative overflow-hidden rounded-card px-6 py-7 shadow-soft ${visual ? "" : "bg-card"}`}
        style={visual ? { backgroundColor: visual.background } : undefined}
      >
        {cornerImage && visual && (
          <div aria-hidden="true" className="pointer-events-none absolute -top-4 -right-4 h-64 w-64">
            <img
              src={cornerImage}
              alt=""
              className="h-full w-full object-contain object-right-top"
            />
            {/* Fades the bottom of the illustration into the card, matching
                this house's own background (the card is now tinted with it,
                not the plain --color-card tan). */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(to bottom, ${houseFadeColor(visual, 0)} 15%, ${houseFadeColor(visual, 1)} 75%)`,
              }}
            />
          </div>
        )}
        {/* Its own stacking, above the corner image — a plain absolutely-
            positioned element (the image) otherwise paints above ordinary
            content by default, regardless of which comes first in the markup. */}
        <div className="relative z-10">
          <p className={`${fadeIn} text-xs font-medium tracking-wider text-muted uppercase`}>
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

          {/* Where today's Moon is, and a tap for why that means this card. */}
          <div className={fadeIn} style={{ animationDelay: "480ms" }}>
            <WhyCardPill card={card} visual={colours} />
          </div>
        </div>
      </section>

      {/* The thought to reflect on, on its own card — null only on a card
          saved before this existed (see types.ts). */}
      {card.reflection && (
        <div className={`${fadeIn} mt-3`} style={{ animationDelay: "620ms" }}>
          <ReflectionCard text={card.reflection} />
        </div>
      )}
    </>
  );
}
