-- Career assessment skill-gap tracking.
-- Reuses the existing career_assessments table and stores one current row per
-- student/domain so the Career OS can consume a longitudinal skill snapshot.

create table if not exists public.career_skill_gaps (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  assessment_id uuid references public.career_assessments(id) on delete set null,
  domain text not null,
  score numeric,
  status text not null default 'open',
  recommendation text,
  evidence text,
  last_assessed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists career_skill_gaps_student_domain_unique
  on public.career_skill_gaps(student_id, domain);

create index if not exists career_skill_gaps_student_idx
  on public.career_skill_gaps(student_id);

alter table public.career_skill_gaps enable row level security;

drop policy if exists "Students manage own skill gaps" on public.career_skill_gaps;
drop policy if exists "Admins manage skill gaps" on public.career_skill_gaps;

create policy "Students manage own skill gaps"
on public.career_skill_gaps
for all
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

create policy "Admins manage skill gaps"
on public.career_skill_gaps
for all
to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

create or replace function public.touch_career_skill_gap()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_career_skill_gap on public.career_skill_gaps;
create trigger touch_career_skill_gap
before update on public.career_skill_gaps
for each row execute function public.touch_career_skill_gap();
