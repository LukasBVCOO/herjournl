-- Daily focus cards for users without a birth time ("reduced" personalisation:
-- see profiles.birth_time_known and the reduced chart shape it saves under
-- profiles.placements). A house needs a real birth time and is never invented,
-- so a reduced card has no house — today's Moon sign gives its theme instead
-- (src/features/daily-focus/content/moon-sign-themes.ts) — and may or may not
-- have a Moon-to-natal-planet angle, depending on what her chart can actually
-- support that day.
-- Applied to the Becomely Supabase project on 2026-09-22, after the founder
-- approved it.

alter table public.daily_focus_cards
  add column personalisation_level text not null default 'full'
    check (personalisation_level in ('full', 'reduced'));

comment on column public.daily_focus_cards.personalisation_level is
  'full (a real birth time, houses used) or reduced (no birth time — today''s Moon sign is the theme instead). Never shown to her.';

-- active_house and natal_moon_sign now only apply to a full card: a reduced
-- one has neither, and neither is ever invented to fill the gap.
alter table public.daily_focus_cards
  alter column active_house drop not null,
  alter column natal_moon_sign drop not null;

alter table public.daily_focus_cards
  drop constraint daily_focus_cards_active_house_check,
  add constraint daily_focus_cards_active_house_check
    check (active_house is null or active_house between 1 and 12),
  drop constraint daily_focus_cards_natal_moon_sign_check,
  add constraint daily_focus_cards_natal_moon_sign_check
    check (natal_moon_sign is null or natal_moon_sign in (
      'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
      'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
    ));

-- A full card must have both; a reduced card must have neither (never a mix).
alter table public.daily_focus_cards
  add constraint daily_focus_cards_house_matches_level check (
    (personalisation_level = 'full' and active_house is not null and natal_moon_sign is not null)
    or
    (personalisation_level = 'reduced' and active_house is null and natal_moon_sign is null)
  );

-- The three moon_aspect_* columns (added in 20260921160000_daily_focus_cards.sql)
-- were already nullable, and a handful of rows saved before that addition
-- genuinely have none — the app already treats those as an incomplete,
-- unusable saved card rather than guessing (card-row.ts's cardFromRow), the
-- same way it treats any other incomplete row. So this only enforces the one
-- thing that must always be true: never a partial angle (some of the three
-- set, but not all).
alter table public.daily_focus_cards
  add constraint daily_focus_cards_moon_aspect_all_or_none check (
    (moon_aspect_planet is not null) = (moon_aspect_name is not null)
    and (moon_aspect_planet is not null) = (moon_aspect_orb is not null)
  );
