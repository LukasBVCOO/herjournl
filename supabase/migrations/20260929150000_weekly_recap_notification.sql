-- The weekly recap's Sunday notification (founder, 2026-09-29): at 18:00 on
-- Sunday, her local time, "Your week in review", opening the recap. It
-- overrides the usual evening reflection on Sundays, so the evening nudge now
-- skips Sunday.
--
-- notification_settings gains `weekdays`: which days of the week (ISO: 1 =
-- Monday … 7 = Sunday, in her own time zone) a nudge goes out. Null means
-- every day, which is what the morning and afternoon nudges keep.

alter table public.notification_settings
  add column weekdays smallint[]
  check (weekdays is null or (cardinality(weekdays) > 0 and weekdays <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[]));

alter table public.notification_settings drop constraint notification_settings_kind_check;
alter table public.notification_settings
  add constraint notification_settings_kind_check
  check (kind = any (array['morning', 'afternoon', 'evening', 'weekly']));

alter table public.notification_log drop constraint notification_log_kind_check;
alter table public.notification_log
  add constraint notification_log_kind_check
  check (kind = any (array['morning', 'afternoon', 'evening', 'weekly']));

update public.notification_settings set weekdays = array[1, 2, 3, 4, 5, 6]::smallint[] where kind = 'evening';

insert into public.notification_settings (kind, title, body, send_hour, send_minute, enabled, weekdays)
values (
  'weekly',
  'Your week in review ✦',
  'Look back on who showed up this week, and choose who you''re becoming next.',
  18, 0, true, array[7]::smallint[]
);

-- Same as before, plus: only on the nudge's own weekdays, in her time zone.
create or replace function public.due_notifications()
returns table (user_id uuid, endpoint text, p256dh text, auth_key text, kind text, title text, body text, local_date date)
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
      (now() at time zone ps.timezone)::date as local_date,
      extract(isodow from (now() at time zone ps.timezone))::smallint as weekday
  ) t
  where
    mod(t.minutes_now - (ns.send_hour * 60 + ns.send_minute) + 1440, 1440) < 60
    and (ns.weekdays is null or t.weekday = any (ns.weekdays))
    and not exists (
      select 1 from public.notification_log nl
      where nl.user_id = ps.user_id and nl.kind = ns.kind and nl.local_date = t.local_date
    )
    and coalesce((select a.premium from public.access_for(ps.user_id) a), false);
$function$;

revoke all on function public.due_notifications() from public, anon, authenticated;
grant execute on function public.due_notifications() to service_role;
