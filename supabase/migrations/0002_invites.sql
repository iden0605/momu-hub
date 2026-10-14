-- Pre-approved emails, roles are applied on first Google sign-in then the invite is removed
create table app_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null unique check (email = lower(email)),
  roles app_role[] not null check (roles <> '{}'),
  invited_by uuid references app_users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- Read and written only through server actions with the service role
alter table app_invites enable row level security;
