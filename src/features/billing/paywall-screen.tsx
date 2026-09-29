import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { posthog } from "@/lib/posthog";
import { useGoBack } from "@/lib/use-go-back";
import { BECOMELY_PLUS_DECORATOR } from "./decorator";
import { formatDay } from "./format-day";
import { PLAN_ORDER, PLANS, type PlanId } from "./plans";
import SparkleMark from "./sparkle-mark";
import { startCheckout } from "./stripe-actions";
import { useAccess } from "./use-access";

// What Becomely+ brings, in the founder's words: a bold lead-in, then what
// it means for her day.
const BENEFITS = [
  {
    title: "Wake up knowing your focus.",
    text: "Your birth chart shows which area of your life is lit up today, so your energy goes where it counts.",
  },
  {
    title: "Turn intentions into results.",
    text: "Set one each morning. Check what you did each night.",
  },
  {
    title: "Make your goals feel real.",
    text: "Repeat them 3, 6 and 9 times a day with 369 affirmations.",
  },
  {
    title: "See the life you’re building.",
    text: "Unlimited vision boards for everything you’re calling in.",
  },
];

// Becomely+ (the paid plan): what it brings back, the two plans, and one button.
// Shown in place of a premium screen (the focus card, the evening
// reflection, affirmations) once her 7-day trial is over — see
// premium-only.tsx — and at /premium, from Profile.
//
// On a phone the plans and button sit at the bottom of the card, within
// thumb's reach, and stay there: on a short phone the benefits scroll
// underneath them rather than pushing them off the screen. The sparkles and
// headline shrink a little on shorter screens (sized by screen height). Any
// spare height is shared out (a third above, two thirds between), so a tall
// phone doesn't leave one big hole in the middle. On a computer everything
// sits together in the middle instead.
export default function PaywallScreen() {
  const goBack = useGoBack();
  const access = useAccess();
  // Sent here by trying to start a second vision board (vision-board-limit.ts).
  const fromVisionBoard =
    (useLocation().state as { reason?: string } | null)?.reason === "vision-board";
  const [plan, setPlan] = useState<PlanId>("yearly");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const known = access.status === "known" ? access.access : null;
  const trialOver = known?.reason === "free";
  const inTrial = known?.reason === "trial";
  const alreadyPremium = known?.reason === "lifetime" || known?.reason === "subscription";
  useEffect(() => {
    posthog?.capture("paywall_viewed", { trial_over: trialOver });
  }, [trialOver]);

  // If she comes back from Stripe with the browser's back button, the phone
  // can show this page exactly as she left it, button still saying
  // "One moment…". Wake it up again.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) setBusy(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  async function subscribe() {
    setBusy(true);
    const answer = await startCheckout(plan);
    // No answer means she's on her way to Stripe: keep "One moment…" showing.
    if (answer !== null) {
      setMessage(answer);
      setBusy(false);
    }
  }

  return (
    // The warm page behind, and the paywall itself on a white card of its
    // own: filling the phone screen (with a margin of the page showing
    // around it), or sized to its content in the middle of a computer screen.
    <main className="mx-auto flex h-dvh w-full max-w-md animate-fade-in flex-col px-2 pt-[max(0.5rem,env(safe-area-inset-top))] pb-[max(0.5rem,env(safe-area-inset-bottom))] md:justify-center md:py-10">
      <section className="relative flex min-h-0 flex-1 flex-col overflow-y-auto rounded-sheet bg-surface px-5 pt-4 pb-2 shadow-soft md:max-h-full md:flex-none md:px-6 md:py-8">
        <button
          type="button"
          onClick={goBack}
          aria-label="Close"
          className="absolute top-2 left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full text-ink-soft transition-colors duration-200 hover:text-ink"
        >
          <svg
            viewBox="0 0 24 24"
            width="22"
            height="22"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        <div aria-hidden="true" className="min-h-0 flex-1" />

        <img
          src={BECOMELY_PLUS_DECORATOR}
          alt=""
          aria-hidden="true"
          className="mx-auto mt-2 h-[clamp(56px,12dvh,112px)] w-auto shrink-0"
        />

        <h1 className="mt-[clamp(10px,2dvh,20px)] text-center font-serif text-[clamp(26px,4.2dvh,32px)] leading-[1.1] font-medium text-balance">
          {trialOver ? "Keep your daily ritual" : "Your full daily ritual"}
          {/* The sign-off never drops onto a line of its own. */}
          <span className="whitespace-nowrap">
            &nbsp;<span className="text-accent">✦</span>
          </span>
        </h1>
        <p className="mx-auto mt-2 max-w-[320px] text-center text-[14px] leading-snug text-pretty text-ink-soft">
          Become her, one day at a time. Becomely+ turns your goals into a daily routine you
          actually follow.
        </p>

        <ul className="mt-[clamp(16px,3dvh,28px)] flex flex-col gap-[clamp(10px,1.8dvh,16px)]">
          {BENEFITS.map((benefit) => (
            <li key={benefit.title} className="flex gap-3">
              <SparkleMark className="mt-[5px] h-3 w-3 shrink-0 text-gold" />
              <p className="text-[14px] leading-snug text-pretty text-ink-soft">
                <strong className="font-medium text-ink">{benefit.title}</strong> {benefit.text}
              </p>
            </li>
          ))}
        </ul>

        {/* The rest of the spare height, so the plans and the button sit at the
            bottom of a phone screen; on a computer, a fixed gap instead. */}
        <div aria-hidden="true" className="min-h-4 flex-[2] md:h-10 md:flex-none" />

        {alreadyPremium ? (
          <p className="flex items-center justify-center gap-2 rounded-card bg-card px-5 py-4 text-center text-[15px] text-ink-soft">
            You already have Becomely+
            <SparkleMark className="h-3 w-3 text-gold" />
          </p>
        ) : (
          <>
            <div role="radiogroup" aria-label="Plan" className="flex flex-col gap-2">
              {PLAN_ORDER.map((id) => {
                const option = PLANS[id];
                const checked = plan === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={checked}
                    onClick={() => {
                      setPlan(id);
                      setMessage(null);
                    }}
                    className={`flex items-center gap-3 rounded-card border px-4 py-3 text-left transition-[border-color,background-color,transform] duration-200 active:scale-[0.99] ${
                      checked
                        ? "border-ink bg-paper"
                        : "border-line bg-transparent hover:border-ink/35 hover:bg-paper/60"
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        checked ? "border-ink" : "border-line"
                      }`}
                    >
                      {checked && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
                    </span>
                    <span className="flex-1">
                      <span className="flex items-center gap-2">
                        <span className="text-[16px] font-medium text-ink">{option.label}</span>
                        {option.badge && (
                          <span className="rounded-full bg-blush px-2 py-0.5 text-[11px] font-medium text-accent-ink">
                            {option.badge}
                          </span>
                        )}
                      </span>
                      {option.note && (
                        <span className="mt-0.5 block text-[13px] text-ink-soft tabular-nums">
                          {option.note}
                        </span>
                      )}
                    </span>
                    <span className="text-right">
                      <span className="block text-[16px] font-medium text-ink tabular-nums">
                        {option.price}
                      </span>
                      <span className="block text-[12px] text-ink-soft">per {option.per}</span>
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => void subscribe()}
              disabled={busy}
              aria-busy={busy}
              className="mt-3.5 flex h-[52px] w-full shrink-0 items-center justify-center rounded-full bg-ink text-[16px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 disabled:opacity-60"
            >
              {busy ? "One moment…" : `Continue with ${PLANS[plan].label}`}
            </button>

            {/* The "opens soon" answer takes the small print's place rather
                than adding a line, so nothing gets pushed off the screen. */}
            {message ? (
              <p role="status" className="mt-2.5 animate-fade-in text-center text-[13px] leading-snug text-ink-soft">
                {message}
              </p>
            ) : (
              <p className="mt-2.5 text-center text-[12px] leading-snug text-ink-soft">
                Renews automatically until you cancel · Cancel anytime in Profile ·{" "}
                <Link to="/terms" className="underline decoration-line underline-offset-2 hover:text-ink">
                  Terms
                </Link>
              </p>
            )}
          </>
        )}

        <button
          type="button"
          onClick={goBack}
          className="mx-auto mt-1 block shrink-0 py-2 text-[14px] text-ink-soft underline decoration-line underline-offset-4"
        >
          {alreadyPremium ? "Back" : "Maybe later"}
        </button>
      </section>
    </main>
  );
}
