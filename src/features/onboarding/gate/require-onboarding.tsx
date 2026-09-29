import { useSyncExternalStore, type ReactNode } from "react";
import { Link } from "react-router";
import { getOnboardingStatus, subscribeToOnboardingStatus } from "./onboarding-status";

// Wraps a screen that needs her chart (Affirmations, her Birth chart). Until
// she has finished onboarding it shows a short message and the way back into
// it instead of the screen; once she has, the screen itself. While the answer
// is still being fetched (only ever on a first visit), nothing is shown yet.
export default function RequireOnboarding({
  children,
  // What finishing unlocks here, e.g. "your birth chart".
  unlocks,
  // The app's bottom bar, handed in by the route (app.tsx) so this folder
  // doesn't depend on it.
  footer,
}: {
  children: ReactNode;
  unlocks: string;
  footer?: ReactNode;
}) {
  const status = useSyncExternalStore(subscribeToOnboardingStatus, getOnboardingStatus, getOnboardingStatus);

  if (status === "done") return children;
  if (status === "checking") return null;

  return (
    <>
      <main className="mx-auto flex w-full max-w-md flex-1 animate-fade-in flex-col items-center justify-center px-6 pb-32 text-center">
        <img
          src="/onboarding-images/onboarding-incomplete-lock-key.png"
          alt=""
          width={168}
          height={168}
          className="mb-4 h-[168px] w-[168px]"
        />
        <h1 className="font-serif text-[28px] leading-tight font-medium text-ink">
          You haven&rsquo;t set up your profile yet
        </h1>
        <p className="mt-2 text-[15px] leading-snug text-ink-soft">Finish setting up to see {unlocks}.</p>
        <Link
          to="/onboarding"
          className="mt-6 inline-flex h-12 items-center rounded-full bg-ink px-7 text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Finish setup
        </Link>
      </main>
      {footer}
    </>
  );
}
