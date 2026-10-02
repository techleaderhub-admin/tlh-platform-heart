-- TLH Interview Question Bank
-- Supports student-submitted real interview questions and a central admin-managed bank.

create table if not exists public.interview_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  topic text not null,
  question_type text not null default 'technical'
    check (question_type in ('technical','coding','system_design','behavioral','debugging','architecture','other')),
  difficulty text not null default 'medium'
    check (difficulty in ('easy','medium','hard')),
  company_name text,
  role_title text,
  interview_round text,
  interview_stage text
    check (interview_stage is null or interview_stage in ('phone','online_assessment','technical','system_design','managerial','hr','onsite','other')),
  candidate_experience_years numeric(4,1),
  asked_at date,
  source_type text not null default 'student'
    check (source_type in ('student','admin')),
  submitted_by uuid references public.profiles(id) on delete set null,
  submission_notes text,
  admin_notes text,
  status text not null default 'pending'
    check (status in ('pending','approved','rejected','archived')),
  is_public boolean not null default false,
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists interview_questions_status_idx on public.interview_questions(status, created_at desc);
create index if not exists interview_questions_topic_idx on public.interview_questions(topic, difficulty);
create index if not exists interview_questions_company_idx on public.interview_questions(company_name);
create index if not exists interview_questions_submitter_idx on public.interview_questions(submitted_by, created_at desc);

alter table public.interview_questions enable row level security;

drop policy if exists "Students read approved interview questions" on public.interview_questions;
create policy "Students read approved interview questions"
on public.interview_questions for select to authenticated
using (
  (is_public and status = 'approved' and public.has_membership('l1'::public.membership_level))
  or submitted_by = auth.uid()
  or public.has_role(auth.uid(),'admin'::public.app_role)
);

drop policy if exists "Students submit interview questions" on public.interview_questions;
create policy "Students submit interview questions"
on public.interview_questions for insert to authenticated
with check (
  submitted_by = auth.uid()
  and public.has_membership('l1'::public.membership_level)
  and source_type = 'student'
  and status = 'pending'
  and is_public = false
);

drop policy if exists "Students update own pending questions" on public.interview_questions;
create policy "Students update own pending questions"
on public.interview_questions for update to authenticated
using (
  submitted_by = auth.uid()
  and status = 'pending'
)
with check (
  submitted_by = auth.uid()
  and status = 'pending'
  and source_type = 'student'
);

drop policy if exists "Admins manage interview questions" on public.interview_questions;
create policy "Admins manage interview questions"
on public.interview_questions for all to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists touch_interview_question on public.interview_questions;
create trigger touch_interview_question
before update on public.interview_questions
for each row execute function public.touch_updated_at();
