-- Supabase gave the notes and profiles tables broad default rights when they
-- were created. RLS already keeps everyone to their own rows, but TRUNCATE
-- (empty a whole table) ignores RLS, and REFERENCES / TRIGGER are never needed
-- by the app. Take those three back; the everyday rights (select, insert,
-- update, delete) stay, still guarded by RLS.

revoke truncate, references, trigger on public.notes from anon, authenticated;
revoke truncate, references, trigger on public.profiles from anon, authenticated;
