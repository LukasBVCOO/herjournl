-- SUPERSEDED by 20260921140000_worldmap_relock_and_timezone_search.sql: the worldmap
-- table was replaced afterwards, so the function below no longer matches it.
-- Kept only as history.

-- The birthplace search: makes the worldmap places list readable, and adds the
-- function the app searches it with. Already applied to the Supabase project.
-- Kept here as the record of how the database was set up.
--
-- worldmap itself (about 50,000 cities and towns, no time zone column) was
-- loaded by hand, so its creation is not part of this file.

-- The places list is public reference data: signed-in users may read it and
-- nothing else. It was created with full write access for anonymous visitors
-- and signed-in users, held back only by row security having no rule.
revoke all on public.worldmap from anon, authenticated;
grant select on public.worldmap to authenticated;

create policy "Signed-in users can read places"
  on public.worldmap for select to authenticated
  using (true);

-- Lets a search ignore accents and capitals, so "lodz" finds "Łódź".
create extension if not exists unaccent with schema extensions;

-- The birthplace search. Takes what she typed, e.g. "marijampole" or
-- "paris, texas", and returns up to 6 places. The part before a comma is the
-- start of the city; anything after it narrows by region or country. Bigger
-- places come first, and a name that matches exactly beats one that merely
-- starts with what was typed.
create or replace function public.search_places(query text)
returns table (
  id bigint,
  city text,
  region text,
  country text,
  latitude double precision,
  longitude double precision
)
language sql
stable
security invoker
set search_path = ''
as $$
  with q as (
    select
      extensions.unaccent(lower(btrim(split_part(query, ',', 1)))) as city_part,
      extensions.unaccent(lower(btrim(
        case
          when position(',' in query) > 0
            then substr(query, position(',' in query) + 1)
          else ''
        end
      ))) as rest
  )
  select w.id, w.city, w.admin_name, w.country, w.lat, w.lng
  from public.worldmap w, q
  where length(q.city_part) >= 2
    and starts_with(
      lower(coalesce(w.city_ascii, extensions.unaccent(w.city))),
      q.city_part
    )
    and (
      q.rest = ''
      or strpos(extensions.unaccent(lower(coalesce(w.admin_name, ''))), q.rest) > 0
      or strpos(extensions.unaccent(lower(w.country)), q.rest) > 0
    )
  order by
    (lower(coalesce(w.city_ascii, extensions.unaccent(w.city))) = q.city_part) desc,
    w.population desc nulls last,
    w.city,
    w.id
  limit 6;
$$;

revoke all on function public.search_places(text) from public, anon;
grant execute on function public.search_places(text) to authenticated;

comment on table public.worldmap is 'World cities and towns for the birthplace search. Read-only reference data.';
comment on function public.search_places(text) is 'Birthplace search: up to 6 places for what she typed. See the migration for the rules.';
