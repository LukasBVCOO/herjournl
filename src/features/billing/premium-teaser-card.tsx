import { Link } from "react-router";
import { BECOMELY_PLUS_DAILY_CARD } from "./decorator";

// On her notes list once her trial is over, in place of the daily focus card
// and everything that follows it. Shaped like the unrevealed focus card she
// knows, with Becomely+'s own illustration — and, unlike that card, never asks
// for today's card to be made (which costs money per person per day).
export default function PremiumTeaserCard() {
  return (
    <Link
      to="/premium"
      className="relative block overflow-hidden rounded-card bg-[#f2e0d8] px-5 py-6 shadow-soft transition-opacity duration-200 active:opacity-80"
    >
      {/* Background, not layout: the text may sit over the envelope's left
          edge, which fades softly into the card's own colour so the words
          stay easy to read (same idea as the other home cards' images). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-2 h-[190px] w-[190px] -translate-y-1/2"
      >
        <img src={BECOMELY_PLUS_DAILY_CARD} alt="" className="h-full w-full object-contain" />
        <div
          className="absolute inset-y-0 left-0 w-2/5"
          style={{
            background: "linear-gradient(to right, rgba(242,224,216,0.9), rgba(242,224,216,0))",
          }}
        />
      </div>
      <div className="relative max-w-[58%]">
        <p className="text-xs font-medium tracking-wider text-muted uppercase">Today&rsquo;s focus</p>
        <h2 className="mt-2 font-serif text-[25px] leading-[1.15] font-medium">
          Today is asking something of you <span className="text-accent">✦</span>
        </h2>
        <p className="mt-2 text-[14px] leading-snug text-ink-soft">
          Continue with Becomely+ to reveal your focus card.
        </p>
        <span className="mt-4 inline-flex h-10 items-center rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
          See Becomely+
        </span>
      </div>

      {/* The same warm sweep of light as the unrevealed focus card, passing
          once and then waiting (styles.css, --animate-card-shine). */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
      </div>
    </Link>
  );
}
