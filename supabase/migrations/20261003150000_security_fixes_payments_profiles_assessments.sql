-- Security fixes (Phase 0)
-- 1. Payment events can only be recorded by trusted server code (service_role), never by
--    signed-in users. 20261002220000 re-granted record_payment_event to authenticated after
--    20261002180000 had revoked it.
-- 2. Leaders cannot change their own lifecycle fields (is_blocked, deleted_at) or id.
-- 3. Career assessments are scored in the database, not in the browser.
-- 4. L1/L3 submission reviewer_id is always the reviewing admin (auth.uid()).

------------------------------------------------------------------------------
-- 1. Payment events: service role only
------------------------------------------------------------------------------
revoke execute on function public.record_payment_event(text, text, text, jsonb, uuid)
  from public, anon, authenticated;
grant execute on function public.record_payment_event(text, text, text, jsonb, uuid)
  to service_role;

------------------------------------------------------------------------------
-- 2. Protect profile lifecycle fields from self-service changes
------------------------------------------------------------------------------
create or replace function public.protect_profile_lifecycle_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Server-side code (service role, auth.uid() is null) and admins may change these.
  if auth.uid() is null or public.has_role(auth.uid(), 'admin'::public.app_role) then
    return new;
  end if;

  if new.id is distinct from old.id
     or new.is_blocked is distinct from old.is_blocked
     or new.deleted_at is distinct from old.deleted_at then
    raise exception 'Only Tech Leader Hub admins can change account status.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_lifecycle_fields on public.profiles;
create trigger profiles_protect_lifecycle_fields
before update on public.profiles
for each row execute function public.protect_profile_lifecycle_fields();

------------------------------------------------------------------------------
-- 3. Career assessment: server-side scoring
------------------------------------------------------------------------------
-- Leaders keep read access to their own rows; direct writes are now admin-only
-- (restrictive policies combine with the existing permissive ones).
drop policy if exists career_assessments_write_admin_only_ins on public.career_assessments;
create policy career_assessments_write_admin_only_ins
on public.career_assessments as restrictive for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists career_assessments_write_admin_only_upd on public.career_assessments;
create policy career_assessments_write_admin_only_upd
on public.career_assessments as restrictive for update to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists career_assessments_write_admin_only_del on public.career_assessments;
create policy career_assessments_write_admin_only_del
on public.career_assessments as restrictive for delete to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists career_skill_gaps_write_admin_only_ins on public.career_skill_gaps;
create policy career_skill_gaps_write_admin_only_ins
on public.career_skill_gaps as restrictive for insert to authenticated
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists career_skill_gaps_write_admin_only_upd on public.career_skill_gaps;
create policy career_skill_gaps_write_admin_only_upd
on public.career_skill_gaps as restrictive for update to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists career_skill_gaps_write_admin_only_del on public.career_skill_gaps;
create policy career_skill_gaps_write_admin_only_del
on public.career_skill_gaps as restrictive for delete to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role));

create or replace function public.submit_career_assessment(p_answers jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_questions jsonb := '{
    "architecture-1": "Architecture", "architecture-2": "Architecture", "architecture-3": "Architecture",
    "kotlin-1": "Kotlin & Concurrency", "kotlin-2": "Kotlin & Concurrency", "kotlin-3": "Kotlin & Concurrency",
    "system-1": "Mobile System Design", "system-2": "Mobile System Design", "system-3": "Mobile System Design",
    "leadership-1": "Leadership", "leadership-2": "Leadership", "leadership-3": "Leadership"
  }'::jsonb;
  v_categories text[] := array['Architecture', 'Kotlin & Concurrency', 'Mobile System Design', 'Leadership'];
  v_key text;
  v_value int;
  v_category text;
  v_score int;
  v_scores jsonb := '{}'::jsonb;
  v_strengths text[] := '{}';
  v_gaps text[] := '{}';
  v_recommendations text[] := '{}';
  v_total int := 0;
  v_overall int;
  v_assessment public.career_assessments%rowtype;
