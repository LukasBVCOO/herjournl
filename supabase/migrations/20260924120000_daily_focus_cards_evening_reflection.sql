-- The evening reflection: a second, smaller moment in the day, appended to
-- today's own daily-focus note rather than becoming a note of its own. Lives
-- on the same row as the rest of today's card (one row per person per day
-- already), the same way opened/done already track the morning card — see
-- src/features/daily-focus/reflect-screen.tsx and today.ts's
-- recordReflectionOpened/recordReflectionDone.
--
-- The prompt is picked once, at the same moment as the rest of the card (this
-- morning), not when she opens it in the evening — it just isn't shown until
-- then. So, unlike opened/done, the prompt columns are never updated after
-- the row is created and don't need to be grantable.

alter table public.daily_focus_cards
  add column evening_reflection_prompt text,
  add column evening_reflection_prompt_variant smallint,
  add column evening_reflection_opened boolean not null default false,
  add column evening_reflection_done boolean not null default false,
  add constraint daily_focus_cards_evening_reflection_needs_opened
    check (evening_reflection_opened or not evening_reflection_done),
  add constraint daily_focus_cards_evening_reflection_prompt_all_or_none check (
    (evening_reflection_prompt is not null) = (evening_reflection_prompt_variant is not null)
  );

comment on column public.daily_focus_cards.evening_reflection_prompt is
  'The evening reflection question, picked this morning alongside the rest of the card. Null only on a card saved before this existed.';
comment on column public.daily_focus_cards.evening_reflection_opened is
  'She has opened the reflection prompt page. Forward-only, same as opened.';
comment on column public.daily_focus_cards.evening_reflection_done is
  'She answered the reflection and it was appended to today''s note. Forward-only, same as done. Implies evening_reflection_opened.';

-- Extends the existing forward-only trigger (created in
-- 20260921160000_daily_focus_cards.sql) so the new pair can never move
-- backward either, the same way opened/done already can't.
create or replace function public.daily_focus_cards_forward_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.done := old.done or new.done;
  new.opened := old.opened or new.opened or new.done;
  new.evening_reflection_done := old.evening_reflection_done or new.evening_reflection_done;
  new.evening_reflection_opened :=
    old.evening_reflection_opened or new.evening_reflection_opened or new.evening_reflection_done;
  return new;
end;
$$;

-- Replaces the narrower grant from 20260921160000_daily_focus_cards.sql: the
-- app may now change these four columns and nothing else, still only on her
-- own cards (the existing "Owners can mark their cards" policy is unchanged).
grant update (opened, done, evening_reflection_opened, evening_reflection_done)
  on public.daily_focus_cards to authenticated;
