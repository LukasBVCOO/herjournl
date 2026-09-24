import { Link } from "react-router";
import { mergeFlags, readFocusState } from "./focus-state";
import { deviceTimeZone, localHourIn } from "./local-day";
import { REFLECT_HOUR, reflectSlotView } from "./reflect-slot";
import { currentCardDay } from "./today";
import { useTodaysFocus } from "./use-todays-focus";

const label = "text-xs font-medium tracking-wider text-muted uppercase";

// A second small moment in the day, below (never alongside — see
// reflect-slot.ts) the morning card: once that's answered, this offers the
// same "tap me" teaser as the morning card, just its own question and its
// own screen (/reflect). Answering it doesn't make a new note; it's added to
// the end of today's own daily-focus note.
export default function ReflectCard() {
  const { state } = useTodaysFocus();
  const local = readFocusState(currentCardDay());

  // What is known about today's card: the card itself once it has been
  // found, otherwise what this phone remembers of it — same pattern as
  // todays-focus-card.tsx.
  const known = state.status === "ready" ? { ...state.card, ...mergeFlags(state.card, local) } : local;

  const morningDone = state.status === "ready" ? state.card.done : Boolean(local?.done);
  const hasPrompt = Boolean(known?.eveningReflectionPrompt);
  const isEvening = localHourIn(new Date(), deviceTimeZone()) >= REFLECT_HOUR;
  const reflectionInfo = known ? { opened: known.eveningReflectionOpened, done: known.eveningReflectionDone } : null;

  const view = reflectSlotView(morningDone, hasPrompt, isEvening, reflectionInfo, state.status === "loading");
  if (view === "none" || !known) return null;

  if (view === "card") {
    return (
      <Link
        to="/reflect"
        className="relative block overflow-hidden rounded-card border border-line bg-[#f2e0d8] px-5 py-5 shadow-soft transition-opacity duration-200 active:opacity-80"
      >
        <img
          src="/daily-cards/reflection-hand-journal.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 h-full w-[64%] translate-x-[14%] object-cover object-right"
        />
        <div className="relative max-w-[58%]">
          <p className={label}>Evening reflection</p>
          <p className="mt-2 font-serif text-[19px] leading-snug text-ink-soft">
            {known.eveningReflectionPrompt}
          </p>
          <span className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
            Start writing
            <span aria-hidden="true">→</span>
          </span>
        </div>

        {/* Same warm sweep as the morning card — still waiting on her, so it
            still deserves a nudge. */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
        </div>
      </Link>
    );
  }

  return (
    <Link
      to="/reflect"
      className="relative block overflow-hidden rounded-card bg-[#f2e0d8] px-5 py-6 shadow-soft transition-opacity duration-200 active:opacity-80"
    >
      {/* The illustration bleeds off the right edge on purpose, same
          treatment as the morning card's own unrevealed illustration. */}
      <img
        src="/daily-cards/reflection-hand-journal.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 h-full w-[64%] translate-x-[14%] object-cover object-right"
      />
      <div className="relative max-w-[58%]">
        <p className={label}>Evening reflection</p>
        <h2 className="mt-2 font-serif text-[25px] leading-[1.15] font-medium">Time to reflect</h2>
        <p className="mt-2 text-[14px] leading-snug text-ink-soft">Tap to look back on your day.</p>
        <span className="mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[14px] font-medium text-paper">
          Reflect now
          <span aria-hidden="true">→</span>
        </span>
      </div>

      {/* Same warm diagonal sweep as the morning card's teaser — see
          --animate-card-shine in styles.css. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-2/3 -skew-x-12 animate-card-shine bg-[linear-gradient(115deg,transparent_30%,rgba(255,250,240,0.5)_50%,transparent_70%)] motion-reduce:hidden" />
      </div>
    </Link>
  );
}
