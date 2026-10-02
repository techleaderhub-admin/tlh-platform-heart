-- Interview experience/question bank access policies
alter table public.interviews enable row level security;
alter table public.interview_questions enable row level security;
alter table public.question_bank enable row level security;

create policy "Students read own interviews" on public.interviews for select to authenticated using (student_id = auth.uid() or public.has_role(auth.uid(),'admin'::public.app_role));
create policy "Students create own interviews" on public.interviews for insert to authenticated with check (student_id = auth.uid() and public.has_membership('l1'::public.membership_level));
create policy "Students update own interviews" on public.interviews for update to authenticated using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "Students delete own interviews" on public.interviews for delete to authenticated using (student_id = auth.uid());
create policy "Admins manage interviews" on public.interviews for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

create policy "Students read own interview questions" on public.interview_questions for select to authenticated using (exists (select 1 from public.interviews i where i.id = interview_id and i.student_id = auth.uid()) or public.has_role(auth.uid(),'admin'::public.app_role));
create policy "Students add own interview questions" on public.interview_questions for insert to authenticated with check (exists (select 1 from public.interviews i where i.id = interview_id and i.student_id = auth.uid()) and public.has_membership('l1'::public.membership_level));
create policy "Students update own interview questions" on public.interview_questions for update to authenticated using (exists (select 1 from public.interviews i where i.id = interview_id and i.student_id = auth.uid())) with check (exists (select 1 from public.interviews i where i.id = interview_id and i.student_id = auth.uid()));
create policy "Students delete own interview questions" on public.interview_questions for delete to authenticated using (exists (select 1 from public.interviews i where i.id = interview_id and i.student_id = auth.uid()));
create policy "Admins manage interview questions" on public.interview_questions for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

create policy "L1 students read active question bank" on public.question_bank for select to authenticated using ((is_active and public.has_membership('l1'::public.membership_level)) or public.has_role(auth.uid(),'admin'::public.app_role));
create policy "Admins manage question bank" on public.question_bank for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role)) with check (public.has_role(auth.uid(),'admin'::public.app_role));

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end; $$;
drop trigger if exists touch_interviews_updated_at on public.interviews;
create trigger touch_interviews_updated_at before update on public.interviews for each row execute function public.touch_updated_at();
drop trigger if exists touch_question_bank_updated_at on public.question_bank;
create trigger touch_question_bank_updated_at before update on public.question_bank for each row execute function public.touch_updated_at();
