import { useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import { BackIcon } from "@/components/icons";
import FocusCardView from "./focus-card-view";
import FocusResponse from "./focus-writing";
import { recordOpened } from "./today";
import { useTodaysFocus } from "./use-todays-focus";

const buttonClass =
  "mt-5 inline-flex h-11 items-center rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90";

// Shown when there is no card, and why. Never a made-up one.
function Notice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-10 animate-fade-in text-center">
      <p className="font-serif text-[28px] leading-tight font-medium">{title}</p>
      <div className="mt-3 flex flex-col items-center text-[16px] leading-snug text-ink-soft">
        {children}
      </div>
    </section>
  );
}

// Today's focus, in full. She arrives here from the card on her notes list.
export default function FocusScreen() {
  const { state, retry } = useTodaysFocus();

  // Once she has seen the card it is marked as opened, in the database and on
  // this phone. From then on it stays on her notes list, ready to answer.
  useEffect(() => {
    if (state.status === "ready") recordOpened(state.card);
  }, [state]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-12">
      <header className="flex items-center gap-1 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5">
        <Link
          to="/"
          aria-label="Back to notes"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </Link>
        <h1 className="font-serif text-[28px] font-medium">Today&rsquo;s focus</h1>
      </header>

      {state.status === "loading" ? (
        <p
          className="mt-24 animate-breathe text-center font-serif text-[26px] text-ink-soft motion-reduce:animate-none"
          role="status"
        >
          Aligning your focus <span className="text-accent">✦</span>
        </p>
      ) : state.status === "ready" ? (
        <>
          <FocusCardView card={state.card} />
          <FocusResponse card={state.card} />
        </>
      ) : state.status === "offline" ? (
        <Notice title="You're offline.">
          <p>Your focus will be ready as soon as you&rsquo;re back online.</p>
          <button type="button" onClick={retry} className={buttonClass}>
            Try again
          </button>
        </Notice>
      ) : state.status === "no-chart" ? (
        <Notice title="Let's check your birth details.">
          <p>Your daily focus is built from your chart, and we couldn&rsquo;t find it.</p>
          <Link to="/profile" className={buttonClass}>
            Review birth details
          </Link>
        </Notice>
      ) : state.status === "no-birth-time" ? (
        <Notice title="Your focus works best with your birth time.">
          <p>
            It helps us personalise the areas of life your chart connects to.
          </p>
          <Link to="/profile" className={buttonClass}>
            Add my birth time
          </Link>
        </Notice>
      ) : (
        <Notice title="Your focus is still aligning.">
          <p>We couldn&rsquo;t prepare today&rsquo;s card yet.</p>
          <button type="button" onClick={retry} className={buttonClass}>
            Try again
          </button>
        </Notice>
      )}
    </main>
  );
}
