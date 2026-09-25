-- The private photo folder for vision boards.
--
-- A vision board is an ordinary note (a block inside its content); the note
-- only holds each photo's path, the photo itself lives here. Every photo sits
-- under a folder named after its owner's account id:
--
--   <user_id>/<tile_id>.jpg   (or .png, see 20260925110000_…)
--
-- and the policies below only let a signed-in account touch files inside its
-- own folder. The bucket is private (never public), so a photo can only be
-- seen through a short-lived signed link asked for by its owner.
--
-- No update policy on purpose: a photo is never changed in place. Replacing a
-- tile's photo uploads a new file under a new id and deletes the old one.
--
-- Size and type limits are a safety net: the app shrinks every photo on the
-- phone (to roughly 300 KB) before it is uploaded, so 2 MB is far above any
-- real upload, and only the two formats the app itself produces are accepted.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('vision-board', 'vision-board', false, 2097152, array['image/jpeg', 'image/webp']);

create policy "vision board photos: owner can read"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'vision-board'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "vision board photos: owner can upload"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'vision-board'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "vision board photos: owner can delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'vision-board'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
