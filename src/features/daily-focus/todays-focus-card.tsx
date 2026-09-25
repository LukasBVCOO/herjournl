import { Link } from "react-router";
import {
  HOUSE_VISUAL,
  houseBorderColor,
  houseFadeColor,
  MOON_FALLBACK_VISUAL,
} from "./content/house-visuals";
import { mergeFlags, readFocusState } from "./focus-state";
import { slotView } from "./focus-slot";
import { currentCardDay } from "./today";
import { useTodaysFocus } from "./use-todays-focus";

const label = "text-xs font-medium tracking-wider text-muted uppercase";

// Today's focus, on her notes list below the search bar. Only ever today's card:
// a new card arrives at 08:00 each day and anything from before is gone. What it shows
// follows where she is with the card, which the database keeps (and this phone
// copies, so it draws at once):
//
//   not opened   a teaser. No title, no words from the card, only an invitation.
//                The card itself appears on the screen it leads to.
//   opened       the card itself (its area, title and question), staying here
//                ready to answer, however long ago she opened it and whether or
//                not she started writing. Whatever she had typed is waiting on
//                the next screen.
//   done         nothing. Her answer is now a note in the list, and the next
//                card arrives tomorrow.
export default function TodaysFocusCard() {
  const { state } = useTodaysFocus();
  const local = readFocusState(currentCardDay());

  // What is known about today's card: the card itself once it has been found,
  // otherwise what this phone remembers of it.
  const known =
    state.status === "ready"
      ? { ...state.card, ...mergeFlags(state.card, local) }
      : local;
  // The two sources spell the house differently (DailyFocusCard's activeHouse
  // vs FocusState's house), so it's read out on its own rather than off `known`.
  const house = state.status === "ready" ? state.card.activeHouse : (local?.house ?? null);

  const view = slotView(known, state.status === "loading");
  if (view === "none" || (view === "card" && !known)) return null;

  if (view === "card" && known) {
    const visual = house ? HOUSE_VISUAL[house] : MOON_FALLBACK_VISUAL;
    return (
      <Link
        to="/focus"
        className="relative block overflow-hidden rounded-card border px-5 py-5 shadow-soft transition-opacity duration-200 active:opacity-80"
        style={{ backgroundColor: visual.background, borderColor: houseBorderColor(visual) }}
      >
        {visual.image && (
          // Left edge fixed at the same spot as before — the growth now comes
          // from extending the right edge out past the card's own boundary,
          // simply cut off there (overflow-hidden on the card), the same way
          // the unrevealed card's illustration already bleeds off its edge.
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-3 -right-8 -bottom-3 left-[38%]"
          >
            {/* object-contain, not object-cover: the whole illustration shows,
                nothing cropped off its left edge. The fade below is what blends
                it into the card instead of a hard cut. */}
            <img
              src={visual.image}
              alt=""
              className="h-full w-full object-contain object-right"
            />
            <div
              className="absolute inset-y-0 left-0 w-1/2"
              style={{
                background: `linear-gradient(to right, ${houseFadeColor(visual, 1)}, ${houseFadeColor(visual, 0)})`,
              }}
            />
          </div>
        )}
        <div className={visual.image ? "relative max-w-[60%]" : "relative"}>
          <p className={label}>Today&rsquo;s focus</p>
          <p className="mt-2 text-[14px] font-medium text-ink-soft">{known.label}</p>
          <p className="mt-1 font-serif text-[26px] leading-tight font-medium">
            {known.title}
          </p>
          <p className="mt-2 font-serif text-[19px] leading-snug text-ink-soft">
            {known.prompt}
          </p>
          <span className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
            Start writing
            <span aria-hidden="true">→</span>
          </span>
        </div>

        {/* Same warm sweep as the unrevealed card — still waiting on her,
            so it still deserves a nudge, not just once when it first arrives. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/focus"
      className="relative block overflow-hidden rounded-card bg-[#f2e0d8] px-5 py-6 shadow-soft transition-opacity duration-200 active:opacity-80"
    >
      {/* The illustration bleeds off the right edge on purpose — the card is
          clipped (overflow-hidden). Sized by height only (w-auto, max-w-none)
          rather than cropped to a fixed-width box, so its left side — the
          flowers and the hand — runs freely behind the text instead of being
          cut off at a box edge. The picture's own left side is transparent,
          so nothing covers the text. */}
      <img
        src="/daily-cards/unrevealed-hand-envelope.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto max-w-none translate-x-[14%]"
      />
      <div className="relative max-w-[58%]">
        <p className={label}>Today&rsquo;s focus</p>
        <h2 className="mt-2 font-serif text-[25px] leading-[1.15] font-medium">
          Your focus for today is ready <span className="text-accent">✦</span>
        </h2>
        <p className="mt-2 text-[14px] leading-snug text-ink-soft">
          Tap to reveal what today is asking of you.
        </p>
        <span className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
          Reveal my focus
          <span aria-hidden="true">→</span>
        </span>
      </div>

      {/* A warm diagonal sweep of light, over everything else, that passes
          once and then waits before doing it again — see --animate-card-shine
          in styles.css for the timing. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
      </div>
    </Link>
  );
}
