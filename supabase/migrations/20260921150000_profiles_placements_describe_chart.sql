-- The natal chart is now worked out in the app and saved here when onboarding
-- finishes, so the description of the column changes. Already applied to the
-- Supabase project. Comment only; no data or structure changes.
comment on column public.profiles.placements is
  'Her natal chart as JSON, written when onboarding finishes and replaced if she changes her birth details. Shape: houseSystem ("placidus"), timeZone and utcOffsetMinutes (what the calculation used), sun/moon/mercury/venus/mars/jupiter/saturn each {sign, degree 0-30, house 1-12}, rising {sign, degree}, houseCusps keyed "1".."12" each {sign, degree}.';

comment on column public.profiles.birth_timezone_name is 'Time zone of the birthplace (e.g. Europe/Vilnius) that the chart was calculated with.';
comment on column public.profiles.birth_utc_offset_minutes is 'Minutes the birthplace clock was ahead of UTC on her birthday (historical, not today''s), as used by the chart calculation.';
