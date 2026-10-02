-- TLH L1 Silver learning system: course -> modules -> lessons -> assignments -> submissions
create table if not exists public.l1_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  is_active boolean not null default false,
  sort_order integer not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.l1_course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.l1_courses(id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.l1_course_lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.l1_course_modules(id) on delete cascade,
  title text not null,
  description text,
  lesson_type text not null default 'video' check (lesson_type in ('video','reading')),
  video_url text,
  resource_url text,
  duration_minutes integer,
  sort_order integer not null default 0,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_lesson_progress (
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.l1_course_lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (student_id, lesson_id)
);

create table if not exists public.l1_assignments (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.l1_course_modules(id) on delete cascade,
  title text not null,
  description text,
  instructions text,
  is_required boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.l1_assignment_submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.l1_assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submission_text text,
  submission_url text,
  status text not null default 'submitted' check (status in ('submitted','under_review','reviewed','needs_revision')),
  reviewer_id uuid references public.profiles(id) on delete set null,
  feedback text,
  score integer,
  submitted_at timestamptz not null default now(),
  reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (assignment_id, student_id)
);

create index if not exists l1_courses_active_order_idx on public.l1_courses(is_active, sort_order);
create index if not exists l1_modules_course_order_idx on public.l1_course_modules(course_id, is_active, sort_order);
create index if not exists l1_lessons_module_order_idx on public.l1_course_lessons(module_id, is_active, sort_order);
create index if not exists student_lesson_progress_student_idx on public.student_lesson_progress(student_id, updated_at desc);
create index if not exists l1_assignments_module_order_idx on public.l1_assignments(module_id, is_active, sort_order);
create index if not exists l1_assignment_submissions_student_idx on public.l1_assignment_submissions(student_id, updated_at desc);

alter table public.l1_courses enable row level security;
alter table public.l1_course_modules enable row level security;
alter table public.l1_course_lessons enable row level security;
alter table public.student_lesson_progress enable row level security;
alter table public.l1_assignments enable row level security;
alter table public.l1_assignment_submissions enable row level security;

drop policy if exists "L1 students read active courses" on public.l1_courses;
create policy "L1 students read active courses" on public.l1_courses for select to authenticated
using (is_active and (public.has_membership('l1'::public.membership_level) or public.has_role(auth.uid(),'admin'::public.app_role)));

drop policy if exists "Admins manage L1 courses" on public.l1_courses;
create policy "Admins manage L1 courses" on public.l1_courses for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

drop policy if exists "L1 students read active modules" on public.l1_course_modules;
create policy "L1 students read active modules" on public.l1_course_modules for select to authenticated
using (is_active and (public.has_membership('l1'::public.membership_level) or public.has_role(auth.uid(),'admin'::public.app_role)));

drop policy if exists "Admins manage L1 modules" on public.l1_course_modules;
create policy "Admins manage L1 modules" on public.l1_course_modules for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

drop policy if exists "L1 students read active lessons" on public.l1_course_lessons;
create policy "L1 students read active lessons" on public.l1_course_lessons for select to authenticated
using (is_active and (public.has_membership('l1'::public.membership_level) or public.has_role(auth.uid(),'admin'::public.app_role)));

drop policy if exists "Admins manage L1 lessons" on public.l1_course_lessons;
create policy "Admins manage L1 lessons" on public.l1_course_lessons for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

drop policy if exists "Students read own lesson progress" on public.student_lesson_progress;
create policy "Students read own lesson progress" on public.student_lesson_progress for select to authenticated
using (student_id = auth.uid() or public.has_role(auth.uid(),'admin'::public.app_role));

drop policy if exists "Students write own lesson progress" on public.student_lesson_progress;
create policy "Students write own lesson progress" on public.student_lesson_progress for insert to authenticated
with check (student_id = auth.uid() and public.has_membership('l1'::public.membership_level));

drop policy if exists "Students update own lesson progress" on public.student_lesson_progress;
create policy "Students update own lesson progress" on public.student_lesson_progress for update to authenticated
using (student_id = auth.uid() and public.has_membership('l1'::public.membership_level))
with check (student_id = auth.uid() and public.has_membership('l1'::public.membership_level));

drop policy if exists "Admins manage lesson progress" on public.student_lesson_progress;
create policy "Admins manage lesson progress" on public.student_lesson_progress for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

drop policy if exists "L1 students read active assignments" on public.l1_assignments;
create policy "L1 students read active assignments" on public.l1_assignments for select to authenticated
using (is_active and (public.has_membership('l1'::public.membership_level) or public.has_role(auth.uid(),'admin'::public.app_role)));

drop policy if exists "Admins manage L1 assignments" on public.l1_assignments;
create policy "Admins manage L1 assignments" on public.l1_assignments for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

drop policy if exists "Students read own assignment submissions" on public.l1_assignment_submissions;
create policy "Students read own assignment submissions" on public.l1_assignment_submissions for select to authenticated
using (student_id = auth.uid() or public.has_role(auth.uid(),'admin'::public.app_role));

drop policy if exists "Students submit own assignments" on public.l1_assignment_submissions;
create policy "Students submit own assignments" on public.l1_assignment_submissions for insert to authenticated
with check (student_id = auth.uid() and public.has_membership('l1'::public.membership_level));

drop policy if exists "Students update own assignments" on public.l1_assignment_submissions;
create policy "Students update own assignments" on public.l1_assignment_submissions for update to authenticated
using (student_id = auth.uid() and public.has_membership('l1'::public.membership_level))
with check (student_id = auth.uid() and public.has_membership('l1'::public.membership_level));

drop policy if exists "Admins manage assignment submissions" on public.l1_assignment_submissions;
create policy "Admins manage assignment submissions" on public.l1_assignment_submissions for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

-- Keep updated_at reliable for all learning records.
drop trigger if exists touch_l1_course on public.l1_courses;
create trigger touch_l1_course before update on public.l1_courses for each row execute function public.touch_updated_at();
drop trigger if exists touch_l1_course_module on public.l1_course_modules;
create trigger touch_l1_course_module before update on public.l1_course_modules for each row execute function public.touch_updated_at();
drop trigger if exists touch_l1_course_lesson on public.l1_course_lessons;
create trigger touch_l1_course_lesson before update on public.l1_course_lessons for each row execute function public.touch_updated_at();
drop trigger if exists touch_student_lesson_progress on public.student_lesson_progress;
create trigger touch_student_lesson_progress before update on public.student_lesson_progress for each row execute function public.touch_updated_at();
drop trigger if exists touch_l1_assignment on public.l1_assignments;
create trigger touch_l1_assignment before update on public.l1_assignments for each row execute function public.touch_updated_at();
drop trigger if exists touch_l1_assignment_submission on public.l1_assignment_submissions;
create trigger touch_l1_assignment_submission before update on public.l1_assignment_submissions for each row execute function public.touch_updated_at();
