// Opens Stripe's Customer Portal for her, and answers with its address; the
// app then sends her there. It's Stripe's own page for everything about her
// plan: switching monthly/yearly, updating her card, seeing invoices, and
// cancelling. What she's allowed to do there is set in Stripe (Settings ->
// Billing -> Customer portal), not here.
//
// Called from the app (Profile) with her own login token, so it only ever
// opens the portal for the account that token belongs to. Every change she
// makes there reaches us through the webhook (stripe-webhook).
//
// Secrets: STRIPE_SECRET_KEY (shared with stripe-webhook and create-checkout).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";

// Placeholder key only so the function can start before the secret is added;
// every request is refused until it is.
const stripe = new Stripe(STRIPE_SECRET_KEY || "sk_missing", { httpClient: Stripe.createFetchHttpClient() });

// Where she may be sent back to: the app's own addresses only.
const ALLOWED_ORIGINS = [
  "https://app.becomely.co",
  "https://becomely.co",
  "https://www.becomely.co",
  "https://herjournl.netlify.app",
  "http://localhost:3000",
];
const DEFAULT_ORIGIN = "https://app.becomely.co";

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

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Who this token belongs to. Only that account is ever touched.
  const { data: who, error: whoError } = await admin.auth.getUser(token);
  const userId = who?.user?.id;
  if (whoError || !userId) return reply({ ok: false, reason: "signed-out" }, 401);

  const { data: row, error: rowError } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (rowError) return reply({ ok: false, reason: "failed", message: rowError.message }, 500);
  const customerId = row?.stripe_customer_id as string | null | undefined;
  // Never started paying: nothing to manage.
  if (!customerId) return reply({ ok: false, reason: "no-subscription" }, 404);

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${returnOrigin(req)}/profile`,
    });
    return reply({ ok: true, url: session.url });
  } catch (error) {
    return reply({ ok: false, reason: "failed", message: (error as Error).message }, 500);
  }
});
