import { FunctionsHttpError } from "@supabase/supabase-js";
import { posthog } from "@/lib/posthog";
import { supabase } from "@/lib/supabase/client";
import { refresh } from "./access-store";
import type { PlanId } from "./plans";

// What the Subscribe and Manage buttons do:
//   startCheckout  Stripe Checkout, to pay for a plan (the create-checkout
//                  Edge Function makes the page and answers with its address)
//   openPortal     Stripe's Customer Portal, to change plan, update her
//                  card, see invoices or cancel (create-portal-session)
// Returns a message to show her, or null once it has sent her to Stripe.

export const NOT_YET_MESSAGE = "Subscriptions open very soon ✦ We’ll let you know the moment they do.";

const FAILED_MESSAGE = "We couldn’t open the payment page. Please try again in a moment.";

export async function startCheckout(plan: PlanId): Promise<string | null> {
  posthog?.capture("subscribe_tapped", { plan });
  if (!navigator.onLine) return "You need to be online to subscribe.";

  try {
    const { data, error } = await supabase.functions.invoke("create-checkout", { body: { plan } });
    if (error) {
      // A "no" from the function still carries its reason.
      const reason =
        error instanceof FunctionsHttpError
          ? ((await error.context.json().catch(() => null)) as { reason?: string } | null)?.reason
          : undefined;
      if (reason === "already-premium") {
        refresh();
        return "You already have Becomely+ ✦";
      }
      if (reason === "signed-out") return "Please log in again to subscribe.";
      return FAILED_MESSAGE;
    }
    const url = (data as { url?: unknown } | null)?.url;
    if (typeof url !== "string" || !url.startsWith("https://")) return FAILED_MESSAGE;
    window.location.assign(url);
    return null;
  } catch {
    return FAILED_MESSAGE;
  }
}

export async function openPortal(): Promise<string | null> {
  posthog?.capture("manage_subscription_tapped");
  if (!navigator.onLine) return "You need to be online to manage your subscription.";

  try {
    const { data, error } = await supabase.functions.invoke("create-portal-session", { body: {} });
    if (error) {
      const reason =
        error instanceof FunctionsHttpError
          ? ((await error.context.json().catch(() => null)) as { reason?: string } | null)?.reason
          : undefined;
      if (reason === "signed-out") return "Please log in again to manage your subscription.";
      if (reason === "no-subscription") return "There’s no subscription on this account yet.";
      return "We couldn’t open your subscription settings. Please try again in a moment.";
    }
    const url = (data as { url?: unknown } | null)?.url;
    if (typeof url !== "string" || !url.startsWith("https://")) {
      return "We couldn’t open your subscription settings. Please try again in a moment.";
    }
    window.location.assign(url);
    return null;
  } catch {
    return "We couldn’t open your subscription settings. Please try again in a moment.";
  }
}
