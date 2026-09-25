-- Runs the nightly clean-up (20260925120000_daily_cleanup.sql and the
-- daily-cleanup Edge Function in supabase/functions/) every day at 03:00 UTC,
-- the quietest hour across Europe and the US.
--
-- The job sends the same shared secret as the notification job. The real
-- value is only in the scheduled job itself (applied directly), never in a
-- file: replace <CRON_SECRET> with it if this is ever re-applied by hand.

select cron.schedule(
  'daily-cleanup',
  '0 3 * * *',
  $job$
  select net.http_post(
    url := 'https://jvsyehnvgfyfvkcvqvrg.supabase.co/functions/v1/daily-cleanup',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <CRON_SECRET>'
    ),
    body := '{}'::jsonb
  );
  $job$
);
