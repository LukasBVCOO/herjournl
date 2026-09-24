-- Upgrading a card from one prompt to a short reflection plus three specific
-- prompts (My intention / A belief to explore / My next step) — see
-- src/features/daily-focus/content/houses.ts's top comment for the wording
-- rules. Purely additive: existing rows are untouched (all six new columns
-- are nullable, no backfill), so a card saved before this still reads back
-- fine with just its one legacy prompt.
--
-- journal_prompt / prompt_variant (added in 20260921160000_daily_focus_cards.sql)
-- keep their names but now specifically mean the intention prompt, since
-- there are three prompts now, not one — see the updated column comment.

alter table public.daily_focus_cards
  add column reflection text,
  add column reflection_variant smallint,
  add column belief_prompt text,
  add column belief_prompt_variant smallint,
  add column next_step_prompt text,
  add column next_step_prompt_variant smallint;

comment on column public.daily_focus_cards.journal_prompt is
  'The "My intention" prompt — what she opens the note by answering. Renamed in meaning, not in column name, when belief_prompt/next_step_prompt were added.';
comment on column public.daily_focus_cards.reflection is
  'A short paragraph of material to consider, shown before the three prompts. Null only on a card saved before this column existed.';
comment on column public.daily_focus_cards.belief_prompt is
  '"A belief to explore" — optional to answer, but always shown. Null only on a card saved before this column existed.';
comment on column public.daily_focus_cards.next_step_prompt is
  '"My next step" — optional to answer, but always shown. Null only on a card saved before this column existed.';

-- Each of the four new/renamed picks is all-or-nothing with its own variant
-- index, same pattern as the existing title/statement/prompt columns: a card
-- either has both the text and the index it came from, or neither.
alter table public.daily_focus_cards
  add constraint daily_focus_cards_reflection_all_or_none check (
    (reflection is not null) = (reflection_variant is not null)
  ),
  add constraint daily_focus_cards_belief_prompt_all_or_none check (
    (belief_prompt is not null) = (belief_prompt_variant is not null)
  ),
  add constraint daily_focus_cards_next_step_prompt_all_or_none check (
    (next_step_prompt is not null) = (next_step_prompt_variant is not null)
  );
