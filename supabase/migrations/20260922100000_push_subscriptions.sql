-- Push notifications, step 1: where her phone's subscription is kept.
--
-- When she allows notifications, her browser gives back three values (an
-- endpoint, and two small keys) that together are the address a notification is
-- sent to. There is one row per device she has allowed notifications on, so
-- turning it on on a second phone does not remove the first.
--
-- No sending happens yet. This only stores what a later step will send to.

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  -- The three values Web Push needs to reach this device. The endpoint is
  -- unique to the device and browser, which is what tells two subscriptions
  -- apart (and stops the same device being saved twice).
  endpoint text not null unique,
  p256dh text not null,
  auth_key text not null,

  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

-- Privacy: she can only see, add and remove her own subscriptions. There is no
-- update: a changed subscription is a new endpoint, so it is a new row instead.
alter table public.push_subscriptions enable row level security;

create policy "Owners can read their subscriptions"
  on public.push_subscriptions for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can add their subscriptions"
  on public.push_subscriptions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can remove their subscriptions"
  on public.push_subscriptions for delete to authenticated
  using ((select auth.uid()) = user_id);

revoke all on public.push_subscriptions from anon;
grant select, insert, delete on public.push_subscriptions to authenticated;
-- Supabase also hands new tables broad default rights to the signed-in role,
-- which the grant above does not take away (found when checking after applying,
-- same as with daily_focus_cards). Applied as a second small migration,
-- push_subscriptions_tighten_grants.
revoke update, truncate, references, trigger on public.push_subscriptions from authenticated;
