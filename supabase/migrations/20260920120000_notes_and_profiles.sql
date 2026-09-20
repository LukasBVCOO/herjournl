-- HerJournl step 1.3: notes and profiles, with privacy enforced by the database.
-- Already applied to the HerJournl Supabase project. Kept here as the record of
-- how the database was set up.

-- Keeps updated_at honest: whichever device saves last is the newest change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Notes
-- ---------------------------------------------------------------------------
create table public.notes (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title text not null default '',
  -- Editor content as JSON, so sections, cards and images can be added later
  -- without changing old notes.
  content jsonb not null default '{}'::jsonb,
  type text not null default 'plain' check (type in ('plain', 'daily_entry')),
  note_date date not null default current_date,
  pinned boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index notes_owner_updated_idx on public.notes (owner, updated_at desc);
create index notes_deleted_at_idx on public.notes (deleted_at) where deleted_at is not null;

create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- Privacy: a note is only ever visible to, and changeable by, its owner.
alter table public.notes enable row level security;

create policy "Owners can read their notes"
  on public.notes for select to authenticated
  using ((select auth.uid()) = owner);

create policy "Owners can create their notes"
  on public.notes for insert to authenticated
  with check ((select auth.uid()) = owner);

create policy "Owners can edit their notes"
  on public.notes for update to authenticated
  using ((select auth.uid()) = owner)
  with check ((select auth.uid()) = owner);

create policy "Owners can delete their notes"
  on public.notes for delete to authenticated
  using ((select auth.uid()) = owner);

revoke all on public.notes from anon;
grant select, insert, update, delete on public.notes to authenticated;

-- ---------------------------------------------------------------------------
-- Profiles: created empty now, filled at onboarding in Release 2.
-- Birth time is optional, because she may not know it.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  name text,
  date_of_birth date,
  birth_time time,
  birth_place text,
  placements jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

create policy "Owners can read their profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Owners can create their profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "Owners can edit their profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on public.profiles from anon;
grant select, insert, update on public.profiles to authenticated;
