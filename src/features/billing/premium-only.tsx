import type { ReactNode } from "react";
import { isLocked } from "./access-store";
import PaywallScreen from "./paywall-screen";
import { useAccess } from "./use-access";

// Wraps anything that's part of Premium (the focus card, the evening
// reflection, affirmations). Shows it while she's in her trial, subscribed
// or a founding member; once she's known to be on the free plan, shows the
// paywall instead (or `fallback`, where a whole screen would be too much —
// like the card on her notes list). The address stays the same, so the
// moment she subscribes the screen itself appears.
//
// While it's still being asked (first open, nothing remembered) nothing is
// shown, so a premium screen never flashes before the paywall. If it can't be
// asked at all, it stays open rather than lock her out by mistake.
export default function PremiumOnly({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const access = useAccess();
  if (access.status === "loading") return null;
  if (isLocked(access)) return fallback === undefined ? <PaywallScreen /> : fallback;
  return children;
}
