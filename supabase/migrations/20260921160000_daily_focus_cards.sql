-- Daily focus cards: one saved card per person per day, and a place on a note to
-- keep a copy of the card it was written from.
-- Applied to the Becomely Supabase project on 2026-09-21, after the founder approved it.

-- ---------------------------------------------------------------------------
-- The card for a day. Worked out on her phone (never on a server), then saved
-- here so it is the same card on every device, and never changes once made.
-- ---------------------------------------------------------------------------
create table public.daily_focus_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  -- The day it belongs to, in the time zone her phone was in that morning.
  local_date date not null,
  timezone text not null,
  -- The exact moment (08:00 local) the Moon was read for.
  reference_instant timestamptz not null,

  -- How it was worked out. Kept so a card can always be explained, never shown.
  moon_longitude double precision not null check (moon_longitude >= 0 and moon_longitude < 360),
  active_house smallint not null check (active_house between 1 and 12),
  natal_moon_sign text not null check (natal_moon_sign in (
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
  )),

  -- What she sees.
  focus_category text not null,
  focus_title text not null,
  focus_statement text not null,
  journal_prompt text not null,

  -- Which option was picked from each list of wording (counting from 0), so the
  -- card can be recreated exactly. No Moon line is null.
  title_variant smallint not null check (title_variant >= 0),
  statement_variant smallint not null check (statement_variant >= 0),
  moon_modifier_variant smallint check (moon_modifier_variant >= 0),
  prompt_variant smallint not null check (prompt_variant >= 0),

  created_at timestamptz not null default now(),

  -- One card per person per day. Two phones opening at once cannot make two.
  -- This also speeds up "her cards", so no separate index is needed.
  unique (user_id, local_date)
);

-- Privacy: a card is only ever visible to its owner. A card can be added but
-- never changed or removed by the app: yesterday's card stays yesterday's card,
-- even if she later edits her birth details. (Cards disappear with her account.)
alter table public.daily_focus_cards enable row level security;

create policy "Owners can read their cards"
  on public.daily_focus_cards for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Owners can create their cards"
  on public.daily_focus_cards for insert to authenticated
  with check ((select auth.uid()) = user_id);

revoke all on public.daily_focus_cards from anon;
grant select, insert on public.daily_focus_cards to authenticated;
-- Supabase also hands new tables broad default rights to the signed-in role (found
-- when checking after applying), and the grant above does not take them away.
-- Cards are only ever read and added, so the rest is removed. (This was applied
-- as a second small migration, daily_focus_cards_tighten_grants.)
revoke delete, update, truncate, references, trigger on public.daily_focus_cards from authenticated;

-- ---------------------------------------------------------------------------
-- A note written from a card keeps its own copy of the card, so the question can
-- show above her writing, and the card's words in the corner tooltip, even
-- offline and even if the saved card were ever removed. Kept apart from the
-- note's writing on purpose, so it is never part of her title, preview or search.
--
-- Shape: {"date": "2026-09-21", "title": "...", "statement": "...", "prompt": "..."}
-- Null for every ordinary note. (Such notes also use the note type that was
-- already reserved for this: 'daily_entry'.)
-- ---------------------------------------------------------------------------
alter table public.notes
  add column focus_card jsonb
  check (
    focus_card is null
    or (jsonb_typeof(focus_card) = 'object' and octet_length(focus_card::text) <= 4000)
  );

comment on column public.notes.focus_card is
  'Copy of the daily focus card this note was written from (date, title, statement, prompt). Null for ordinary notes.';

-- ---------------------------------------------------------------------------
-- Added later the same day (applied as the migration daily_focus_cards_opened_done):
-- where she is with each card. Both only ever move forward.
--   opened  she has seen the card. From then on it stays revealed.
--   done    she answered it, and her answer is now a note. The card leaves the
--           top of her list, and the next card arrives at 08:00 tomorrow.
-- Done always means opened too. The app may change these two columns and nothing
-- else, and only on her own cards; the database itself stops either going back
-- to "no".
-- ---------------------------------------------------------------------------
alter table public.daily_focus_cards
  add column opened boolean not null default false,
  add column done boolean not null default false,
  add constraint daily_focus_cards_done_needs_opened check (opened or not done);

create function public.daily_focus_cards_forward_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.done := old.done or new.done;
  new.opened := old.opened or new.opened or new.done;
  return new;
end;
$$;

create trigger daily_focus_cards_forward_only
  before update on public.daily_focus_cards
  for each row execute function public.daily_focus_cards_forward_only();

create policy "Owners can mark their cards"
  on public.daily_focus_cards for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant update (opened, done) on public.daily_focus_cards to authenticated;

-- local_date is the card day: it runs from 08:00 to 08:00 in her time zone (so at
-- 03:00 on the 22nd she is still on the 21st's card), not from midnight.

-- ---------------------------------------------------------------------------
-- Added later the same day (applied as the migration daily_focus_cards_moon_aspect):
-- how to approach the day, from the Moon's closest angle to one of her seven
-- natal planets, worked out fresh every day rather than picked from a list. This
-- is what stops the card repeating itself while the house (active_house) stays
-- the same for two or three days running. It replaces what moon_modifier_variant
-- was for (the natal Moon-sign line); that column is left in place, unused,
-- rather than being dropped.
-- ---------------------------------------------------------------------------
alter table public.daily_focus_cards
  add column moon_aspect_planet text,
  add column moon_aspect_name text,
  add column moon_aspect_orb double precision;

alter table public.daily_focus_cards
  add constraint daily_focus_cards_moon_aspect_planet_check
    check (moon_aspect_planet in ('sun','moon','mercury','venus','mars','jupiter','saturn')),
  add constraint daily_focus_cards_moon_aspect_name_check
    check (moon_aspect_name in ('conjunction','sextile','square','trine','opposition')),
  add constraint daily_focus_cards_moon_aspect_orb_check
    check (moon_aspect_orb >= 0);

comment on column public.daily_focus_cards.moon_aspect_planet is 'Which of her seven natal planets the Moon was closest to an angle with today.';
comment on column public.daily_focus_cards.moon_aspect_name is 'The angle (conjunction, sextile, square, trine, opposition).';
comment on column public.daily_focus_cards.moon_aspect_orb is 'How far that angle was from exact, in degrees. Smaller is closer.';

-- Not marked "not null": rows saved before this migration have none. The app
-- treats a card missing these as not usable, the same as any other incomplete
-- saved row, rather than guessing.
