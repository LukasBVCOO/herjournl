-- Affirmations, run on the 369 method: one short line a day, said 3 times in
-- the morning, 6 in the afternoon and 9 in the evening. The line comes from
-- the house today's focus card is in (house 0 = no birth time, so no house).
-- Approved by the founder on 2026-09-26 (the data shape was part of the brief).

-- ---------------------------------------------------------------------------
-- The lines themselves. Written by us, the same for everyone, so they are
-- readable by any signed-in person and changeable by no one through the app.
-- Three per house: the house's theme, a goal, and a belief. Each is short
-- enough to repeat 18 times a day: first person, present tense, ~10 words.
-- Ids are fixed (house * 10 + 1/2/3), so a day's pick always points at the
-- same line even if the wording is later polished.
-- ---------------------------------------------------------------------------
create table public.affirmations (
  id smallint primary key,
  house smallint not null check (house between 0 and 12),
  text text not null check (char_length(text) between 1 and 80),
  type text not null check (type in ('theme', 'goal', 'belief')),
  category text not null,
  unique (house, type)
);

alter table public.affirmations enable row level security;

create policy "Anyone signed in can read affirmations"
  on public.affirmations for select to authenticated
  using (true);

revoke all on public.affirmations from anon;
revoke all on public.affirmations from authenticated;
grant select on public.affirmations to authenticated;

insert into public.affirmations (id, house, type, category, text) values
  (1,   0,  'theme',  'general',       'I am aligned with the life I want.'),
  (2,   0,  'goal',   'general',       'I take one clear step toward my goals today.'),
  (3,   0,  'belief', 'general',       'Everything I need is coming to me.'),
  (11,  1,  'theme',  'self',          'I trust who I am becoming.'),
  (12,  1,  'goal',   'self',          'I show up fully for my goals today.'),
  (13,  1,  'belief', 'self',          'I am enough exactly as I am.'),
  (21,  2,  'theme',  'money',         'I earn well and I spend with intention.'),
  (22,  2,  'goal',   'money',         'I am growing my income with ease.'),
  (23,  2,  'belief', 'money',         'I am worthy of wealth and rest.'),
  (31,  3,  'theme',  'mind',          'I speak clearly and I am heard.'),
  (32,  3,  'goal',   'mind',          'I learn quickly and share what I know.'),
  (33,  3,  'belief', 'mind',          'My ideas are valuable and worth sharing.'),
  (41,  4,  'theme',  'home',          'My home is calm and full of love.'),
  (42,  4,  'goal',   'home',          'I am creating a home I love returning to.'),
  (43,  4,  'belief', 'home',          'I am safe, rooted and supported.'),
  (51,  5,  'theme',  'creativity',    'I create freely and enjoy the process.'),
  (52,  5,  'goal',   'creativity',    'I make time for what lights me up.'),
  (53,  5,  'belief', 'creativity',    'Joy is my natural state.'),
  (61,  6,  'theme',  'routine',       'My daily habits support the life I want.'),
  (62,  6,  'goal',   'routine',       'I care for my body and keep my promises.'),
  (63,  6,  'belief', 'routine',       'Small steps every day change my life.'),
  (71,  7,  'theme',  'relationships', 'I attract steady, kind relationships.'),
  (72,  7,  'goal',   'relationships', 'I give and receive love with ease.'),
  (73,  7,  'belief', 'relationships', 'I deserve people who choose me fully.'),
  (81,  8,  'theme',  'transformation','I let go of what no longer fits.'),
  (82,  8,  'goal',   'transformation','I grow stronger through every change.'),
  (83,  8,  'belief', 'transformation','I am safe to grow and change.'),
  (91,  9,  'theme',  'growth',        'My world is expanding in beautiful ways.'),
  (92,  9,  'goal',   'growth',        'I say yes to new places and ideas.'),
  (93,  9,  'belief', 'growth',        'Every experience is guiding me forward.'),
  (101, 10, 'theme',  'career',        'I am building work I am proud of.'),
  (102, 10, 'goal',   'career',        'I move steadily toward my biggest goals.'),
  (103, 10, 'belief', 'career',        'I am capable of great success.'),
  (111, 11, 'theme',  'future',        'I am surrounded by people who lift me.'),
  (112, 11, 'goal',   'future',        'I am creating the future I dream of.'),
  (113, 11, 'belief', 'future',        'I belong, and my people find me.'),
  (121, 12, 'theme',  'inner_world',   'I rest deeply and trust the timing.'),
  (122, 12, 'goal',   'inner_world',   'I make quiet space to hear myself.'),
  (123, 12, 'belief', 'inner_world',   'I am guided, even when I cannot see.');

