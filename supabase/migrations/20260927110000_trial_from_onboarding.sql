-- The 7-day trial now starts when she finishes onboarding, not when she
-- signs up (founder, 2026-09-27). Until she has finished, her trial hasn't
-- started, so she counts as in it and trial_ends_at is null.
create or replace function public.access_for(uid uuid)
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
      p.onboarding_completed_at + interval '7 days' as trial_ends_at,
      coalesce(s.lifetime, false) as lifetime,
      s.status,
      s.plan,
      s.current_period_end,
      coalesce(s.cancel_at_period_end, false) as cancel_at_period_end
    from auth.users u
    left join public.profiles p on p.id = u.id
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
        when f.trial_ends_at is null or now() < f.trial_ends_at then 'trial'
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
