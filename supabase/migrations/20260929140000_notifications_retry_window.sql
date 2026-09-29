-- Each nudge gets four chances instead of one (2026-09-29).
--
-- The job runs every 15 minutes and the send window was also 15 minutes, so
-- exactly one run could send each nudge. If that run failed (a slow cold
-- start, a push service hiccup), the nudge was lost for the day. Now any run
-- in the hour after the send time can send it. notification_log still stops
-- a second send once one has gone out, and a failed send writes no log row,
-- so the next run simply tries again.
--
-- Otherwise unchanged from 20260927120000_notifications_premium_only.sql.
create or replace function public.due_notifications()
returns table (
  user_id uuid,
  endpoint text,
  p256dh text,
  auth_key text,
  kind text,
  title text,
  body text,
  local_date date
)
language sql
stable
set search_path = ''
as $$
  select ps.user_id, ps.endpoint, ps.p256dh, ps.auth_key, ns.kind, ns.title, ns.body, t.local_date
  from public.push_subscriptions ps
  join public.profiles p on p.id = ps.user_id and p.onboarding_completed_at is not null
  join public.notification_settings ns on ns.enabled
  cross join lateral (
    select
      extract(hour from (now() at time zone ps.timezone))::int * 60
        + extract(minute from (now() at time zone ps.timezone))::int as minutes_now,
      (now() at time zone ps.timezone)::date as local_date
  ) t
  where
    mod(t.minutes_now - (ns.send_hour * 60 + ns.send_minute) + 1440, 1440) < 60
    and not exists (
      select 1 from public.notification_log nl
      where nl.user_id = ps.user_id and nl.kind = ns.kind and nl.local_date = t.local_date
    )
    and coalesce((select a.premium from public.access_for(ps.user_id) a), false);
$$;

-- Also applied (not re-runnable here, because the job's command holds the
-- CRON_SECRET): the send-daily-notifications cron job's net.http_post now
-- passes timeout_milliseconds := 30000. pg_net's default of 5 seconds was
-- regularly shorter than the function's cold start, so the database stopped
-- waiting and recorded a timeout even when the function went on to finish.
