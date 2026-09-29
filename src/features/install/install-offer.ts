// Whether to offer her the "add to your home screen" card, and recording
// that she put it off or that she has installed. This lives on her account (in
// the database), not just this device: the offer can happen on a computer and
// only be acted on later on her phone — a different browser entirely. Only
// account-level storage lets the phone's "installed!" turn off the card on
// the computer too.
//
// The card stays on her notes list until she taps "Not now"; nothing hides it
// on its own. "Not now" puts it away for 3 days, and then it comes back —
// every 3 days, for as long as she hasn't installed (founder, 2026-09-29).
// Once she has installed, it never appears again.

import { posthog } from "@/lib/posthog";
import { getSession } from "@/lib/session";
import { supabase } from "@/lib/supabase/client";

// How long "Not now" puts it away for.
const NOT_NOW_GAP_MS = 3 * 24 * 60 * 60 * 1000;
// The database keeps the "Not now" count between 0 and 3; past 3 it simply
// stays at 3 (the count only matters for knowing she has said it at all).
const MAX_COUNT = 3;

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

// Whether the timing alone says the card is due right now. The "has she
// reached the moment worth interrupting for" question (her first daily note)
// is decided by the caller, not here. `count` is how many times she has
// said "Not now" (0 to 3), and `lastShownAt` when she last did.
export function isOfferDue(state: InstallOfferState, now: Date = new Date()): boolean {
  if (state.installed) return false;
  if (state.count === 0 || !state.lastShownAt) return true;
  return now.getTime() - Date.parse(state.lastShownAt) >= NOT_NOW_GAP_MS;
}

// Records that she tapped "Not now" (or "Got it" on a computer), which starts
// the 3 days before it comes back. `count` is the value it was read as.
export async function recordNotNow(count: number): Promise<void> {
  const userId = getSession().userId;
  if (!userId) return;
  try {
    await supabase
      .from("profiles")
      .update({
        install_prompt_count: Math.min(count + 1, MAX_COUNT),
        install_prompt_last_shown_at: new Date().toISOString(),
      })
      .eq("id", userId);
  } catch {
    // Best effort: if this doesn't save, the worst case is seeing the card
    // again sooner than intended.
  }
}

// Records that she has installed. Safe to call more than once (setting true to
// true is harmless) — called whenever the browser's own live signal says she
// has, from whichever device noticed it, however she got there (the card, the
// header button or her browser's own menu).
export async function recordInstalled(): Promise<void> {
  const userId = getSession().userId;
  if (!userId) return;
  try {
    // Only updates while not yet marked installed, so a returned row means this
    // is her first install and is counted in analytics exactly once per account.
    const { data } = await supabase
      .from("profiles")
      .update({ pwa_installed: true })
      .eq("id", userId)
      .not("pwa_installed", "is", true)
      .select("id");
    if (data && data.length > 0) posthog?.capture("app_installed");
  } catch {
    // Best effort: the next time this runs (another visit) it tries again.
  }
}
