import { useSyncExternalStore } from "react";
import { Link, useLocation } from "react-router";
import { BackIcon, PackIcon } from "@/components/icons";
import BottomNav from "@/components/bottom-nav";
import { SubscriptionSection, useAccess } from "@/features/billing";
import { ProfileInstallCard } from "@/features/install";
import type { Chart, ReducedChart } from "@/features/onboarding";
import { getSession, subscribe } from "@/lib/session";
import { useGoBack } from "@/lib/use-go-back";
import BirthDetailsSection from "./birth-details-section";
import ChangeEmailSection from "./change-email-section";
import ChangePasswordSection from "./change-password-section";
import ChartSection from "./chart-section";
import NameSection from "./name-section";
import SettingsSection from "./settings-section";
import { Group } from "./settings-ui";
import { useProfile } from "./use-profile";

// Her profile: who she is at the top (name, Sun · Moon · Rising, a way into
// her full chart), then titled groups — her plan, her birth details, her
// account, and the app's settings (what used to be a screen of their own) —
// with logging out and deleting her account quietly at the very bottom.
export default function ProfileScreen() {
  const goBack = useGoBack();
  const session = useSyncExternalStore(subscribe, getSession, getSession);
  const { state, reload, retry } = useProfile();
  // Her plan only has something to show once it's known.
  const planKnown = useAccess().status === "known";
  // Sent here by an "Add birth time" prompt (the birth chart page): the birth
  // details open ready for her time.
  const addBirthTime =
    (useLocation().state as { addBirthTime?: boolean } | null)?.addBirthTime === true;

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
    <>
    <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col px-6 pb-32">
      <header className="pt-[max(1.25rem,env(safe-area-inset-top))]">
        {/* The last page she was actually on, not a fixed destination — she
            can reach this screen from more than one place now that the
            bottom nav (BottomNav) is on every main screen. */}
        <button
          type="button"
          onClick={goBack}
          aria-label="Back"
          className="-ml-3 flex h-11 w-11 items-center justify-center text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <BackIcon />
        </button>

        {/* Who this is: her name, and the three placements the whole app is
            built on, so the page opens on her rather than on a form. */}
        <div className="mt-3 mb-9">
          <h1 className="font-serif text-[34px] leading-[1.1] font-medium break-words text-ink">
            {details?.name ?? "Profile"}
          </h1>
          {details?.chart && (
            <p className="mt-2 text-[15px] text-ink-soft">
              {bigThree(details.chart)}
            </p>
          )}
          {details?.chart && (
            <Link
              to="/profile/chart"
              className="-ml-0.5 mt-3 inline-flex h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-[15px] font-medium text-ink shadow-soft transition-opacity duration-200 active:opacity-70"
            >
              <span className="text-gold">
                <PackIcon name="moon-stars" size={18} />
              </span>
              Your birth chart
            </Link>
          )}
          {/* Always here (until she's using the installed app), unlike the
              notes list's card, which she can put away. */}
          <ProfileInstallCard className="mt-5" />
        </div>
      </header>

      {state.status === "loading" ? null : (
        <div className="flex flex-col gap-9">
          {/* Her plan: founding member, trial, free or subscribed, and what
              she can do about it (billing feature). Already its own card. */}
          {planKnown && (
            <Group title="Your plan" bare>
              <SubscriptionSection />
            </Group>
          )}

          {state.status === "error" ? (
            <p className="text-center font-serif text-2xl text-ink-soft">
              We couldn&rsquo;t load your profile.{" "}
              <button
                type="button"
                onClick={retry}
                className="font-medium text-ink underline underline-offset-4"
              >
                Try again
              </button>
            </p>
          ) : details ? (
            <Group title="Birth details">
              <BirthDetailsSection
                dateOfBirth={details.dateOfBirth}
                birthTime={details.birthTime}
                birthTimeKnown={details.birthTimeKnown}
                birthPlace={details.birthPlace}
                place={details.place}
                onSaved={reload}
                addTime={addBirthTime}
              />
              <ChartSection
                chart={details.chart}
                birthTimeKnown={details.birthTimeKnown}
                dateOfBirth={details.dateOfBirth}
                birthTime={details.birthTime}
                place={details.place}
                onSaved={reload}
              />
            </Group>
          ) : (
            <section className="relative overflow-hidden rounded-card bg-card px-5 py-5 shadow-soft">
              <img
                src="/onboarding-images/onboarding-incomplete-lock-key.png"
                alt=""
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 -right-4 h-[128px] w-[128px] -translate-y-1/2"
              />
              <div className="relative max-w-[64%]">
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
              </div>
            </section>
          )}

          {state.status !== "error" && (
            <Group title="Account">
              {details && <NameSection name={details.name} onSaved={reload} />}
              <ChangeEmailSection email={session.email ?? ""} />
              <ChangePasswordSection />
            </Group>
          )}

          {/* Notifications, Recently deleted, Report a bug, Log out (what
              used to be the Settings screen). Shown even if her profile
              couldn't load, so logging out always works. */}
          <SettingsSection />
        </div>
      )}
    </main>
    <BottomNav />
    </>
  );
}

// "Taurus Sun · Cancer Moon · Leo Rising". Only what is certain: without a
// birth time there's no Rising, and a Sun or Moon that changed sign on her
// birthday is left out rather than guessed.
function bigThree(chart: Chart | ReducedChart): string {
  if (chart.kind === "full") {
    return `${chart.sun.sign} Sun · ${chart.moon.sign} Moon · ${chart.rising.sign} Rising`;
  }
  const parts: string[] = [];
  if (chart.sun.reliable) parts.push(`${chart.sun.sign} Sun`);
  if (chart.moon.reliable) parts.push(`${chart.moon.sign} Moon`);
  return parts.join(" · ");
}
