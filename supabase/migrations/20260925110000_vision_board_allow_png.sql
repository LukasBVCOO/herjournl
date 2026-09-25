-- Vision board photos may also be PNGs (founder's request), e.g. a
-- screenshot or a picture with a see-through background. Same 2 MB limit and
-- the same owner-only rules as before (20260925100000_vision_board_photos.sql).

update storage.buckets
set allowed_mime_types = array['image/jpeg', 'image/webp', 'image/png']
where id = 'vision-board';
