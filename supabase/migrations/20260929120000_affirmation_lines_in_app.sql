-- The affirmation lines now live in the app itself
-- (src/features/affirmations/content/lines.ts), not in the database
-- (founder, 2026-09-29): they're the same for everyone, so there's nothing to
-- fetch, and the picker works offline. Every line kept its id, so each day
-- she has already practised still points at the same words.
--
-- Her own days (daily_369) stay here, holding just the line's id; the app
-- supplies the words. The link to the old table is replaced by a plain check
-- that the id is a real, positive number, and the table itself is removed.

alter table public.daily_369
  drop constraint daily_369_affirmation_id_fkey,
  add constraint daily_369_affirmation_id_check check (affirmation_id > 0);

drop table public.affirmations;
