-- TLH L3 Career Track course structure
-- Task 6 only: Program -> Course -> Module -> Lesson.
-- Completion tracking and assignments are intentionally deferred to Tasks 7 and 8.

create table if not exists public.l3_programs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  sort_order integer not null default 1,
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.l3_courses (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.l3_programs(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 1,
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.l3_course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.l3_courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 1,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.l3_course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.l3_course_modules(id) on delete cascade,
  title text not null,
  description text,
  lesson_type text not null default 'video',
  video_url text,
  resource_url text,
  duration_minutes integer,
  sort_order integer not null default 1,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists l3_courses_program_order_idx on public.l3_courses(program_id, sort_order);
create index if not exists l3_course_modules_course_order_idx on public.l3_course_modules(course_id, sort_order);
create index if not exists l3_course_lessons_module_order_idx on public.l3_course_lessons(module_id, sort_order);

create or replace function public.touch_l3_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists l3_programs_updated_at on public.l3_programs;
create trigger l3_programs_updated_at before update on public.l3_programs
for each row execute function public.touch_l3_updated_at();

drop trigger if exists l3_courses_updated_at on public.l3_courses;
create trigger l3_courses_updated_at before update on public.l3_courses
for each row execute function public.touch_l3_updated_at();

drop trigger if exists l3_course_modules_updated_at on public.l3_course_modules;
create trigger l3_course_modules_updated_at before update on public.l3_course_modules
for each row execute function public.touch_l3_updated_at();

drop trigger if exists l3_course_lessons_updated_at on public.l3_course_lessons;
create trigger l3_course_lessons_updated_at before update on public.l3_course_lessons
for each row execute function public.touch_l3_updated_at();

alter table public.l3_programs enable row level security;
alter table public.l3_courses enable row level security;
alter table public.l3_course_modules enable row level security;
alter table public.l3_course_lessons enable row level security;

drop policy if exists l3_programs_student_select on public.l3_programs;
create policy l3_programs_student_select on public.l3_programs
for select to authenticated
using (is_active and public.has_membership('l3'::public.membership_level));

drop policy if exists l3_programs_admin_manage on public.l3_programs;
create policy l3_programs_admin_manage on public.l3_programs
for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists l3_courses_student_select on public.l3_courses;
create policy l3_courses_student_select on public.l3_courses
for select to authenticated
using (
  is_active
  and public.has_membership('l3'::public.membership_level)
  and exists (
    select 1 from public.l3_programs p
    where p.id = program_id and p.is_active
  )
);

drop policy if exists l3_courses_admin_manage on public.l3_courses;
create policy l3_courses_admin_manage on public.l3_courses
for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists l3_modules_student_select on public.l3_course_modules;
create policy l3_modules_student_select on public.l3_course_modules
for select to authenticated
using (
  is_active
  and public.has_membership('l3'::public.membership_level)
  and exists (
    select 1
    from public.l3_courses c
    join public.l3_programs p on p.id = c.program_id
    where c.id = course_id and c.is_active and p.is_active
  )
);

drop policy if exists l3_modules_admin_manage on public.l3_course_modules;
create policy l3_modules_admin_manage on public.l3_course_modules
for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists l3_lessons_student_select on public.l3_course_lessons;
create policy l3_lessons_student_select on public.l3_course_lessons
for select to authenticated
using (
  is_active
  and public.has_membership('l3'::public.membership_level)
  and exists (
    select 1
    from public.l3_course_modules m
    join public.l3_courses c on c.id = m.course_id
    join public.l3_programs p on p.id = c.program_id
    where m.id = module_id and m.is_active and c.is_active and p.is_active
  )
);

drop policy if exists l3_lessons_admin_manage on public.l3_course_lessons;
create policy l3_lessons_admin_manage on public.l3_course_lessons
for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

revoke all on table public.l3_programs, public.l3_courses, public.l3_course_modules, public.l3_course_lessons from anon;
grant select on table public.l3_programs, public.l3_courses, public.l3_course_modules, public.l3_course_lessons to authenticated;
