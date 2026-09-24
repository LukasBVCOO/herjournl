import { useState } from "react";
import { getSession } from "@/lib/session";
import { hasDailyPlanNote, useNotes } from "@/features/notes";
import { WAITING_FOR_REFLECTION_MESSAGES } from "./content/waiting-for-reflection";
import { pickIndex, seedFor } from "./deterministic-seed";
import ExploreSheet from "./explore-sheet";
import { mergeFlags, readFocusState } from "./focus-state";
import { deviceTimeZone, localHourIn } from "./local-day";
import { REFLECT_HOUR } from "./reflect-slot";
import { currentCardDay } from "./today";
import { useSettleDelay } from "./use-settle-delay";
import { useTodaysFocus } from "./use-todays-focus";

const label = "text-xs font-medium tracking-wider text-muted uppercase";

// How long to wait, once it becomes due, before it actually appears — so it
// never pops in the instant she lands back on her notes list after making
// today's Daily Plan note. Same "let the moment settle" pause as
// daily-plan-card.tsx's own SHOW_DELAY_MS.
const SHOW_DELAY_MS = 3000;

// A fourth moment, filling the gap between the Daily Plan card and the
// evening reflection: once the morning card is answered and she has today's
// Daily Plan note (see hasDailyPlanNote in notes — the same thing that makes
// daily-plan-card.tsx disappear), there is nothing left to do until 8pm.
// This quiet placeholder takes that empty slot rather than leaving it blank,
// and steps aside the moment it actually becomes evening (reflect-slot.ts's
// own REFLECT_HOUR) so the reflect card can take over.
export default function WaitingForReflectionCard() {
  const { state } = useTodaysFocus();
  const cardDay = currentCardDay();
  const local = readFocusState(cardDay);
  const flags = state.status === "ready" ? mergeFlags(state.card, local) : local;
  const [exploreOpen, setExploreOpen] = useState(false);

  // Subscribed so this re-renders the instant today's Daily Plan note exists.
  useNotes();
  const isEvening = localHourIn(new Date(), deviceTimeZone()) >= REFLECT_HOUR;
  const due =
    Boolean(flags?.done) &&
    !flags?.eveningReflectionDone &&
    !isEvening &&
    hasDailyPlanNote(cardDay);

  const visible = useSettleDelay(due, `waiting-for-reflection:${cardDay}`, SHOW_DELAY_MS);

  if (!visible) return null;

  // A fixed choice for her, this day — same recipe as done-for-today-card.tsx,
  // just its own ten lines to pick from.
  const userId = getSession().userId ?? "";
  const seed = seedFor(userId, cardDay, "waiting-for-reflection");
  const message =
    WAITING_FOR_REFLECTION_MESSAGES[
      pickIndex(seed, "message", WAITING_FOR_REFLECTION_MESSAGES.length)
    ];

  return (
    <>
      <div className="relative animate-fade-in overflow-hidden rounded-card bg-[#f2e0d8] px-5 py-6 shadow-soft">
        {/* Bleeds off the right edge, behind the text (it comes first in the
            markup, so the text below paints over it), its left edge faded
            into the card's own background — same treatment as
            daily-plan-card.tsx's own image. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 w-1/2 translate-x-[14%] overflow-hidden"
        >
          <img
            src="/daily-cards/waiting-for-reflection-sun-clouds.png"
            alt=""
            className="h-full w-full object-cover object-right"
          />
          <div
            className="absolute inset-y-0 left-0 w-1/4"
            style={{
              background: "linear-gradient(to right, rgba(242,224,216,1), rgba(242,224,216,0))",
            }}
          />
        </div>

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
