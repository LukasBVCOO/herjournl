-- Sun-sign houses for people who don't know their birth time (founder,
-- 2026-09-27). Without a birth time there's no Rising sign, so her real houses
-- can't be worked out. Instead her Sun sign counts as her 1st house, the next
-- sign as her 2nd, and so on (the long-established "solar houses" technique
-- that sun-sign horoscopes use). Today's Moon sign then falls in one of those
-- houses, which gives her a real house-based card: its artwork, its wording
-- and its affirmation lines.
--
-- A new card type, "sun_sign": it has a house (like "full"), while her natal
-- Moon sign and the Moon-to-planet angle stay optional (like "reduced"), since
-- without a birth time either may be unknowable. "reduced" stays for the rare
-- case where even her Sun sign isn't certain (born on the day it changed).

alter table public.daily_focus_cards
  drop constraint daily_focus_cards_personalisation_level_check,
  add constraint daily_focus_cards_personalisation_level_check
    check (personalisation_level in ('full', 'sun_sign', 'reduced'));

comment on column public.daily_focus_cards.personalisation_level is
  'full (a real birth time, her own houses), sun_sign (no birth time: houses counted from her Sun sign) or reduced (no birth time and no certain Sun sign: today''s Moon sign is the theme). Never shown to her.';

alter table public.daily_focus_cards
  drop constraint daily_focus_cards_house_matches_level,
  add constraint daily_focus_cards_house_matches_level check (
    (personalisation_level = 'full' and active_house is not null and natal_moon_sign is not null)
    or
    (personalisation_level = 'sun_sign' and active_house is not null)
    or
    (personalisation_level = 'reduced' and active_house is null and natal_moon_sign is null)
  );
