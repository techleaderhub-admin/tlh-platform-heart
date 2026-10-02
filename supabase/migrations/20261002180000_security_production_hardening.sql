-- TLH security and production hardening
-- 1) Never expose L1 answer keys to students.
drop policy if exists "Eligible students read L1 questions" on public.l1_assessment_questions;

drop policy if exists "Admins manage L1 questions" on public.l1_assessment_questions;
create policy "Admins manage L1 questions"
on public.l1_assessment_questions
for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create or replace function public.get_l1_assessment_questions()
returns table (
  id uuid,
  question_text text,
  category text,
  option_a text,
  option_b text,
  option_c text,
  option_d text,
  explanation text,
  sort_order integer,
  is_active boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    q.id,
    q.question_text,
    q.category,
    q.option_a,
    q.option_b,
    q.option_c,
    q.option_d,
    q.explanation,
    q.sort_order,
    q.is_active
  from public.l1_assessment_questions q
  where q.is_active = true
    and public.has_membership('l1'::public.membership_level);
$$;

revoke all on function public.get_l1_assessment_questions() from anon, public;
grant execute on function public.get_l1_assessment_questions() to authenticated;

-- 2) Reduce RPC attack surface. Client-facing helpers remain authenticated-only.
revoke all on function public.has_role(uuid, public.app_role) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;

revoke all on function public.has_membership(public.membership_level) from anon, public;
grant execute on function public.has_membership(public.membership_level) to authenticated;

revoke all on function public.get_my_membership_level() from anon, public;
grant execute on function public.get_my_membership_level() to authenticated;

revoke all on function public.membership_level_rank(public.membership_level) from anon, public;
grant execute on function public.membership_level_rank(public.membership_level) to authenticated;

revoke all on function public.get_my_career_os() from anon, public;
grant execute on function public.get_my_career_os() to authenticated;

revoke all on function public.update_my_roadmap_item_status(uuid, text) from anon, public;
grant execute on function public.update_my_roadmap_item_status(uuid, text) to authenticated;

revoke all on function public.submit_l1_assessment(uuid) from anon, public;
grant execute on function public.submit_l1_assessment(uuid) to authenticated;

-- Payment event ingestion is reserved for trusted server-side/webhook execution.
revoke all on function public.record_payment_event(text, text, text, jsonb, uuid) from public, authenticated;

-- Trigger-only functions are not RPC APIs.
revoke all on function public.apply_successful_payment_membership() from public, authenticated;
revoke all on function public.ensure_free_membership() from public, authenticated;
revoke all on function public.record_membership_change() from public, authenticated;
revoke all on function public.touch_career_skill_gap() from public, authenticated;
revoke all on function public.touch_foundation_resource_updated_at() from public, authenticated;
revoke all on function public.touch_payment_products_updated_at() from public, authenticated;
revoke all on function public.touch_student_membership() from public, authenticated;
revoke all on function public.touch_updated_at() from public, authenticated;

-- 3) Policies using auth.uid() should not be exposed to anonymous callers.
alter policy "career_assessments_owner"
on public.career_assessments to authenticated;

alter policy "career_profiles_owner"
on public.career_profiles to authenticated;

alter policy "interview_answers_owner_select"
on public.interview_answers to authenticated;

alter policy "interview_answers_student_insert"
on public.interview_answers to authenticated;

alter policy "interview_answers_student_update"
on public.interview_answers to authenticated;

alter policy "membership_history_admin_select"
on public.membership_history to authenticated;

alter policy "membership_history_self_select"
on public.membership_history to authenticated;

alter policy "payments_admin_manage"
on public.payments to authenticated;

alter policy "payments_owner_select"
on public.payments to authenticated;

alter policy "profiles_admin_insert"
on public.profiles to authenticated;

alter policy "profiles_self_select"
on public.profiles to authenticated;

alter policy "profiles_self_update"
on public.profiles to authenticated;

alter policy "membership_admin_manage"
on public.student_memberships to authenticated;

alter policy "membership_self_select"
on public.student_memberships to authenticated;

alter policy "roles_admin_manage"
on public.user_roles to authenticated;

alter policy "roles_self_select"
on public.user_roles to authenticated;
