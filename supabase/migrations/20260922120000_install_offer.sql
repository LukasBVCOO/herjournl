-- The first-time "add to your home screen" nudge: whether she has installed,
-- how many times she has been offered, and when she was last offered.
--
-- Lives on the account (not just the device) on purpose: the offer can start
-- on a computer during onboarding and only be completed later on her phone, a
-- different browser entirely. Only account-level storage lets the phone's
-- "installed!" turn off the reminder that would otherwise keep showing on the
-- computer. No new table needed — this is simple per-account state, the same
-- shape as onboarding_completed_at already living directly on profiles, and it
-- already has full owner-only read/write RLS, so nothing new to lock down.

alter table public.profiles
  add column pwa_installed boolean not null default false,
  add column install_prompt_count smallint not null default 0,
  add column install_prompt_last_shown_at timestamptz;

alter table public.profiles
  add constraint profiles_install_prompt_count_range
    check (install_prompt_count between 0 and 3);

comment on column public.profiles.pwa_installed is 'True once she has added the app to a home screen, detected live from whichever device noticed it.';
comment on column public.profiles.install_prompt_count is 'How many times she has been offered the install nudge, 0 to 3. Stops being offered once it reaches 3.';
comment on column public.profiles.install_prompt_last_shown_at is 'When she was last shown the install nudge. Null until the first time.';
