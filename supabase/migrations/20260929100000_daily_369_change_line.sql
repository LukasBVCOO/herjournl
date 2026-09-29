-- She can change today's affirmation line at any time (founder, 2026-09-29),
-- not only before her first repetition. Changing it starts the day's 3·6·9
-- again for the new line: the counts go back to 0 and the finished-session
-- times are cleared, in the same save.
--
-- Everything else stays as it was: for the same line, counts only go up and a
-- finished session stays finished, so two phones (or a slow save arriving
-- late) can never undo a repetition. A late save still carrying a line she
-- has since changed away from (with counts above 0) is simply dropped, so it
-- can't put the old line's count back onto the new one.
create or replace function public.daily_369_forward_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.affirmation_id <> old.affirmation_id then
    if new.morning_count = 0 and new.afternoon_count = 0 and new.evening_count = 0 then
      -- A fresh start on a new line.
      new.morning_at := null;
      new.afternoon_at := null;
      new.evening_at := null;
      new.updated_at := now();
      return new;
    end if;
    -- A late save for a line she has since changed: ignored.
    return old;
  end if;

  new.morning_count := greatest(old.morning_count, new.morning_count);
  new.afternoon_count := greatest(old.afternoon_count, new.afternoon_count);
  new.evening_count := greatest(old.evening_count, new.evening_count);
  new.morning_at := coalesce(old.morning_at, new.morning_at);
  new.afternoon_at := coalesce(old.afternoon_at, new.afternoon_at);
  new.evening_at := coalesce(old.evening_at, new.evening_at);
  new.updated_at := now();
  return new;
end;
$$;
