-- The nightly clean-up. Run once a day by pg_cron, which calls the
-- daily-cleanup Edge Function (photos can only be deleted through the Storage
-- service, not with SQL), which calls the two functions below.
--
-- 1. Notes that have sat in Recently deleted for more than 30 days are
--    removed for good. The app already hides them after 30 days (and its
--    "days left" counter says so); until now nothing actually removed them.
--
-- 2. Vision board photos that no note uses any more are deleted: photos on a
--    board that was removed for good (step 1, or "Delete forever"), and any
--    photo whose own delete didn't go through. A note still in Recently
--    deleted keeps its photos, so restoring it brings the board back whole.
--    A photo is never touched in its first 7 days, so a photo whose board
--    hasn't finished saving yet (e.g. she went offline straight after adding
--    it) is never mistaken for an unused one.
--
-- Both are only for the clean-up job (service_role). Nobody signed in, or
-- signed out, can run them: Postgres lets everyone run new functions by
-- default, so that is taken away explicitly.

create or replace function public.purge_expired_notes()
returns integer
language sql
set search_path = ''
as $$
  with gone as (
    delete from public.notes
    where deleted_at is not null
      and deleted_at < now() - interval '30 days'
    returning 1
  )
  select count(*)::integer from gone;
$$;

-- Every photo a note of hers still points at, anywhere in the note (a board
-- normally sits at the top level, but this doesn't rely on it). Matched per
-- owner as well as by path, so one person's note can never keep another
-- person's photo alive.
create or replace function public.vision_board_unused_photos(min_age interval default interval '7 days')
returns table (name text)
language sql
stable
set search_path = ''
as $$
  with used as (
    select distinct n.owner::text as owner, p #>> '{}' as path
    from public.notes n,
         jsonb_path_query(
           n.content,
           'lax $.** ? (@.type == "visionBoard").attrs.tiles[*] ? (@.kind == "photo").path'
         ) p
    where jsonb_typeof(p) = 'string'
  )
  select o.name
  from storage.objects o
  where o.bucket_id = 'vision-board'
    and o.created_at < now() - min_age
    and not exists (
      select 1 from used u
      where u.path = o.name
        and u.owner = split_part(o.name, '/', 1)
    );
$$;

-- How many photos are old enough to be looked at at all — the Edge Function
-- compares this with the unused count as a safety check (see there).
create or replace function public.vision_board_photo_count(min_age interval default interval '7 days')
returns integer
language sql
stable
set search_path = ''
as $$
  select count(*)::integer
  from storage.objects o
  where o.bucket_id = 'vision-board'
    and o.created_at < now() - min_age;
$$;

revoke execute on function public.purge_expired_notes() from public, anon, authenticated;
revoke execute on function public.vision_board_unused_photos(interval) from public, anon, authenticated;
revoke execute on function public.vision_board_photo_count(interval) from public, anon, authenticated;
grant execute on function public.purge_expired_notes() to service_role;
grant execute on function public.vision_board_unused_photos(interval) to service_role;
grant execute on function public.vision_board_photo_count(interval) to service_role;
