-- Bug reports sent from the app (Profile -> Report a bug).
--
-- She can only send one: no reading, changing or deleting, not even her own.
-- The founder reads and triages them in the Supabase Table Editor, where
-- `status` can be changed by hand. Her reports go with her account if she
-- deletes it (on delete cascade), like everything else of hers.

create table public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  -- What went wrong, in her words. Required.
  description text not null check (char_length(btrim(description)) between 1 and 4000),
  -- What she was doing just before. Optional.
  steps text check (steps is null or char_length(steps) <= 4000),
  -- Filled in by the app, so a report can be matched to a version and device.
  app_version text check (app_version is null or char_length(app_version) <= 50),
  user_agent text check (user_agent is null or char_length(user_agent) <= 500),
  screen text check (screen is null or char_length(screen) <= 30),
  -- For the founder: new -> seen -> fixed / wont_fix. Never set by the app.
  status text not null default 'new' check (status in ('new', 'seen', 'fixed', 'wont_fix')),
  created_at timestamptz not null default now()
);

comment on table public.bug_reports is 'Bug reports sent from the app. Users can only insert; read and triage them in the Table Editor.';
comment on column public.bug_reports.status is 'new, seen, fixed or wont_fix. Change it by hand while triaging.';

create index bug_reports_created_at_idx on public.bug_reports (created_at desc);

alter table public.bug_reports enable row level security;

-- Supabase gives new tables broad default rights; take them all back, then
-- allow only sending a report, and only these columns (so she can't set her
-- own status, id, owner or time).
revoke all on public.bug_reports from anon, authenticated;
grant insert (description, steps, app_version, user_agent, screen) on public.bug_reports to authenticated;

create policy "Send your own bug report"
  on public.bug_reports
  for insert
  to authenticated
  with check (user_id = (select auth.uid()));