-- ---------------------------------------------------------------------------
-- Her day on the 369: which line, and how far through each session she got.
-- `date` is the card day (08:00 to 08:00 in her own time zone, the same day
-- the daily focus card belongs to), so the line always matches that card's
-- house. The *_at columns are when each session was finished (null until
-- then), which is how a session done outside its time of day is shown as
-- late. pinned carries the line into the next days even when the house moves.
-- ---------------------------------------------------------------------------
create table public.daily_369 (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  affirmation_id smallint not null references public.affirmations (id),
  morning_count smallint not null default 0 check (morning_count between 0 and 3),
  afternoon_count smallint not null default 0 check (afternoon_count between 0 and 6),
  evening_count smallint not null default 0 check (evening_count between 0 and 9),
  pinned boolean not null default false,
  morning_at timestamptz,
  afternoon_at timestamptz,
  evening_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, date)
);

-- Counts only go up and a finished session stays finished, so two phones (or
-- a slow save arriving late) can never undo a repetition. Once any
-- repetition is done the day's line is fixed.
create function public.daily_369_forward_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.morning_count := greatest(old.morning_count, new.morning_count);
  new.afternoon_count := greatest(old.afternoon_count, new.afternoon_count);
  new.evening_count := greatest(old.evening_count, new.evening_count);
  new.morning_at := coalesce(old.morning_at, new.morning_at);
  new.afternoon_at := coalesce(old.afternoon_at, new.afternoon_at);
  new.evening_at := coalesce(old.evening_at, new.evening_at);
  if old.morning_count + old.afternoon_count + old.evening_count > 0 then
    new.affirmation_id := old.affirmation_id;
  end if;
  new.updated_at := now();
  return new;
end;
$$;

create trigger daily_369_forward_only
  before update on public.daily_369
  for each row execute function public.daily_369_forward_only();

alter table public.daily_369 enable row level security;

create policy "Owners can read their 369 days"
  on public.daily_369 for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can start their 369 days"
  on public.daily_369 for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can update their 369 days"
  on public.daily_369 for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

revoke all on public.daily_369 from anon;
revoke all on public.daily_369 from authenticated;
grant select, insert on public.daily_369 to authenticated;
grant update (
  affirmation_id, morning_count, afternoon_count, evening_count, pinned,
  morning_at, afternoon_at, evening_at
) on public.daily_369 to authenticated;

-- ---------------------------------------------------------------------------
-- The afternoon reminder: off unless she turns it on (the morning and evening
-- nudges stay as they are). Sent by the same every-15-minutes job as those.
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column affirmation_afternoon_reminder boolean not null default false;

grant update (affirmation_afternoon_reminder) on public.profiles to authenticated;

do $$
declare
  c record;
begin
  -- Widen any "kind is morning or evening" check to allow afternoon too.
  for c in
    select conrelid::regclass as tbl, conname
    from pg_constraint
    where conrelid in ('public.notification_settings'::regclass, 'public.notification_log'::regclass)
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%kind%'
  loop
    execute format('alter table %s drop constraint %I', c.tbl, c.conname);
    execute format(
      'alter table %s add constraint %I check (kind in (''morning'', ''afternoon'', ''evening''))',
      c.tbl, c.conname
    );
  end loop;
end;
$$;

insert into public.notification_settings (kind, title, body, send_hour, send_minute, enabled)
values ('afternoon', 'Your afternoon affirmation ✦', 'Six times, then back to your day.', 14, 0, true)
on conflict (kind) do nothing;

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
    -- The afternoon affirmation reminder only goes to those who asked for it.
    and (ns.kind <> 'afternoon' or p.affirmation_afternoon_reminder)
    and not exists (
      select 1 from public.notification_log nl
      where nl.user_id = ps.user_id and nl.kind = ns.kind and nl.local_date = t.local_date
    );
$function$;
