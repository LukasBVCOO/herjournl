// Runs every 15 minutes (pg_cron, see the "daily_notifications_schedule"
// migration), triggered over HTTP through pg_net. Sends the morning and
// evening nudge to whoever is currently in their own local send window and
// hasn't had one yet today. The two messages, and when they go out, are
// edited directly in Supabase's Table Editor (notification_settings) — this
// function never hardcodes wording or a time.
//
// It never touches astrology: the real daily focus card is still made lazily,
// on her phone, the moment she opens the app, exactly as it always has been.
// This only says "something is ready" and links her to /focus.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const CRON_SECRET = Deno.env.get("CRON_SECRET")!;

webpush.setVapidDetails("mailto:hello@becomely.co", VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// How a push is delivered, rather than what it says.
//
// urgency "high" is the important one: with no Urgency header the push counts
// as "normal", and Android (through FCM, which is where Chrome's
// subscriptions live) is free to hold a normal push back while the phone is
// dozing — so it only turns up when she next picks the phone up or opens the
// app, which is exactly what was happening. "high" asks for the device to be
// woken for it, which is what a time-of-day nudge needs to be worth anything.
//
// TTL caps how long the push service may keep trying: a morning nudge that
// finally lands at midnight is worse than one that quietly never lands, so
// after 4 hours it is dropped instead of queued.
//
// topic makes a later push replace an earlier undelivered one of the same
// kind, instead of both arriving at once when the phone wakes up. It must be
// URL-safe base64 and at most 32 characters, which "morning"/"evening" are.
const DELIVERY = { urgency: "high", TTL: 4 * 60 * 60 } as const;

type DueRow = {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth_key: string;
  kind: "morning" | "afternoon" | "evening";
  title: string;
  body: string;
  local_date: string;
};

Deno.serve(async (req: Request) => {
  // Only pg_cron (which knows the secret) may trigger a real send.
  if (req.headers.get("Authorization") !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data, error } = await supabase.rpc("due_notifications");
  if (error) {
    return new Response(JSON.stringify({ ok: false, message: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const due = (data ?? []) as DueRow[];
  let sent = 0;
  let removedDeadSubscriptions = 0;
  const failures: string[] = [];

  for (const row of due) {
    const subscription = {
      endpoint: row.endpoint,
      keys: { p256dh: row.p256dh, auth: row.auth_key },
    };
    const payload = JSON.stringify({
      title: row.title,
      body: row.body,
      // The afternoon one opens today's affirmation practice, on its six
      // repetitions.
      url: row.kind === "morning" ? "/focus" : row.kind === "afternoon" ? "/affirmations/today" : "/",
    });

    try {
      await webpush.sendNotification(subscription, payload, {
        ...DELIVERY,
        topic: row.kind,
      });
      // Claims today's slot for this person and kind. If two ticks somehow
      // overlapped, the second insert here would just fail quietly (the
      // table's primary key is (user_id, kind, local_date)) rather than
      // sending twice.
      await supabase
        .from("notification_log")
        .insert({ user_id: row.user_id, kind: row.kind, local_date: row.local_date });
      sent++;
    } catch (sendError) {
      const status = (sendError as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        // Her browser dropped this subscription (uninstalled, cleared data,
        // ...). No point sending to it again.
        await supabase.from("push_subscriptions").delete().eq("endpoint", row.endpoint);
        removedDeadSubscriptions++;
      } else {
        failures.push(`${row.user_id}/${row.kind}: ${String((sendError as Error).message ?? sendError)}`);
      }
    }
  }

  return new Response(
    JSON.stringify({ ok: true, checked: due.length, sent, removedDeadSubscriptions, failures }),
    { headers: { "Content-Type": "application/json" } },
  );
});
