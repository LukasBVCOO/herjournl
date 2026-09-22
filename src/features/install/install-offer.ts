// Whether to offer her the "add to your home screen" nudge, and recording
// that it was shown or that she has installed. This lives on her account (in
// the database), not just this device: the first offer can happen on a
// computer during onboarding, and only be acted on later on her phone — a
// different browser entirely. Only account-level storage lets the phone's
// "installed!" turn off the reminder that would otherwise keep showing on the
// computer.
//
// Offered at most 3 times, at progressively longer gaps, then never again.

import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";

const MAX_OFFERS = 3;

// How long to wait after offer N before offer N+1 is due.
const GAP_AFTER_OFFER: Record<number, number> = {
  1: 3 * 24 * 60 * 60 * 1000, // 3 days after the 1st
  2: 7 * 24 * 60 * 60 * 1000, // 7 days after the 2nd
};

export type InstallOfferState = {
  installed: boolean;
  count: number;
  lastShownAt: string | null;
};

// null when it could not be read (offline, no profile yet, ...) — nothing is
// ever offered when we don't actually know where she stands.
export async function readInstallOfferState(): Promise<InstallOfferState | null> {
  const userId = getSession().userId;
  if (!userId) return null;
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("pwa_installed, install_prompt_count, install_prompt_last_shown_at")
      .eq("id", userId)
      .maybeSingle();
    if (error || !data) return null;
    return {
      installed: data.pwa_installed === true,
      count: typeof data.install_prompt_count === "number" ? data.install_prompt_count : 0,
      lastShownAt: typeof data.install_prompt_last_shown_at === "string" ? data.install_prompt_last_shown_at : null,
    };
  } catch {
    return null;
  }
}

// Whether the timing alone says an offer is due right now. The "has she
// reached the moment worth interrupting for" question (her first daily note,
// for the very first offer) is decided by the caller, not here — this only
// knows about counts and gaps.
export function isOfferDue(state: InstallOfferState, now: Date = new Date()): boolean {
  if (state.installed || state.count >= MAX_OFFERS) return false;
  if (state.count === 0) return true; // the first offer has no gap to wait out
  const gap = GAP_AFTER_OFFER[state.count];
  if (!gap) return false; // past the schedule; never offer again
  if (!state.lastShownAt) return true; // no record of when — safe to offer
  return now.getTime() - Date.parse(state.lastShownAt) >= gap;
}

// Records that the offer was just shown, whatever she does with it next.
// `count` is the value it was read as just before showing, so this can only
// ever move the count forward by one.
export async function recordOfferShown(count: number): Promise<void> {
  const userId = getSession().userId;
  if (!userId) return;
  try {
    await supabase
      .from("profiles")
      .update({ install_prompt_count: count + 1, install_prompt_last_shown_at: new Date().toISOString() })
      .eq("id", userId);
  } catch {
    // Best effort: if this doesn't save, the worst case is being offered again
    // a little sooner than intended, never more than the 3 times total.
  }
}

// Records that she has installed. Safe to call more than once (setting true to
// true is harmless) — called whenever the browser's own live signal says she
// has, from whichever device noticed it, however she got there (this popup or
// the header button).
export async function recordInstalled(): Promise<void> {
  const userId = getSession().userId;
  if (!userId) return;
  try {
    await supabase.from("profiles").update({ pwa_installed: true }).eq("id", userId);
  } catch {
    // Best effort: the next time this runs (another visit) it tries again.
  }
}
