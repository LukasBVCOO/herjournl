// Asking the database whether she's premium, and why (see the
// "subscriptions" migration: public.my_access). Only ever her own answer.

import { supabase } from "@/lib/supabase/client";
import type { PlanId } from "./plans";

export type AccessReason = "lifetime" | "subscription" | "trial" | "free";

export type Access = {
  premium: boolean;
  reason: AccessReason;
  // When her 7-day trial ends; null until she has finished onboarding.
  trialEndsAt: string | null;
  plan: PlanId | null;
  // When the period she has paid for ends: the renewal date, or the last
  // day if she has cancelled.
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

const REASONS: AccessReason[] = ["lifetime", "subscription", "trial", "free"];

// Null when it couldn't be asked (offline, server trouble).
export async function fetchAccess(): Promise<Access | null> {
  try {
    const { data, error } = await supabase.rpc("my_access");
    const row = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | undefined;
    if (error || !row) return null;
    const reason = REASONS.includes(row.reason as AccessReason) ? (row.reason as AccessReason) : "free";
    return {
      premium: row.premium === true,
      reason,
      trialEndsAt: typeof row.trial_ends_at === "string" ? row.trial_ends_at : null,
      plan: row.plan === "monthly" || row.plan === "yearly" ? row.plan : null,
      currentPeriodEnd: typeof row.current_period_end === "string" ? row.current_period_end : null,
      cancelAtPeriodEnd: row.cancel_at_period_end === true,
    };
  } catch {
    return null;
  }
}
