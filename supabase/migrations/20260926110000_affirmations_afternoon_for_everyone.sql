-- The afternoon affirmation nudge goes to everyone with notifications on,
-- the same as the morning and evening ones — no separate switch (founder's
-- call, 2026-09-26). Undoes the opt-in from 20260926100000_affirmations_369.sql:
-- due_notifications goes back to its original shape (the afternoon row in
-- notification_settings is sent like any other), and the opt-in column goes.

create or replace function public.due_notifications()
returns table(user_id uuid, endpoint text, p256dh text, auth_key text, kind text, title text, body text, local_date date)
language sql
stable
set search_path to ''
as $function$
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
    mod(t.minutes_now - (ns.send_hour * 60 + ns.send_minute) + 1440, 1440) < 15
    and not exists (
      select 1 from public.notification_log nl
      where nl.user_id = ps.user_id and nl.kind = ns.kind and nl.local_date = t.local_date
    );
$function$;

alter table public.profiles drop column affirmation_afternoon_reminder;
