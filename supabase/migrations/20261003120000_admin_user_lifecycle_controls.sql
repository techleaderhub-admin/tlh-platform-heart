-- Admin user lifecycle controls.
-- is_blocked prevents sign-in at the application layer.
-- deleted_at is a reversible soft-delete marker so admin removal does not orphan the Supabase Auth account.

alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

alter table public.profiles
  add column if not exists deleted_at timestamptz;

create index if not exists profiles_active_directory_idx
  on public.profiles (created_at desc)
  where deleted_at is null;

create index if not exists profiles_blocked_idx
  on public.profiles (is_blocked)
  where is_blocked = true;

-- Allow admins to manage profile lifecycle fields and edit user profile information.
drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles
for update to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));
