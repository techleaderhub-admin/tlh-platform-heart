-- Task 8: L3 assignment submission and tracking
create table if not exists public.l3_assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.l3_course_modules(id) on delete cascade,
  title text not null,
  description text,
  instructions text,
  sort_order integer not null default 1,
  is_required boolean not null default true,
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.l3_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.l3_assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submission_text text,
  submission_url text,
  status text not null default 'submitted' check (status in ('submitted','under_review','reviewed','needs_revision')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  feedback text,
  score numeric,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists l3_assignments_module_sort_idx on public.l3_assignments(module_id, sort_order);
create index if not exists l3_assignment_submissions_student_idx on public.l3_assignment_submissions(student_id, updated_at desc);
create index if not exists l3_assignment_submissions_assignment_idx on public.l3_assignment_submissions(assignment_id, updated_at desc);

drop trigger if exists touch_l3_assignments_updated_at on public.l3_assignments;
create trigger touch_l3_assignments_updated_at before update on public.l3_assignments
for each row execute function public.touch_l3_updated_at();

drop trigger if exists touch_l3_assignment_submissions_updated_at on public.l3_assignment_submissions;
create trigger touch_l3_assignment_submissions_updated_at before update on public.l3_assignment_submissions
for each row execute function public.touch_l3_updated_at();

alter table public.l3_assignments enable row level security;
alter table public.l3_assignment_submissions enable row level security;

drop policy if exists l3_assignments_student_select on public.l3_assignments;
create policy l3_assignments_student_select on public.l3_assignments for select to authenticated
using (
  is_active = true
  and exists (
    select 1 from public.l3_course_modules m
    join public.l3_courses c on c.id = m.course_id
    join public.l3_programs p on p.id = c.program_id
    where m.id = l3_assignments.module_id
      and m.is_active = true and c.is_active = true and p.is_active = true
  )
  and public.has_membership('l3'::public.membership_level)
);

drop policy if exists l3_assignments_admin_manage on public.l3_assignments;
create policy l3_assignments_admin_manage on public.l3_assignments for all to authenticated
using (public.has_role(auth.uid(),'admin'))
with check (public.has_role(auth.uid(),'admin'));

drop policy if exists l3_assignment_submissions_student_select on public.l3_assignment_submissions;
create policy l3_assignment_submissions_student_select on public.l3_assignment_submissions for select to authenticated
using (student_id = auth.uid());

drop policy if exists l3_assignment_submissions_student_insert on public.l3_assignment_submissions;
create policy l3_assignment_submissions_student_insert on public.l3_assignment_submissions for insert to authenticated
with check (
  student_id = auth.uid()
  and public.has_membership('l3'::public.membership_level)
  and exists (
    select 1 from public.l3_assignments a
    join public.l3_course_modules m on m.id = a.module_id
    join public.l3_courses c on c.id = m.course_id
    join public.l3_programs p on p.id = c.program_id
    where a.id = l3_assignment_submissions.assignment_id
      and a.is_active = true and m.is_active = true and c.is_active = true and p.is_active = true
  )
);

drop policy if exists l3_assignment_submissions_student_update on public.l3_assignment_submissions;
create policy l3_assignment_submissions_student_update on public.l3_assignment_submissions for update to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid() and public.has_membership('l3'::public.membership_level));

drop policy if exists l3_assignment_submissions_admin_select on public.l3_assignment_submissions;
create policy l3_assignment_submissions_admin_select on public.l3_assignment_submissions for select to authenticated
using (public.has_role(auth.uid(),'admin'));

drop policy if exists l3_assignment_submissions_admin_update on public.l3_assignment_submissions;
create policy l3_assignment_submissions_admin_update on public.l3_assignment_submissions for update to authenticated
using (public.has_role(auth.uid(),'admin'))
with check (public.has_role(auth.uid(),'admin'));

revoke all on public.l3_assignments from anon;
revoke all on public.l3_assignment_submissions from anon;
grant select on public.l3_assignments to authenticated;
grant select, insert, update on public.l3_assignment_submissions to authenticated;
