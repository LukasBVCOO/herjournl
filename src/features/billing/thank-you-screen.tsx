import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { posthog } from "@/lib/posthog";
import { refresh } from "./access-store";
import { BECOMELY_PLUS_DECORATOR } from "./decorator";
import { formatDay } from "./format-day";
import { PLANS } from "./plans";
import { useAccess } from "./use-access";

// Stripe tells our server a few seconds after she pays (stripe-webhook), so
// her access is asked again every 2 seconds, for up to 30 seconds, until it
// shows. The page thanks her straight away: Stripe only sends her here once
// the payment has gone through.
const POLL_MS = 2000;
const POLL_TRIES = 15;

// Where Stripe sends her after paying (create-checkout's success address,
// /thank-you): a page of its own that thanks her, then takes her home.
// Exactly one screen tall on a phone, like the paywall.
export default function ThankYouScreen() {
  const navigate = useNavigate();
  const access = useAccess();
  const [gaveUp, setGaveUp] = useState(false);
  const counted = useRef(false);

  const known = access.status === "known" ? access.access : null;
  const active = known?.reason === "subscription" || known?.reason === "lifetime";

  useEffect(() => {
    if (counted.current) return;
    counted.current = true;
    posthog?.capture("subscription_started");
  }, []);

  const waiting = !active && !gaveUp;
  useEffect(() => {
    if (!waiting) return;
    refresh();
    let tries = 0;
    const timer = window.setInterval(() => {
      tries += 1;
      if (tries >= POLL_TRIES) {
        window.clearInterval(timer);
        setGaveUp(true);
        return;
      }
      refresh();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [waiting]);

  const plan = active && known?.plan ? PLANS[known.plan] : null;
  const renews = active && known?.currentPeriodEnd ? formatDay(known.currentPeriodEnd) : null;

  // Each part arrives a moment after the one before (the sparkles first).
  const after = (ms: number) => ({ animationDelay: `${ms}ms` });

  return (
    <main className="mx-auto flex h-dvh w-full max-w-md flex-col items-center px-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
      <div aria-hidden="true" className="flex-1" />

      <img
        src={BECOMELY_PLUS_DECORATOR}
        alt=""
        aria-hidden="true"
        className="h-[clamp(72px,16dvh,140px)] w-auto shrink-0 animate-settle-in motion-reduce:animate-none"
      />

      <h1
        style={after(250)}
        className="mt-[clamp(14px,2.8dvh,28px)] max-w-[330px] animate-rise-in font-serif text-[clamp(28px,4.6dvh,36px)] leading-[1.1] font-medium text-balance motion-reduce:animate-none"
      >
        Thank you for investing in{" "}
        {/* The sign-off never drops onto a line of its own. */}
        <span className="whitespace-nowrap">
          yourself <span className="text-accent">✦</span>
        </span>
      </h1>
      <p
        style={after(400)}
        className="mt-3 max-w-[310px] animate-rise-in text-[15px] leading-snug text-pretty text-ink-soft motion-reduce:animate-none"
      >
        Your daily focus card, evening reflections and 369 affirmations are yours, every day. Keep
        showing up for the version of you you&rsquo;re becoming.
      </p>

      <p
        role="status"
        style={after(550)}
        className="mt-6 animate-rise-in text-[13px] text-ink-soft tabular-nums motion-reduce:animate-none"
      >
        {plan ? (
          <>
            Becomely+ {plan.label} · {plan.price} a {plan.per}
            {renews && <span className="block">Renews {renews}</span>}
          </>
        ) : waiting
            ? "Switching on Becomely+…"
            : "Becomely+ will be open in a few minutes."}
      </p>

      {/* Holds the button at the bottom of a phone screen, within thumb's
          reach; on a computer it sits with the words instead. */}
      <div aria-hidden="true" className="min-h-8 flex-1 md:h-10 md:flex-none" />

      <button
        type="button"
        onClick={() => navigate("/", { replace: true })}
        className="h-[52px] w-full shrink-0 rounded-full bg-ink text-[16px] font-medium text-paper transition-opacity duration-200 hover:opacity-90 active:opacity-80"
      >
        Begin my ritual
      </button>

      <div aria-hidden="true" className="hidden md:block md:flex-1" />
    </main>
  );
}
