// The two ways to subscribe (founder, 2026-09-27: US prices, in dollars).
// Shown on the paywall and in Profile. The amounts Stripe actually charges
// are set on its own prices; these are only the words she reads.
export type PlanId = "yearly" | "monthly";

export const PLANS: Record<
  PlanId,
  { label: string; price: string; per: string; note: string | null; badge: string | null }
> = {
  yearly: {
    label: "Yearly",
    price: "$71.99",
    per: "year",
    // $71.99 / 12, and against 12 × $7.99 = $95.88.
    note: "$6.00 a month",
    badge: "Save 25%",
  },
  monthly: {
    label: "Monthly",
    price: "$7.99",
    per: "month",
    note: null,
    badge: null,
  },
};

export const PLAN_ORDER: PlanId[] = ["yearly", "monthly"];
