-- L1 knowledge-check progression analytics
-- Server-side category scoring keeps the answer key out of client-side calculations.

create or replace function public.get_l1_assessment_category_results(p_attempt_id uuid)
returns table (
  category text,
  total_questions integer,
  correct_answers integer,
  score numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student_id uuid;
begin
  select student_id
    into v_student_id
  from public.l1_assessment_attempts
  where id = p_attempt_id
    and status = 'submitted';

  if v_student_id is null then
    raise exception 'Submitted assessment not found';
  end if;

  if auth.uid() <> v_student_id
     and not public.has_role(auth.uid(), 'admin') then
    raise exception 'Not authorized';
  end if;

  return query
  select
    q.category,
    count(*)::integer as total_questions,
    count(*) filter (where a.selected_option = q.correct_option)::integer as correct_answers,
    round(
      (
        count(*) filter (where a.selected_option = q.correct_option)::numeric
        / nullif(count(*)::numeric, 0)
      ) * 100,
      0
    ) as score
  from public.l1_assessment_answers a
  join public.l1_assessment_questions q on q.id = a.question_id
  where a.attempt_id = p_attempt_id
  group by q.category
  order by score asc, q.category asc;
end;
$$;

grant execute on function public.get_l1_assessment_category_results(uuid) to authenticated;
