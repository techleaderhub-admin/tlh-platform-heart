-- Task 7: simple L3 course completion tracking.
-- Status model intentionally stays: not_started -> in_progress -> completed.

create table if not exists public.student_l3_lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.l3_course_lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started','in_progress','completed')),
  started_at timestamptz,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(student_id, lesson_id)
);

create index if not exists student_l3_lesson_progress_student_idx on public.student_l3_lesson_progress(student_id);
create index if not exists student_l3_lesson_progress_lesson_idx on public.student_l3_lesson_progress(lesson_id);

alter table public.student_l3_lesson_progress enable row level security;

drop policy if exists l3_lesson_progress_student_select on public.student_l3_lesson_progress;
create policy l3_lesson_progress_student_select on public.student_l3_lesson_progress for select to authenticated using (student_id = auth.uid());

drop policy if exists l3_lesson_progress_student_insert on public.student_l3_lesson_progress;
create policy l3_lesson_progress_student_insert on public.student_l3_lesson_progress for insert to authenticated with check (student_id = auth.uid() and public.has_membership('l3'::public.membership_level));

drop policy if exists l3_lesson_progress_student_update on public.student_l3_lesson_progress;
create policy l3_lesson_progress_student_update on public.student_l3_lesson_progress for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid() and public.has_membership('l3'::public.membership_level));

drop policy if exists l3_lesson_progress_admin_select on public.student_l3_lesson_progress;
create policy l3_lesson_progress_admin_select on public.student_l3_lesson_progress for select to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role));

drop policy if exists l3_lesson_progress_admin_manage on public.student_l3_lesson_progress;
create policy l3_lesson_progress_admin_manage on public.student_l3_lesson_progress for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

revoke all on public.student_l3_lesson_progress from anon;
grant select, insert, update on public.student_l3_lesson_progress to authenticated;

create or replace function public.touch_student_l3_progress_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists student_l3_progress_updated_at on public.student_l3_lesson_progress;
create trigger student_l3_progress_updated_at before update on public.student_l3_lesson_progress
for each row execute function public.touch_student_l3_progress_updated_at();
