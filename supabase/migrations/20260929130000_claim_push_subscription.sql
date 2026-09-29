-- A phone's push address follows whoever is signed in on it.
--
-- Bug found 2026-09-29: the endpoint is unique per phone/browser, so once one
-- account had allowed notifications on a phone, a second account signing in
-- there could never save it. Its upsert hit the first account's row, which
-- RLS hides from everyone else, so the save failed silently: the new account
-- got nothing, and the phone kept getting the first account's notifications.
--
-- claim_push_subscription saves the address for the signed-in person, taking
-- it over from another account if needed. That is safe: the endpoint and its
-- two keys only exist inside that one browser, so nobody can claim someone
-- else's phone from a different device. Runs as the owner (security definer)
-- only so it can move a row RLS would otherwise hide; it always writes
-- auth.uid() as the owner and nothing else.
create or replace function public.claim_push_subscription(
  p_endpoint text,
  p_p256dh text,
  p_auth_key text,
  p_timezone text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;

  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth_key, timezone)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth_key, p_timezone)
  on conflict (endpoint) do update
    set user_id = excluded.user_id,
        p256dh = excluded.p256dh,
        auth_key = excluded.auth_key,
        timezone = excluded.timezone;
end;
$$;

revoke execute on function public.claim_push_subscription(text, text, text, text) from public, anon;
grant execute on function public.claim_push_subscription(text, text, text, text) to authenticated;
