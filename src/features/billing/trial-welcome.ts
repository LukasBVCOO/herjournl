import { useSyncExternalStore } from "react";
import { getSession, subscribe as subscribeToSession } from "@/lib/session";

// "Tell her her trial has started" — set once when she finishes onboarding
// (onboarding's reveal screen), cleared when she closes the welcome sheet
// (trial-welcome-prompt.tsx). Kept on this phone, per person. Other popups
// wait while it's due (after-trial-welcome.tsx), so they come one at a time.
const KEY = "becomely:trial-welcome-due";
const listeners = new Set<() => void>();

function changed() {
  listeners.forEach((listener) => listener());
}

export function markTrialWelcomeDue() {
  const userId = getSession().userId;
  if (!userId) return;
  try {
    localStorage.setItem(KEY, userId);
  } catch {
    // Storage blocked: she just won't see the welcome sheet.
  }
  changed();
}

export function trialWelcomeDue(): boolean {
  const userId = getSession().userId;
  try {
    return Boolean(userId) && localStorage.getItem(KEY) === userId;
  } catch {
    return false;
  }
}

export function clearTrialWelcome() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to clear.
  }
  changed();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const stopSession = subscribeToSession(listener);
  return () => {
    listeners.delete(listener);
    stopSession();
  };
}

export function useTrialWelcomeDue(): boolean {
  return useSyncExternalStore(subscribe, trialWelcomeDue, trialWelcomeDue);
}
