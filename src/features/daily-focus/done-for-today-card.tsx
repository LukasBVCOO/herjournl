import { useState } from "react";
import { getSession } from "@/lib/session";
import { DONE_FOR_TODAY_MESSAGES } from "./content/done-for-today";
import { pickIndex, seedFor } from "./deterministic-seed";
import ExploreSheet from "./explore-sheet";
import { mergeFlags, readFocusState } from "./focus-state";
import { currentCardDay } from "./today";
import { useSettleDelay } from "./use-settle-delay";
import { useTodaysFocus } from "./use-todays-focus";

const label = "text-xs font-medium tracking-wider text-muted uppercase";

// How long to wait, once it becomes due, before it actually appears — so it
// never pops in the instant she lands back on her notes list after finishing
// the evening reflection. Same "let the moment settle" pause as
// daily-plan-card.tsx's own SHOW_DELAY_MS.
const SHOW_DELAY_MS = 3000;

// The last moment on her notes list for the day: once the evening
// reflection is done (which only happens once the morning card already is —
// see reflect-slot.ts), this quiet closing note takes the reflect card's
// place. Its one button doesn't lead anywhere on its own — it opens
// explore-sheet.tsx, which offers a few places to go next.
export default function DoneForTodayCard() {
  const { state } = useTodaysFocus();
  const cardDay = currentCardDay();
  const local = readFocusState(cardDay);
  const flags = state.status === "ready" ? mergeFlags(state.card, local) : local;
  const [exploreOpen, setExploreOpen] = useState(false);

  const due = Boolean(flags?.done) && Boolean(flags?.eveningReflectionDone);

  const visible = useSettleDelay(due, `done-for-today:${cardDay}`, SHOW_DELAY_MS);

  if (!visible) return null;

  // A fixed choice for her, this day — no chance involved, the same recipe
  // (userId + day + a fixed "area") the daily focus card itself uses, just
  // picking from this card's own dozen lines instead. Different women (and
  // different days) land on different ones; nothing about this repeats
  // every evening.
  const userId = getSession().userId ?? "";
  const seed = seedFor(userId, cardDay, "done-for-today");
  const message =
    DONE_FOR_TODAY_MESSAGES[pickIndex(seed, "message", DONE_FOR_TODAY_MESSAGES.length)];

  return (
    <>
      {/* A soft light blue, not the plain card colour — the same calm blue
          already used for house 11 (content/house-visuals.ts), reused here
          rather than inventing a new colour for the palette. */}
      <div className="relative animate-fade-in overflow-hidden rounded-card bg-[#E6EDF0] px-5 py-6 shadow-soft">
        {/* The whole picture, never trimmed: sized by the card's height and
            slid off the right edge, where the card itself clips it
            (overflow-hidden) — the same way the unrevealed focus card shows
            its envelope. Trimming it to a narrower box used to cut straight
            through the left cloud and leave a hard line; the picture's own
            left side is see-through, so no fade is needed. It comes first in
            the markup, so the text paints over it. No shine sweep here:
            that signals "still waiting on her", and this card is the
            opposite of that. */}
        <img
          src="/daily-cards/done-for-today-moon-clouds.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-auto max-w-none translate-x-[16%]"
        />

        <div className="relative max-w-[65%]">
          <p className={label}>Today</p>
          <h2 className="mt-2 font-serif text-[25px] leading-[1.15] font-medium">
            {message.title} <span className="text-accent">✦</span>
          </h2>
          <p className="mt-2 text-[14px] leading-snug text-ink-soft">{message.body}</p>
          <button
            type="button"
            onClick={() => setExploreOpen(true)}
            className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 active:opacity-80"
          >
            Explore more
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      {exploreOpen && <ExploreSheet onClose={() => setExploreOpen(false)} />}
    </>
  );
}
