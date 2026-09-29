-- Who is premium, and why. Approved by the founder on 2026-09-27:
--   * Stripe, US prices: $7.99 a month or $71.99 a year.
--   * Every new account gets 7 days of full access from sign-up, no card
--     needed. After that, notes stay free; daily focus cards and
--     affirmations need a subscription.
--   * Everyone who already had an account on this date is premium forever.
--
-- She can read her own row, never write it: only the server (the Stripe
-- webhook, using the service role) changes it, so no one can make themselves
-- premium from the app. Nothing about her journal is here or sent to Stripe.

create table public.subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  -- Premium forever, no Stripe involved (the founding users).
  lifetime boolean not null default false,
  -- Filled in by the Stripe webhook once she subscribes.
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  -- Stripe's own word for it: active, trialing, past_due, canceled,
  -- incomplete, incomplete_expired, unpaid or paused.
  status text,
  plan text check (plan in ('monthly', 'yearly')),
  -- When the period she has paid for ends (renews, or stops if cancelled).
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Read own subscription"
  on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

revoke all on public.subscriptions from anon;
revoke all on public.subscriptions from authenticated;
grant select on public.subscriptions to authenticated;

-- ---------------------------------------------------------------------------
-- The one answer everything else asks: is this person premium, and why?
--   lifetime      a founding user
--   subscription  paying (past_due included: Stripe is still retrying her
--                 card, so she keeps access until it gives up)
--   trial         within 7 days of creating her account
--   free          notes only
-- For the server (edge functions, and later any database rule that locks
-- premium content), by user id. Not callable from the app.
-- ---------------------------------------------------------------------------
create function public.access_for(uid uuid)
returns table (
  premium boolean,
  reason text,
  trial_ends_at timestamptz,
  plan text,
  current_period_end timestamptz,
  cancel_at_period_end boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with facts as (
    select
      u.created_at + interval '7 days' as trial_ends_at,
      coalesce(s.lifetime, false) as lifetime,
      s.status,
      s.plan,
      s.current_period_end,
      coalesce(s.cancel_at_period_end, false) as cancel_at_period_end
    from auth.users u
    left join public.subscriptions s on s.user_id = u.id
    where u.id = uid
  ),
  decided as (
    select
      f.*,
      case
        when f.lifetime then 'lifetime'
        when f.status in ('active', 'trialing', 'past_due')
          and (f.current_period_end is null or f.current_period_end > now())
          then 'subscription'
        when now() < f.trial_ends_at then 'trial'
        else 'free'
      end as reason
    from facts f
  )
  select
    d.reason <> 'free',
    d.reason,
    d.trial_ends_at,
    d.plan,
    d.current_period_end,
    d.cancel_at_period_end
  from decided d;
$$;

revoke all on function public.access_for(uuid) from public, anon, authenticated;
grant execute on function public.access_for(uuid) to service_role;

-- The same answer for the app: always her own, never anyone else's.
create function public.my_access()
returns table (
  premium boolean,
  reason text,
  trial_ends_at timestamptz,
  plan text,
  current_period_end timestamptz,
  cancel_at_period_end boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select * from public.access_for((select auth.uid()));
$$;

revoke all on function public.my_access() from public, anon;
grant execute on function public.my_access() to authenticated;

-- ---------------------------------------------------------------------------
-- Everyone with an account today is a founding user: premium forever. Runs
-- once, as part of this change; accounts made after it get the 7-day trial.
-- ---------------------------------------------------------------------------
insert into public.subscriptions (user_id, lifetime)
select id, true from auth.users
on conflict (user_id) do update set lifetime = true, updated_at = now();
