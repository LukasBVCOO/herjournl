import { useNavigate } from "react-router";
import { hasDailyPlanNote, startDailyPlanNote, useNotes } from "@/features/notes";
import { mergeFlags, readFocusState } from "./focus-state";
import { deviceTimeZone, localHourIn } from "./local-day";
import { REFLECT_HOUR } from "./reflect-slot";
import { currentCardDay } from "./today";
import { useSettleDelay } from "./use-settle-delay";
import { useTodaysFocus } from "./use-todays-focus";

const label = "text-xs font-medium tracking-wider text-muted uppercase";

// How long to wait, once it becomes due, before it actually appears — so it
// never pops in the instant she lands back on her notes list, the same
// "let the moment settle" pause as the notification popup (see
// notification-offer-prompt.tsx's own SHOW_DELAY_MS).
const SHOW_DELAY_MS = 3000;

// A third moment on her notes list, between the morning card and the evening
// reflection: once the morning card is answered, this offers a simple
// checklist for the rest of her day. It disappears the moment she has
// today's Daily Plan note (see hasDailyPlanNote in notes) — tapping "Add a
// task" is what makes one (see startDailyPlanNote) — or, failing that, once
// it's evening (reflect-slot.ts's own REFLECT_HOUR): if she never made one,
// the reflect card takes over instead of the two sitting on the list
// together. Same reasoning as waiting-for-reflection-card.tsx's own gate.
export default function DailyPlanCard() {
  const { state } = useTodaysFocus();
  const cardDay = currentCardDay();
  const local = readFocusState(cardDay);
  const flags = state.status === "ready" ? mergeFlags(state.card, local) : local;

  // Subscribed so this re-renders the instant today's note is created.
  useNotes();
  const isEvening = localHourIn(new Date(), deviceTimeZone()) >= REFLECT_HOUR;
  const due =
    Boolean(flags?.done) &&
    !flags?.eveningReflectionDone &&
    !isEvening &&
    !hasDailyPlanNote(cardDay);

  const visible = useSettleDelay(due, `daily-plan:${cardDay}`, SHOW_DELAY_MS);

  const navigate = useNavigate();
  if (!visible) return null;

  function addTask() {
    const id = startDailyPlanNote(cardDay);
    navigate(`/notes/${id}`);
  }

  return (
    <button
      type="button"
      onClick={addTask}
      className="relative block w-full animate-fade-in overflow-hidden rounded-card bg-[#f2e0d8] px-5 py-6 text-left shadow-soft transition-opacity duration-200 active:opacity-80"
    >
      {/* Bleeds off the right edge like the morning and reflection cards'
          own illustrations, just narrower (about 20% smaller), and behind
          the text (it comes first in the markup, so the text below paints
          over it) rather than confined to its own column beside it. A
          narrower card (mobile width) crops further into the picture, so
          its left edge is faded into the card's own background rather than
          left as a hard cut — same idea as todays-focus-card.tsx's own
          image fade. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 translate-x-[14%] overflow-hidden"
      >
        <img
          src="/daily-cards/daily-plan-notebook-pen.png"
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
        <p className={label}>Daily plan</p>
        <h2 className="mt-2 font-serif text-[25px] leading-[1.15] font-medium">
          Plan your day with intention <span className="text-accent">✦</span>
        </h2>
        <p className="mt-2 text-[14px] leading-snug text-ink-soft">
          A little structure for the day you want.
        </p>
        <span className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
          Add a task
          <span aria-hidden="true">→</span>
        </span>
      </div>

      {/* Same warm sweep as the morning and reflection cards — still
          waiting on her, so it still deserves a nudge. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
      </div>
    </button>
  );
}
