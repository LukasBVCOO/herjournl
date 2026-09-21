import { Link } from "react-router";
import { mergeFlags, readFocusState } from "./focus-state";
import { slotView } from "./focus-slot";
import { currentCardDay } from "./today";
import { useTodaysFocus } from "./use-todays-focus";

const cardClass =
  "block rounded-card bg-card px-5 py-5 shadow-soft transition-opacity duration-200 active:opacity-80";

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

  const view = slotView(known, state.status === "loading");
  if (view === "none" || (view === "card" && !known)) return null;

  if (view === "card" && known) {
    return (
      <Link to="/focus" className={cardClass}>
        <p className={label}>Today&rsquo;s focus</p>
        <p className="mt-2 text-[14px] font-medium text-ink-soft">{known.label}</p>
        <p className="mt-1 font-serif text-[26px] leading-tight font-medium">
          {known.title}
        </p>
        <p className="mt-2 font-serif text-[19px] leading-snug text-ink-soft">
          {known.prompt}
        </p>
        <p className="mt-3 text-[15px] font-medium">Write your answer</p>
      </Link>
    );
  }

  return (
    <Link to="/focus" className={cardClass}>
      <p className={label}>Today&rsquo;s focus</p>
      <p className="mt-2 font-serif text-[26px] leading-tight font-medium">
        Your focus for today is ready <span className="text-accent">✦</span>
      </p>
      <p className="mt-2 text-[15px] text-ink-soft">Tap to reveal</p>
    </Link>
  );
}