begin
  if v_user is null then
    raise exception 'Authentication required.' using errcode = '42501';
  end if;
  if exists (select 1 from public.profiles where id = v_user and (is_blocked or deleted_at is not null)) then
    raise exception 'This account cannot submit assessments.' using errcode = '42501';
  end if;
  if p_answers is null or jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Answers are required.';
  end if;

  -- Every known question answered exactly once with an integer from 1 to 5; nothing extra.
  for v_key in select jsonb_object_keys(v_questions) loop
    if not (p_answers ? v_key) or jsonb_typeof(p_answers -> v_key) <> 'number' then
      raise exception 'Please answer every question.';
    end if;
    v_value := (p_answers ->> v_key)::numeric;
    if v_value < 1 or v_value > 5 or (p_answers ->> v_key)::numeric <> v_value then
      raise exception 'Answers must be whole numbers from 1 to 5.';
    end if;
  end loop;
  if (select count(*) from jsonb_object_keys(p_answers)) <> (select count(*) from jsonb_object_keys(v_questions)) then
    raise exception 'Unexpected answers were submitted.';
  end if;

  foreach v_category in array v_categories loop
    select round(sum((p_answers ->> q.key)::int) * 100.0 / (count(*) * 5))::int
      into v_score
      from jsonb_each_text(v_questions) q
     where q.value = v_category;
    v_scores := v_scores || jsonb_build_object(v_category, v_score);
    v_total := v_total + v_score;
    if v_score >= 70 then v_strengths := v_strengths || v_category; end if;
    if v_score < 60 then v_gaps := v_gaps || v_category; end if;
    v_recommendations := v_recommendations || case
      when v_score < 60 then 'Prioritize a focused ' || v_category || ' practice cycle and review measurable examples from production work.'
      when v_score < 80 then 'Strengthen ' || v_category || ' with deeper design exercises, implementation practice and interview-style explanation.'
      else 'Maintain ' || v_category || ' through advanced design reviews, mentoring and increasingly complex production problems.'
    end;
  end loop;
  v_overall := round(v_total / 4.0);

  insert into public.career_assessments (student_id, assessment_type, score, strengths, gaps, recommendations)
  values (
    v_user,
    'tlh-career-readiness-v1',
    v_overall,
    jsonb_build_object('categories', to_jsonb(v_strengths), 'scores', v_scores),
    jsonb_build_object('categories', to_jsonb(v_gaps), 'scores', v_scores),
    jsonb_build_object('items', to_jsonb(v_recommendations), 'answers', p_answers)
  )
  returning * into v_assessment;

  insert into public.career_skill_gaps (student_id, assessment_id, domain, score, status, recommendation, last_assessed_at)
  select
    v_user,
    v_assessment.id,
    c.category,
    (v_scores ->> c.category)::int,
    case
      when (v_scores ->> c.category)::int < 60 then 'open'
      when (v_scores ->> c.category)::int < 80 then 'developing'
      else 'strength'
    end,
    v_recommendations[c.ord],
    v_assessment.created_at
  from unnest(v_categories) with ordinality as c(category, ord)
  on conflict (student_id, domain) do update
    set assessment_id = excluded.assessment_id,
        score = excluded.score,
        status = excluded.status,
        recommendation = excluded.recommendation,
        last_assessed_at = excluded.last_assessed_at;

  return jsonb_build_object(
    'id', v_assessment.id,
    'score', v_assessment.score,
    'created_at', v_assessment.created_at
  );
end;
$$;

revoke all on function public.submit_career_assessment(jsonb) from public, anon;
grant execute on function public.submit_career_assessment(jsonb) to authenticated;

------------------------------------------------------------------------------
-- 4. Submission reviews record the real reviewer
------------------------------------------------------------------------------
create or replace function public.stamp_submission_reviewer()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null
     and public.has_role(auth.uid(), 'admin'::public.app_role)
     and (new.status is distinct from old.status
          or new.feedback is distinct from old.feedback
          or new.score is distinct from old.score) then
    new.reviewer_id := auth.uid();
  elsif auth.uid() is not null and not public.has_role(auth.uid(), 'admin'::public.app_role) then
    -- Leaders can never set or change who reviewed their work.
    new.reviewer_id := old.reviewer_id;
  end if;
  return new;
end;
$$;

drop trigger if exists l1_submissions_stamp_reviewer on public.l1_assignment_submissions;
create trigger l1_submissions_stamp_reviewer
before update on public.l1_assignment_submissions
for each row execute function public.stamp_submission_reviewer();

do $$
begin
  if to_regclass('public.l3_assignment_submissions') is not null then
    execute 'drop trigger if exists l3_submissions_stamp_reviewer on public.l3_assignment_submissions';
    execute 'create trigger l3_submissions_stamp_reviewer
             before update on public.l3_assignment_submissions
             for each row execute function public.stamp_submission_reviewer()';
  end if;
end;
$$;
