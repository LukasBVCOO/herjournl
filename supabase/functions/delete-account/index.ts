// Deletes the signed-in person's account and everything in it, for good.
// Called from the app (Profile → Delete account) with her own login token;
// it can only ever delete the account that token belongs to.
//
//   0. Her Stripe customer, if she ever started paying. Deleting it cancels
//      any subscription straight away and removes her saved card, so she is
//      never charged for an account that no longer exists. If Stripe can't
//      be reached, nothing is deleted and she's asked to try again.
//   1. Her vision board photos, from the private photo folder. Photos can
//      only be removed through the Storage service, and nothing else would
//      remove them once the account is gone.
//   2. The account itself. Every table that holds her data (profiles, notes,
//      daily_focus_cards, push_subscriptions, notification_log,
//      subscriptions) is set to delete its rows along with the account, so
//      this one step removes the rest.
//
// Never reads or returns anything she wrote; only whether it worked.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import Stripe from "npm:stripe@17";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const BUCKET = "vision-board";

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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return reply({ ok: false, message: "Method not allowed" }, 405);

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return reply({ ok: false, message: "Not signed in" }, 401);

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Who this token belongs to. Only that account is ever touched.
  const { data: who, error: whoError } = await admin.auth.getUser(token);
  const userId = who?.user?.id;
  if (whoError || !userId) return reply({ ok: false, message: "Not signed in" }, 401);

  // 0. Her Stripe customer, and with it any subscription.
  const { data: billing, error: billingError } = await admin
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (billingError) return reply({ ok: false, step: "subscription", message: billingError.message }, 500);
  const customerId = billing?.stripe_customer_id as string | null | undefined;
  if (customerId) {
    if (!STRIPE_SECRET_KEY) {
      return reply({ ok: false, step: "subscription", message: "Stripe is not set up" }, 500);
    }
    const stripe = new Stripe(STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
    try {
      await stripe.customers.del(customerId);
    } catch (error) {
      // Already gone on Stripe's side (for example a sandbox customer once
      // the live keys are in): nothing left to cancel.
      if ((error as { code?: string }).code !== "resource_missing") {
        return reply({ ok: false, step: "subscription", message: (error as Error).message }, 500);
      }
    }
  }

  // 1. Her photos, a page at a time until the folder is empty.
  for (let round = 0; round < 100; round++) {
    const { data: files, error } = await admin.storage.from(BUCKET).list(userId, { limit: 1000 });
    if (error) return reply({ ok: false, step: "photos", message: error.message }, 500);
    if (!files || files.length === 0) break;
    const { error: removeError } = await admin.storage
      .from(BUCKET)
      .remove(files.map((file) => `${userId}/${file.name}`));
    if (removeError) return reply({ ok: false, step: "photos", message: removeError.message }, 500);
  }

  // 2. The account, and with it every row of hers in every table.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) return reply({ ok: false, step: "account", message: deleteError.message }, 500);

  return reply({ ok: true });
});
