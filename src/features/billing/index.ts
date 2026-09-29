// Becomely Premium. Every new account gets 7 days of everything from the
// moment she finishes onboarding; after that notes stay free, and the daily
// focus card, evening reflection and affirmations need a subscription.
// Founding users (accounts from before 2026-09-27) have it forever.
//
//   plans.ts                 the two plans and their prices, as she reads them
//   billing-api.ts           asks the database whether she's premium, and why
//   access-store.ts          that answer, shared and remembered on the phone
//   use-access.ts            the store, for a screen
//   stripe-actions.ts        Subscribe (Stripe Checkout) / Manage (Customer Portal)
//   paywall-screen.tsx       the paywall, at /premium and in place of premium screens
//   thank-you-screen.tsx     where Stripe sends her after paying, at /thank-you
//   premium-only.tsx         wraps a premium screen or card
//   premium-teaser-card.tsx  the focus card's stand-in on her notes list
//   subscription-section.tsx her plan, on Profile
//   trial-welcome*.ts(x)     once, after onboarding: "your 7 days have started"
//   vision-board-limit.ts    1 board, 10 photos, until she pays
export { default as PaywallScreen } from "./paywall-screen";
export { default as PremiumOnly } from "./premium-only";
export { default as PremiumTeaserCard } from "./premium-teaser-card";
export { default as SubscriptionSection } from "./subscription-section";
export { default as TrialWelcomePrompt } from "./trial-welcome-prompt";
export { default as AfterTrialWelcome } from "./after-trial-welcome";
export { default as ThankYouScreen } from "./thank-you-screen";
export { markTrialWelcomeDue } from "./trial-welcome";
export { useAccess } from "./use-access";
export { useVisionBoardLimit } from "./vision-board-limit";
export { isLocked } from "./access-store";
