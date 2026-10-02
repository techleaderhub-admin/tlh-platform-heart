-- Task 15: Similar Interview Question Engine
-- Uses the existing pg_trgm extension to rank active curated questions by textual similarity.
-- The plan does not define a numeric similarity threshold, so V1 returns the top related
-- questions rather than inventing a product-specific cutoff.

create extension if not exists pg_trgm;

create index if not exists question_bank_question_trgm_idx
  on public.question_bank using gin (question gin_trgm_ops);

create or replace function public.get_similar_question_bank(
  p_question_id uuid,
  p_limit integer default 5
)
returns table (
  id uuid,
  question text,
  category text,
  difficulty text,
  technology text,
  similarity real
)
language sql
stable
security invoker
set search_path = public
as $$
  with source_question as (
    select qb.question
    from public.question_bank qb
    where qb.id = p_question_id
      and qb.is_active = true
      and public.has_membership('l1'::public.membership_level)
  )
  select
    candidate.id,
    candidate.question,
    candidate.category,
    candidate.difficulty,
    candidate.technology,
    similarity(candidate.question, source_question.question)::real as similarity
  from public.question_bank candidate
  cross join source_question
  where candidate.is_active = true
    and candidate.id <> p_question_id
    and public.has_membership('l1'::public.membership_level)
  order by similarity(candidate.question, source_question.question) desc, candidate.created_at desc
  limit greatest(1, least(coalesce(p_limit, 5), 10));
$$;

revoke execute on function public.get_similar_question_bank(uuid, integer) from public;
grant execute on function public.get_similar_question_bank(uuid, integer) to authenticated;
