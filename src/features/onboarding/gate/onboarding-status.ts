// Whether she has finished onboarding (profiles.onboarding_completed_at is
// set). Lives outside React like the other stores, so every gated screen
// shares one answer and one lookup. Nothing here is about her writing.
//
// "done" is remembered on this phone per person, so a finished account never
// waits (or flickers) on the check again — and so being offline never locks
// her out. Only a real "not finished" from the database gates anything.

import { getSession, registerSignOutHandler, subscribe as subscribeToSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";

export type OnboardingStatus = "checking" | "done" | "not-done";

const DONE_KEY = "becomely:onboarded";

let checkedFor: string | null = null;
let status: OnboardingStatus = "checking";
const listeners = new Set<() => void>();

function set(next: OnboardingStatus) {
  if (next === status) return;
  status = next;
  listeners.forEach((listener) => listener());
}

function rememberedDone(userId: string) {
  try {
    return localStorage.getItem(DONE_KEY) === userId;
  } catch {
    return false;
  }
}

function rememberDone(userId: string) {
  try {
    localStorage.setItem(DONE_KEY, userId);
  } catch {
    // Storage blocked: the database is simply asked again next time.
  }
}

async function check(userId: string) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_completed_at")
      .eq("id", userId)
      .maybeSingle();
    if (getSession().userId !== userId) return;
    // Couldn't ask (offline, server trouble): never lock her out over that.
    if (error) return set("done");
    const done = typeof data?.onboarding_completed_at === "string";
    if (done) rememberDone(userId);
    set(done ? "done" : "not-done");
  } catch {
    if (getSession().userId === userId) set("done");
  }
}

// Starts (or re-uses) the check for whoever is signed in now. Called while a
// screen is being drawn, so it updates the value quietly (the caller reads it
// straight after); only the lookup's answer, later, tells the screens.
function ensureChecked() {
  const userId = getSession().userId ?? null;
  if (userId === checkedFor) return;
  checkedFor = userId;
  if (!userId) {
    status = "checking";
    return;
  }
  if (rememberedDone(userId)) {
    status = "done";
    return;
  }
  status = "checking";
  void check(userId);
}

export function getOnboardingStatus(): OnboardingStatus {
  ensureChecked();
  return status;
}

export function subscribeToOnboardingStatus(listener: () => void) {
  listeners.add(listener);
  const stopSession = subscribeToSession(() => {
    ensureChecked();
    listener();
  });
  return () => {
    listeners.delete(listener);
    stopSession();
  };
}

// Called the moment onboarding saves her profile, so gated screens open at once.
export function markOnboardingDone() {
  const userId = getSession().userId;
  if (!userId) return;
  rememberDone(userId);
  checkedFor = userId;
  set("done");
}

registerSignOutHandler({
  prepare: async () => null,
  clear: async () => {
    checkedFor = null;
    status = "checking";
    try {
      localStorage.removeItem(DONE_KEY);
    } catch {
      // Nothing to clear.
    }
  },
});
