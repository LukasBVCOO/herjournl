// Stripe tells us here whenever a subscription starts, renews, changes plan,
// fails a payment or ends. We copy the result into her row in
// public.subscriptions, which is the only thing the app reads to decide
// whether she's premium (see the "subscriptions" migration: access_for).
//
// How we know whose subscription it is: Checkout (the next step) puts her
// user id on the subscription as metadata.user_id. If that's ever missing we
// fall back to the Stripe customer id we saved the first time.
//
// Every call is checked with Stripe's signature, so no one else can make
// themselves premium by calling this address. We never trust the event's
// copy of the subscription: we ask Stripe for the current one, so events
// arriving out of order can't roll her back to an older state.
//
// Nothing about her journal is here or sent to Stripe.
//
// Secrets (Supabase dashboard -> Edge Functions -> Secrets):
//   STRIPE_SECRET_KEY       sk_live_... or sk_test_...
//   STRIPE_WEBHOOK_SECRET   whsec_..., shown when the endpoint is added in Stripe
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";

// Placeholder key only so the function can start before the secret is added;
// every request is refused until it is (see the check in Deno.serve below).
const stripe = new Stripe(STRIPE_SECRET_KEY || "sk_missing", { httpClient: Stripe.createFetchHttpClient() });
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// The events that can change whether she's premium.
const HANDLED = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "customer.subscription.paused",
  "customer.subscription.resumed",
  "invoice.paid",
  "invoice.payment_failed",
]);

function reply(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function idOf(value: string | { id: string } | null | undefined): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

// Which subscription an event is about, whatever kind of event it is.
function subscriptionIdOf(event: Stripe.Event): string | null {
  const object = event.data.object as unknown as Record<string, unknown>;
  if (event.type.startsWith("customer.subscription.")) return object.id as string;
  if (event.type === "checkout.session.completed") {
    return idOf(object.subscription as string | { id: string } | null);
  }
  if (event.type.startsWith("invoice.")) {
    // Older API versions put it on the invoice, newer ones under parent.
    const direct = idOf(object.subscription as string | { id: string } | null);
    if (direct) return direct;
    const parent = object.parent as { subscription_details?: { subscription?: string | { id: string } } } | null;
    return idOf(parent?.subscription_details?.subscription ?? null);
  }
  return null;
}

// Monthly or yearly, read from the price's billing interval, so the same code
// works with test and live prices without listing their ids.
function planOf(sub: Stripe.Subscription): "monthly" | "yearly" | null {
  const interval = sub.items.data[0]?.price?.recurring?.interval;
  if (interval === "month") return "monthly";
  if (interval === "year") return "yearly";
  return null;
}

// Newer API versions moved the period end onto the subscription's item.
function periodEndOf(sub: Stripe.Subscription): string | null {
  const item = sub.items.data[0] as unknown as { current_period_end?: number } | undefined;
  const seconds =
    item?.current_period_end ?? (sub as unknown as { current_period_end?: number }).current_period_end;
  return typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : null;
}

async function userIdFor(sub: Stripe.Subscription, customerId: string): Promise<string | null> {
  const fromMetadata = sub.metadata?.user_id;
  if (fromMetadata) return fromMetadata;
  const { data } = await admin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return (data?.user_id as string | undefined) ?? null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return reply({ ok: false, message: "Method not allowed" }, 405);
  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
    return reply({ ok: false, message: "Stripe secrets are not set" }, 500);
  }

  const signature = req.headers.get("Stripe-Signature");
  if (!signature) return reply({ ok: false, message: "Missing signature" }, 400);

  let event: Stripe.Event;
  try {
    const body = await req.text();
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
      undefined,
      cryptoProvider,
    );
  } catch {
    return reply({ ok: false, message: "Bad signature" }, 400);
  }

  if (!HANDLED.has(event.type)) return reply({ ok: true, ignored: event.type });

  const subscriptionId = subscriptionIdOf(event);
  // A one-off payment, not a subscription: nothing to record.
  if (!subscriptionId) return reply({ ok: true, ignored: "no subscription" });

  let sub: Stripe.Subscription;
  try {
    sub = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error) {
    // Stripe retries on any non-2xx answer, so a hiccup here fixes itself.
    return reply({ ok: false, message: (error as Error).message }, 500);
  }

  const customerId = idOf(sub.customer)!;
  const userId = await userIdFor(sub, customerId);
  if (!userId) {
    // Not one of ours (for example a subscription made by hand in Stripe).
    // Answer 200 so Stripe doesn't keep retrying something we can't place.
    return reply({ ok: true, ignored: "no user for this subscription" });
  }

  // She deleted her account (delete-account cancels her subscription first,
  // and Stripe then tells us it ended): nothing left to record.
  const { data: stillThere, error: lookupError } = await admin.auth.admin.getUserById(userId);
  if (!stillThere?.user) {
    // Only a clear "no such account" counts; any other hiccup is retried.
    if (lookupError && lookupError.status !== 404) {
      return reply({ ok: false, message: lookupError.message }, 500);
    }
    return reply({ ok: true, ignored: "account deleted" });
  }

  // If she cancelled and later subscribed again, a late message about the old,
  // ended subscription must not overwrite the new one.
  const ended = sub.status === "canceled" || sub.status === "incomplete_expired";
  if (ended) {
    const { data: current } = await admin
      .from("subscriptions")
      .select("stripe_subscription_id")
      .eq("user_id", userId)
      .maybeSingle();
    const currentId = current?.stripe_subscription_id as string | null | undefined;
    if (currentId && currentId !== sub.id) return reply({ ok: true, ignored: "older subscription" });
  }

  // Never touches `lifetime`: a founding user stays premium whatever happens.
  const { error } = await admin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: sub.id,
      status: sub.status,
      plan: planOf(sub),
      current_period_end: periodEndOf(sub),
      cancel_at_period_end: sub.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );
  if (error) return reply({ ok: false, message: error.message }, 500);

  return reply({ ok: true, status: sub.status });
});
