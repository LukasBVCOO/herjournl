import { getSession } from "@/lib/session";

// Remembers, on this phone, that she has finished onboarding — so the
// onboarding pages still sitting in the phone's back history send her home
// instead of back into the questions.
const KEY = "becomely:onboarding-finished";

export function markOnboardingFinished() {
  const userId = getSession().userId;
  if (!userId) return;
  try {
    localStorage.setItem(KEY, userId);
  } catch {
    // Storage blocked: the history fix in reveal-screen.tsx still applies.
  }
}

export function onboardingFinishedHere(): boolean {
  const userId = getSession().userId;
  try {
    return Boolean(userId) && localStorage.getItem(KEY) === userId;
  } catch {
    return false;
  }
}
