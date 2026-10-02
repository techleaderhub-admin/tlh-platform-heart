-- Repair/forward migration for profile identity fields.
-- This is intentionally idempotent so it also fixes environments where the
-- earlier student-profile migration was not applied.

alter table public.profiles
  add column if not exists linkedin_url text;

alter table public.profiles
  add column if not exists is_blocked boolean not null default false;

alter table public.profiles
  add column if not exists deleted_at timestamptz;

alter table public.profiles
  drop constraint if exists profiles_linkedin_url_format;

alter table public.profiles
  add constraint profiles_linkedin_url_format
  check (
    linkedin_url is null
    or linkedin_url ~* '^https?://([a-z0-9-]+\.)?linkedin\.com/.*$'
  );

drop policy if exists "profiles_admin_update" on public.profiles;
create policy "profiles_admin_update"
on public.profiles
for update to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Ask PostgREST to reload its schema after the migration.
notify pgrst, 'reload schema';
