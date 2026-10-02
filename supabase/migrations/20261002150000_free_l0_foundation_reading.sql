-- TLH V1: Free/L0 foundation reading journey
create table if not exists public.foundation_resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  resource_type text not null default 'pdf' check (resource_type in ('pdf')),
  resource_url text not null,
  is_required boolean not null default true,
  minimum_membership public.membership_level not null default 'free',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_resource_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  resource_id uuid not null references public.foundation_resources(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, resource_id)
);

create index if not exists foundation_resources_active_order_idx
  on public.foundation_resources (is_active, minimum_membership, sort_order);

create index if not exists student_resource_progress_student_idx
  on public.student_resource_progress (student_id, updated_at desc);

alter table public.foundation_resources enable row level security;
alter table public.student_resource_progress enable row level security;

drop policy if exists "Foundation resources are visible to eligible users" on public.foundation_resources;
create policy "Foundation resources are visible to eligible users"
on public.foundation_resources for select to authenticated
using (
  is_active
  and (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or public.has_membership(minimum_membership)
  )
);

drop policy if exists "Admins manage foundation resources" on public.foundation_resources;
create policy "Admins manage foundation resources"
on public.foundation_resources for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Students view own reading progress" on public.student_resource_progress;
create policy "Students view own reading progress"
on public.student_resource_progress for select to authenticated
using (student_id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Students create own reading progress" on public.student_resource_progress;
create policy "Students create own reading progress"
on public.student_resource_progress for insert to authenticated
with check (student_id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Students update own reading progress" on public.student_resource_progress;
create policy "Students update own reading progress"
on public.student_resource_progress for update to authenticated
using (student_id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role))
with check (student_id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Admins delete reading progress" on public.student_resource_progress;
create policy "Admins delete reading progress"
on public.student_resource_progress for delete to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));

create or replace function public.touch_foundation_resource_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists foundation_resources_updated_at on public.foundation_resources;
create trigger foundation_resources_updated_at
before update on public.foundation_resources
for each row execute function public.touch_foundation_resource_updated_at();

drop trigger if exists student_resource_progress_updated_at on public.student_resource_progress;
create trigger student_resource_progress_updated_at
before update on public.student_resource_progress
for each row execute function public.touch_foundation_resource_updated_at();
