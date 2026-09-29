import { useEffect, useState } from "react";
import { Link } from "react-router";
import type { Access } from "./billing-api";
import { daysUntil, formatDay } from "./format-day";
import { PLANS } from "./plans";
import { openPortal } from "./stripe-actions";
import { useAccess } from "./use-access";

const cardClass = "rounded-card bg-card px-5 py-4 shadow-soft";
const primaryButton =
  "mt-4 flex h-11 w-full items-center justify-center rounded-full bg-ink text-[15px] font-medium text-paper transition-opacity duration-200 hover:opacity-90";
const rowClass =
  "flex w-full items-center justify-between py-3 text-left text-[15px] text-ink transition-opacity duration-200 active:opacity-70";

function Pill({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-surface px-2.5 py-0.5 text-[12px] font-medium text-ink-soft">
      {children}
    </span>
  );
}

// What she sees about her plan on Profile, whatever it is: a founding
// member (nothing to manage), in her trial, on the free plan, or subscribed —
// with everything she can do about it. Changing plan, her card, invoices and
// cancelling all happen on Stripe's own Customer Portal (stripe-actions.ts).
export default function SubscriptionSection() {
  const state = useAccess();
  if (state.status !== "known") return null;
  return <SubscriptionCard access={state.access} />;
}

function SubscriptionCard({ access }: { access: Access }) {
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // If she comes back from Stripe with the browser's back button, the phone
  // can show this page exactly as she left it, still "Opening…". Wake it up.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        setBusy(false);
        setMessage(null);
      }
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  async function manage() {
    if (busy) return;
    setBusy(true);
    setMessage("Opening your subscription settings…");
    const answer = await openPortal();
    // No answer means she's on her way to Stripe: keep "Opening…" showing.
    if (answer !== null) {
      setMessage(answer);
      setBusy(false);
    }
  }

  const heading = (title: string, pill?: string) => (
    <div className="flex items-center justify-between gap-3">
      <p className="text-[17px] font-medium">{title}</p>
      {pill && <Pill>{pill}</Pill>}
    </div>
  );

  const note = message && (
    <p role="status" className="mt-3 animate-fade-in text-[14px] text-ink-soft">
      {message}
    </p>
  );

  if (access.reason === "lifetime") {
    return (
      <section className={cardClass}>
        {heading("Becomely+", "Founding member")}
        <p className="mt-1 text-[15px] text-ink-soft">
          Full access, forever. Thank you for being here from the start{" "}
          <span className="text-gold">✦</span>
        </p>
      </section>
    );
  }

  if (access.reason === "trial") {
    const left = access.trialEndsAt ? daysUntil(access.trialEndsAt) : null;
    return (
      <section className={cardClass}>
        {heading("Free trial", left === null ? "7 days" : `${left} ${left === 1 ? "day" : "days"} left`)}
        <p className="mt-1 text-[15px] text-ink-soft">
          {access.trialEndsAt
            ? `Everything is open until ${formatDay(access.trialEndsAt)}. After that, your notes stay free and Becomely+ keeps the rest.`
            : "Your 7 days of everything start once you finish setting up."}
        </p>
        <Link to="/premium" className={primaryButton}>
          See plans
        </Link>
      </section>
    );
  }

  if (access.reason === "free") {
    return (
      <section className={cardClass}>
        {heading("Free plan")}
        <p className="mt-1 text-[15px] text-ink-soft">
          Your notes are always free. Becomely+ brings back your daily focus cards, reflections and
          affirmations.
        </p>
        <Link to="/premium" className={primaryButton}>
          Upgrade to Becomely+
        </Link>
      </section>
    );
  }

  // Subscribed.
  const plan = access.plan ? PLANS[access.plan] : null;
  const endDate = access.currentPeriodEnd ? formatDay(access.currentPeriodEnd) : null;
  return (
    <section className={cardClass}>
      {heading("Becomely+", plan ? plan.label : "Active")}
      <p className="mt-1 text-[15px] text-ink-soft">
        {plan && `${plan.price} a ${plan.per}. `}
        {access.cancelAtPeriodEnd
          ? endDate
            ? `Cancelled — you keep Becomely+ until ${endDate}.`
            : "Cancelled — you keep Becomely+ until the end of this period."
          : endDate
            ? `Renews on ${endDate}.`
            : ""}
      </p>

      <div className="mt-2 divide-y divide-line border-t border-line">
        {(access.cancelAtPeriodEnd
          ? ["Renew my subscription", "Update payment method", "Billing history"]
          : ["Change plan", "Update payment method", "Billing history", "Cancel subscription"]
        ).map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => void manage()}
            disabled={busy}
            className={`${rowClass} disabled:opacity-50`}
          >
            <span className={label === "Cancel subscription" ? "text-ink-soft" : ""}>{label}</span>
            <span aria-hidden="true" className="text-ink-soft">
              →
            </span>
          </button>
        ))}
      </div>
      {note}
    </section>
  );
}
