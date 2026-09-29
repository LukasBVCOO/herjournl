// Opens Stripe's payment page (Checkout) for the plan she picked on the
// paywall, and answers with its address; the app then sends her there.
// Called from the app with her own login token, so it only ever starts a
// checkout for the account that token belongs to.
//
//   1. Refuses if she already has Becomely+ (founding member or paying), so
//      no one ends up with two subscriptions.
//   2. Finds her Stripe customer, or creates one and saves it straight away,
//      so she has exactly one even if she leaves the payment page unpaid and
//      comes back later.
//   3. Charges her straight away, even if she still has trial days left
//      (founder, 2026-09-27: paying now means paying now).
//   4. Puts her user id on the subscription, which is how the webhook
//      (stripe-webhook) knows whose it is once she pays.
//
// Stripe only ever gets her email and user id. Nothing from her journal.
//
// Secrets: STRIPE_SECRET_KEY (shared with stripe-webhook). The prices are
// found by their lookup keys, so the same code works in the sandbox and live.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

// Placeholder key only so the function can start before the secret is added;
// every request is refused until it is.
const stripe = new Stripe(STRIPE_SECRET_KEY || "sk_missing", { httpClient: Stripe.createFetchHttpClient() });

const LOOKUP_KEYS = {
  monthly: "becomely_plus_monthly",
  yearly: "becomely_plus_yearly",
} as const;
type Plan = keyof typeof LOOKUP_KEYS;

// Where she may be sent back to after paying: the app's own addresses only,
// never an address the request makes up.
const ALLOWED_ORIGINS = [
  "https://becomely.co",
  "https://www.becomely.co",
  "https://herjournl.netlify.app",
  "http://localhost:3000",
];
const DEFAULT_ORIGIN = "https://herjournl.netlify.app";

// The app calls this straight from the browser, so it must answer the
// browser's "may I call you?" check first.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function reply(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function returnOrigin(req: Request): string {
  const origin = req.headers.get("Origin") ?? "";
  return ALLOWED_ORIGINS.includes(origin) ? origin : DEFAULT_ORIGIN;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply({ ok: false, message: "Method not allowed" }, 405);
  if (!STRIPE_SECRET_KEY) return reply({ ok: false, reason: "failed", message: "Stripe is not set up" }, 500);

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return reply({ ok: false, reason: "signed-out" }, 401);

  let plan: Plan;
  try {
    const body = (await req.json()) as { plan?: unknown };
    if (body.plan !== "monthly" && body.plan !== "yearly") throw new Error();
    plan = body.plan;
  } catch {
    return reply({ ok: false, reason: "failed", message: "Unknown plan" }, 400);
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Who this token belongs to. Only that account is ever touched.
  const { data: who, error: whoError } = await admin.auth.getUser(token);
  const user = who?.user;
  if (whoError || !user) return reply({ ok: false, reason: "signed-out" }, 401);

  // 1. Already premium through a plan or as a founding member?
  const { data: accessRows, error: accessError } = await admin.rpc("access_for", { uid: user.id });
  if (accessError) return reply({ ok: false, reason: "failed", message: accessError.message }, 500);
  const access = (Array.isArray(accessRows) ? accessRows[0] : accessRows) as { reason: string } | undefined;
  if (access?.reason === "lifetime" || access?.reason === "subscription") {
    return reply({ ok: false, reason: "already-premium" }, 409);
  }

  try {
    // 2. Her one Stripe customer. A saved one can be missing on Stripe's side
    //    (for example one made in the sandbox once the live keys go in), so
    //    it's checked and replaced if gone.
    const { data: row } = await admin
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();
    let customerId = (row?.stripe_customer_id as string | null | undefined) ?? null;
    if (customerId) {
      try {
        const existing = await stripe.customers.retrieve(customerId);
        if ((existing as { deleted?: boolean }).deleted) customerId = null;
      } catch {
        customerId = null;
      }
    }
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      // Only these two columns: never touches lifetime or her plan.
      const { error: saveError } = await admin
        .from("subscriptions")
        .upsert(
          { user_id: user.id, stripe_customer_id: customerId, updated_at: new Date().toISOString() },
          { onConflict: "user_id" },
        );
      if (saveError) return reply({ ok: false, reason: "failed", message: saveError.message }, 500);
    }

    const prices = await stripe.prices.list({ lookup_keys: [LOOKUP_KEYS[plan]], active: true, limit: 1 });
    const price = prices.data[0];
    if (!price) return reply({ ok: false, reason: "failed", message: `No price for ${plan}` }, 500);

    const origin = returnOrigin(req);
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: price.id, quantity: 1 }],
      // 4. How the webhook knows whose subscription this is.
      subscription_data: { metadata: { user_id: user.id } },
      // A page of its own that thanks her (billing/thank-you-screen.tsx).
      success_url: `${origin}/thank-you`,
      cancel_url: `${origin}/premium`,
    });

    if (!session.url) return reply({ ok: false, reason: "failed", message: "No checkout address" }, 500);
    return reply({ ok: true, url: session.url });
  } catch (error) {
    return reply({ ok: false, reason: "failed", message: (error as Error).message }, 500);
  }
});
