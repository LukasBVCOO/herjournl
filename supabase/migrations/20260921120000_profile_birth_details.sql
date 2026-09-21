-- Onboarding: the birth details and completion status live on the profile.
-- Already applied to the Supabase project. Kept here as the record of how the
-- database was set up. Adds columns only; nothing existing is changed or removed.
--
-- The existing birth_time (a time, so it holds hour and minute) and birth_place
-- (the display name) are reused rather than duplicated.

alter table public.profiles
  add column birth_time_known boolean not null default true,
  add column birth_city text,
  add column birth_country text,
  add column birth_latitude double precision,
  add column birth_longitude double precision,
  add column birth_timezone_name text,
  add column birth_utc_offset_minutes integer,
  add column onboarding_completed_at timestamptz;

-- Basic sanity checks, so a bad value can't be stored even if the app has a bug.
alter table public.profiles
  add constraint profiles_birth_latitude_range
    check (birth_latitude is null or birth_latitude between -90 and 90),
  add constraint profiles_birth_longitude_range
    check (birth_longitude is null or birth_longitude between -180 and 180),
  add constraint profiles_birth_utc_offset_range
    check (birth_utc_offset_minutes is null or birth_utc_offset_minutes between -840 and 840);

comment on column public.profiles.name is 'What she asked to be called.';
comment on column public.profiles.date_of_birth is 'Her birth date.';
comment on column public.profiles.birth_time is 'Local time of birth (hour and minute). Null when she does not know it.';
comment on column public.profiles.birth_time_known is 'False when she does not know her birth time. Rising sign and houses are then not exact.';
comment on column public.profiles.birth_place is 'Display name of the birthplace, e.g. "Marijampolė, Marijampolė County, Lithuania".';
comment on column public.profiles.birth_city is 'City or town of birth.';
comment on column public.profiles.birth_country is 'Country of birth.';
comment on column public.profiles.birth_latitude is 'Latitude of the birthplace, in degrees.';
comment on column public.profiles.birth_longitude is 'Longitude of the birthplace, in degrees.';
comment on column public.profiles.birth_timezone_name is 'Time zone of the birthplace (e.g. Europe/Vilnius). Worked out on the server.';
comment on column public.profiles.birth_utc_offset_minutes is 'UTC offset in minutes that applied at the moment of birth (historical, not today''s). Worked out on the server.';
comment on column public.profiles.placements is 'The natal chart. Filled in by the server once the chart service exists.';
comment on column public.profiles.onboarding_completed_at is 'When she finished onboarding. Null means she has not.';
