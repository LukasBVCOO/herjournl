import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { posthog } from "@/lib/posthog";
import { refresh } from "./access-store";
import { BECOMELY_PLUS_DECORATOR } from "./decorator";
import { formatDay } from "./format-day";
import { PLANS } from "./plans";
import { clearTrialWelcome, trialWelcomeDue, useTrialWelcomeDue } from "./trial-welcome";
import { useAccess } from "./use-access";

// Waits a moment after she lands, so it never appears the instant the
// screen does.
const SHOW_DELAY_MS = 1200;

// Once, after onboarding: the first time she arrives on her home screen (her
// notes list), a sheet tells her that her 7 days of Premium have started,
// when they end, and what happens after. Nothing to pay today — the main
// button just closes it. Anywhere else, it waits for home.
//
// Mounted once for the whole app (app.tsx). Sits above the notifications
// popup if both are due, so she answers one at a time.
export default function TrialWelcomePrompt() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const access = useAccess();
  const [closed, setClosed] = useState(false);
  const [delayOver, setDelayOver] = useState(false);
  const mainButton = useRef<HTMLButtonElement>(null);

  const inTrial = access.status === "known" && access.access.reason === "trial";
  const welcomeDue = useTrialWelcomeDue();
  const due = !closed && welcomeDue && inTrial && pathname === "/";

  // What the phone remembers may be from before she finished onboarding (no
  // end date yet), so it's asked afresh, once, before the sheet shows.
  const refreshed = useRef(false);
  const missingEndDate =
    access.status === "known" && access.access.reason === "trial" && !access.access.trialEndsAt;
  useEffect(() => {
    if (refreshed.current || !missingEndDate || !trialWelcomeDue()) return;
    refreshed.current = true;
    refresh();
  }, [missingEndDate, pathname]);

  useEffect(() => {
    if (!due) return;
    const timer = setTimeout(() => setDelayOver(true), SHOW_DELAY_MS);
    return () => {
      clearTimeout(timer);
      setDelayOver(false);
    };
  }, [due]);

  const visible = due && delayOver;

  useEffect(() => {
    if (!visible) return;
    posthog?.capture("trial_welcome_shown");
    mainButton.current?.focus();
  }, [visible]);

  // She isn't on a trial at all (a founding member, say): nothing to tell her.
  useEffect(() => {
    if (access.status === "known" && access.access.reason !== "trial" && trialWelcomeDue()) {
      clearTrialWelcome();
    }
  }, [access]);

  if (!visible) return null;

  const trialEndsAt = access.status === "known" ? access.access.trialEndsAt : null;

  function close() {
    clearTrialWelcome();
    setClosed(true);
  }

  function seePlans() {
    close();
    navigate("/premium");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={close}
        className="absolute inset-0 animate-fade-in bg-ink/30"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="trial-welcome-title"
        className="relative w-full max-w-md animate-fade-in overflow-hidden rounded-t-sheet bg-surface px-6 pt-7 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-sheet"
      >
        <img
          src={BECOMELY_PLUS_DECORATOR}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute top-5 right-5 h-[104px] w-auto"
        />

        <div className="relative max-w-[70%]">
          <p className="text-xs font-medium tracking-wider text-muted uppercase">Becomely+</p>
          <h2
            id="trial-welcome-title"
            className="mt-2 font-serif text-[28px] leading-[1.1] font-medium"
          >
            Your 7 days of Becomely+ have started <span className="text-accent">✦</span>
          </h2>
        </div>

        <p className="relative mt-3 text-[15px] leading-snug text-ink-soft">
          {trialEndsAt ? `Everything is open until ${formatDay(trialEndsAt)}: ` : "Everything is open for 7 days: "}
          your daily focus card, evening reflections and 369 affirmations. After that, your notes
          stay free.
        </p>

        <div className="mt-5 flex divide-x divide-line rounded-card border border-line">
          {(["yearly", "monthly"] as const).map((id) => (
            <div key={id} className="flex-1 px-4 py-3 text-center">
              <p className="text-[13px] text-muted">{PLANS[id].label}</p>
              <p className="mt-0.5 text-[16px] font-medium text-ink">
                {PLANS[id].price}
                <span className="text-[13px] font-normal text-muted"> / {PLANS[id].per}</span>
              </p>
            </div>
          ))}
        </div>
        <p className="mt-2 text-center text-[12px] text-muted">
          No card needed · Choose a plan whenever you&rsquo;re ready
        </p>

        <button
          ref={mainButton}
          type="button"
          onClick={close}
          className="mt-5 h-[52px] w-full rounded-full bg-ink font-medium text-paper transition-opacity duration-200 hover:opacity-90"
        >
          Start my free week
        </button>
        <button
          type="button"
          onClick={seePlans}
          className="mx-auto mt-2 block py-2 text-[14px] text-ink-soft underline decoration-line underline-offset-4"
        >
          See plans
        </button>
      </div>
    </div>
  );
}
