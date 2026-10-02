-- Harden the existing interview/question-bank RLS so the new workflow is the only access path.
drop policy if exists "interviews_owner" on public.interviews;
drop policy if exists "interview_questions_owner_select" on public.interview_questions;
drop policy if exists "interview_questions_admin_manage" on public.interview_questions;
drop policy if exists "question_bank_admin_manage" on public.question_bank;
drop policy if exists "question_bank_authenticated_select" on public.question_bank;
