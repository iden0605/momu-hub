-- MoMu Hub schema: users and roles, events, attendance.
-- Reads go through RLS, all writes go through server actions using the service role key.

create type app_role as enum ('member', 'committee', 'admin');
create type event_type as enum ('function', 'camp', 'excursion', 'other');
create type event_discovery_source as enum (
  'instagram',
  'facebook',
  'whatsapp',
  'newsletter',
  'another_club',
  'umsu_website',
  'friend',
  'other'
);

-- One row per Google account that has signed in, empty roles means no access yet
create table app_users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users (id) on delete cascade,
  email text not null unique,
  display_name text not null default '',
  avatar_url text,
  roles app_role[] not null default '{}',
  created_at timestamptz not null default now()
);

-- starts_at is wall-clock text the committee types in, not used in time logic
create table events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  created_by uuid not null references app_users (id),
  is_open boolean not null default true,
  closed_at timestamptz,
  starts_at timestamp,
  venue text,
  event_types event_type[] not null default '{}',
  event_type_other_details text,
  created_at timestamptz not null default now()
);

-- Attendee roster, reused across every event they attend
create table attendance_members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  student_number text unique check (student_number ~ '^\d{7}$'),
  course text check (course ~ '^[A-Z]+-[A-Z]+$'),
  is_club_member boolean not null default false,
  created_at timestamptz not null default now()
);

create index attendance_members_full_name_idx on attendance_members (full_name);

-- checked_in_by is null for self check-ins
create table attendance_entries (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events (id) on delete cascade,
  member_id uuid not null references attendance_members (id),
  checked_in_by uuid references app_users (id),
  found_via event_discovery_source,
  found_via_other_details text,
  created_at timestamptz not null default now(),
  unique (event_id, member_id)
);

create index attendance_entries_event_idx on attendance_entries (event_id);
create index attendance_entries_member_idx on attendance_entries (member_id);

-- Roles of the signed-in user, empty if none
create function current_app_roles() returns app_role[]
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select roles from app_users where auth_user_id = auth.uid()),
    '{}'
  );
$$;

alter table app_users enable row level security;
alter table events enable row level security;
alter table attendance_members enable row level security;
alter table attendance_entries enable row level security;

create policy "read users" on app_users
  for select to authenticated
  using (auth_user_id = auth.uid() or current_app_roles() <> '{}');

create policy "roled can read events" on events
  for select to authenticated
  using (current_app_roles() <> '{}');

create policy "roled can read attendance members" on attendance_members
  for select to authenticated
  using (current_app_roles() <> '{}');

create policy "roled can read attendance" on attendance_entries
  for select to authenticated
  using (current_app_roles() <> '{}');

grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant usage, select on sequences to anon, authenticated, service_role;

-- Live refresh for shared views
alter publication supabase_realtime add table events;
alter publication supabase_realtime add table attendance_entries;
