-- worldmap was replaced with a new copy (capitalised column names, and a time
-- zone for every place). Already applied to the Supabase project. Kept here as
-- the record of how the database was set up.
--
-- Replacing a table drops its permissions, so the read-only lock had to be put
-- back, and the search rebuilt for the new columns. This supersedes
-- 20260921130000_worldmap_read_only_and_search.sql, whose function no longer
-- matches the table.
--
-- IF worldmap IS EVER REPLACED AGAIN (for example by re-importing a file into a
-- new table), it comes back open. Run the first block below again.

-- Signed-in users may read the places list and nothing else.
revoke all on public.worldmap from anon, authenticated;
grant select on public.worldmap to authenticated;

drop policy if exists "Signed-in users can read places" on public.worldmap;
create policy "Signed-in users can read places"
  on public.worldmap for select to authenticated
  using (true);

-- The return type changes (time zone added), so the old function is replaced.
drop function if exists public.search_places(text);

-- The birthplace search. Takes what she typed, e.g. "marijampole" or
-- "paris, texas", and returns up to 6 places with their time zone. The part
-- before a comma is the start of the city; anything after it narrows by region
-- or country. Accents and capitals are ignored. Bigger places come first, and a
-- name that matches exactly beats one that merely starts with what was typed.
create function public.search_places(query text)
returns table (
  id uuid,
  city text,
  region text,
  country text,
  latitude double precision,
  longitude double precision,
  timezone text
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
  select w."Id", w."Name", w."Region", w."Country", w."Latitude", w."Longitude", w."Timezone"
  from public.worldmap w, q
  where length(q.city_part) >= 2
    and starts_with(lower(extensions.unaccent(w."Name")), q.city_part)
    and (
      q.rest = ''
      or strpos(lower(extensions.unaccent(coalesce(w."Region", ''))), q.rest) > 0
      or strpos(lower(extensions.unaccent(w."Country")), q.rest) > 0
    )
  order by
    (lower(extensions.unaccent(w."Name")) = q.city_part) desc,
    w."Population" desc nulls last,
    w."Name",
    w."Id"
  limit 6;
$$;

revoke all on function public.search_places(text) from public, anon;
grant execute on function public.search_places(text) to authenticated;

comment on table public.worldmap is 'World cities and towns for the birthplace search, each with its time zone. Read-only reference data.';
comment on function public.search_places(text) is 'Birthplace search: up to 6 places, with time zone, for what she typed. See the migration for the rules.';
