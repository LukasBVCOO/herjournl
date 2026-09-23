import { useSyncExternalStore } from "react";
import { Link } from "react-router";
import { BackIcon } from "@/components/icons";
import { getSession, subscribe } from "@/lib/session";
import BirthDetailsSection from "./birth-details-section";
import ChartSection from "./chart-section";
import NameSection from "./name-section";
import { useProfile } from "./use-profile";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";

// Where she manages her details: her name, when and where she was born, and the
// chart that comes from them.
export default function ProfileScreen() {
  const session = useSyncExternalStore(subscribe, getSession, getSession);
  const { state, reload, retry } = useProfile();

  const profile = state.status === "ready" ? state.profile : null;
  // Everything the sections need has to be saved. If not, she hasn't finished
  // setting up, and the way to do that is onboarding. A missing birth time
  // only counts as unanswered when she hasn't explicitly said she doesn't
  // know it — otherwise a reduced-mode profile would wrongly look unfinished.
  const details =
    profile &&
    profile.name &&
    profile.dateOfBirth &&
    (profile.birthTime || !profile.birthTimeKnown) &&
    profile.birthPlace &&
    profile.place
      ? {
          name: profile.name,
          dateOfBirth: profile.dateOfBirth,
          birthTime: profile.birthTime ?? "",
          birthTimeKnown: profile.birthTimeKnown,
          birthPlace: profile.birthPlace,
          place: profile.place,
          chart: profile.chart,
        }
      : null;

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
        <h1 className="font-serif text-[28px] font-medium">Profile</h1>
      </header>

      {state.status === "loading" ? null : state.status === "error" ? (
        <p className="mt-16 text-center font-serif text-2xl text-ink-soft">
          We couldn&rsquo;t load your profile.{" "}
          <button
            type="button"
            onClick={retry}
            className="font-medium text-ink underline underline-offset-4"
          >
            Try again
          </button>
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {details && <NameSection name={details.name} onSaved={reload} />}

          <section className={cardClass}>
            <p className="text-xs text-muted">Email</p>
            <p className="mt-1 text-[17px] break-all">
              {session.email ?? "Your account"}
            </p>
          </section>

          {details ? (
            <>
              <ChartSection
                chart={details.chart}
                birthTimeKnown={details.birthTimeKnown}
                dateOfBirth={details.dateOfBirth}
                birthTime={details.birthTime}
                place={details.place}
                onSaved={reload}
              />
              <BirthDetailsSection
                dateOfBirth={details.dateOfBirth}
                birthTime={details.birthTime}
                birthTimeKnown={details.birthTimeKnown}
                birthPlace={details.birthPlace}
                place={details.place}
                onSaved={reload}
              />
            </>
          ) : (
            <section className={cardClass}>
              <p className="font-serif text-[24px] leading-tight font-medium">
                Your profile isn&rsquo;t set up yet.
              </p>
              <p className="mt-2 text-[15px] text-ink-soft">
                Answer a few questions and we&rsquo;ll create your chart.
              </p>
              <Link
                to="/onboarding"
                className="mt-4 inline-flex h-11 items-center rounded-full bg-ink px-6 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
              >
                Set up my profile
              </Link>
            </section>
          )}

        </div>
      )}
    </main>
  );
}
