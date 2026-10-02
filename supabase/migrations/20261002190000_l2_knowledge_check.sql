-- TLH L2 Advanced Android knowledge check
create table if not exists public.l2_assessment_questions (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  category text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option text not null check (correct_option in ('a','b','c','d')),
  explanation text,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.l2_assessment_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress','submitted')),
  score integer,
  total_questions integer,
  passed boolean,
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.l2_assessment_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.l2_assessment_attempts(id) on delete cascade,
  question_id uuid not null references public.l2_assessment_questions(id) on delete cascade,
  selected_option text check (selected_option in ('a','b','c','d')),
  created_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);

create index if not exists l2_questions_active_order_idx on public.l2_assessment_questions(is_active, sort_order);
create index if not exists l2_attempts_student_idx on public.l2_assessment_attempts(student_id, created_at desc);
create index if not exists l2_answers_attempt_idx on public.l2_assessment_answers(attempt_id);

alter table public.l2_assessment_questions enable row level security;
alter table public.l2_assessment_attempts enable row level security;
alter table public.l2_assessment_answers enable row level security;

create policy "Admins manage L2 questions" on public.l2_assessment_questions
for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

create policy "Students read own L2 attempts" on public.l2_assessment_attempts
for select to authenticated using (student_id=auth.uid() or public.has_role(auth.uid(),'admin'::public.app_role));

create policy "Students create own L2 attempts" on public.l2_assessment_attempts
for insert to authenticated with check (student_id=auth.uid() and public.has_membership('l2'::public.membership_level));

create policy "Students update own L2 attempts" on public.l2_assessment_attempts
for update to authenticated using (student_id=auth.uid() and status='in_progress')
with check (student_id=auth.uid() and status='in_progress');

create policy "Admins manage L2 attempts" on public.l2_assessment_attempts
for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

create policy "Students read own L2 answers" on public.l2_assessment_answers
for select to authenticated using (
  exists (select 1 from public.l2_assessment_attempts a
          where a.id=attempt_id and (a.student_id=auth.uid() or public.has_role(auth.uid(),'admin'::public.app_role)))
);

create policy "Students write own L2 answers" on public.l2_assessment_answers
for insert to authenticated with check (
  exists (select 1 from public.l2_assessment_attempts a
          where a.id=attempt_id and a.student_id=auth.uid() and a.status='in_progress'
            and public.has_membership('l2'::public.membership_level))
);

create policy "Students update own L2 answers" on public.l2_assessment_answers
for update to authenticated using (
  exists (select 1 from public.l2_assessment_attempts a
          where a.id=attempt_id and a.student_id=auth.uid() and a.status='in_progress')
) with check (
  exists (select 1 from public.l2_assessment_attempts a
          where a.id=attempt_id and a.student_id=auth.uid() and a.status='in_progress')
);

create policy "Admins manage L2 answers" on public.l2_assessment_answers
for all to authenticated using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

create or replace function public.get_l2_assessment_questions()
returns table (
  id uuid, question_text text, category text,
  option_a text, option_b text, option_c text, option_d text,
  explanation text, sort_order integer, is_active boolean
)
language sql stable security definer set search_path=public
as $$
  select q.id,q.question_text,q.category,q.option_a,q.option_b,q.option_c,q.option_d,
         q.explanation,q.sort_order,q.is_active
  from public.l2_assessment_questions q
  where q.is_active=true and public.has_membership('l2'::public.membership_level);
$$;

revoke all on function public.get_l2_assessment_questions() from public, anon;
grant execute on function public.get_l2_assessment_questions() to authenticated;

create or replace function public.submit_l2_assessment(p_attempt_id uuid)
returns public.l2_assessment_attempts
language plpgsql security definer set search_path=public
as $$
declare v_attempt public.l2_assessment_attempts; v_total integer; v_score integer;
begin
  select * into v_attempt from public.l2_assessment_attempts where id=p_attempt_id for update;
  if not found then raise exception 'Assessment attempt not found'; end if;
  if v_attempt.student_id<>auth.uid() and not public.has_role(auth.uid(),'admin'::public.app_role)
    then raise exception 'Not authorized'; end if;
  if v_attempt.status='submitted' then return v_attempt; end if;

  select count(*) into v_total from public.l2_assessment_questions where is_active=true;
  if v_total=0 then raise exception 'No active L2 questions are available'; end if;

  select count(*) into v_score
  from public.l2_assessment_answers a
  join public.l2_assessment_questions q on q.id=a.question_id
  where a.attempt_id=p_attempt_id and a.selected_option=q.correct_option and q.is_active=true;

  update public.l2_assessment_attempts
  set status='submitted',
      score=round((v_score::numeric/v_total::numeric)*100),
      total_questions=v_total,
      passed=((v_score::numeric/v_total::numeric)*100)>=40,
      submitted_at=now()
  where id=p_attempt_id returning * into v_attempt;
  return v_attempt;
end;
$$;

revoke all on function public.submit_l2_assessment(uuid) from public, anon;
grant execute on function public.submit_l2_assessment(uuid) to authenticated;

insert into public.l2_assessment_questions
(question_text,category,option_a,option_b,option_c,option_d,correct_option,explanation,sort_order)
select * from (values
('What is the main advantage of structured concurrency in Kotlin?', 'Advanced Kotlin', 'It removes the need for cancellation', 'It ties child coroutines to a scope and lifecycle', 'It makes every coroutine run on a new thread', 'It guarantees parallel execution', 'b', 'Structured concurrency keeps coroutine lifetimes tied to a scope and propagates cancellation predictably.', 1),
('What is the practical difference between StateFlow and SharedFlow?', 'Flow', 'StateFlow represents current state while SharedFlow can broadcast events', 'SharedFlow can never have multiple collectors', 'StateFlow is only for background threads', 'They are identical APIs', 'a', 'StateFlow models current state; SharedFlow is commonly used for shared emissions and events.', 2),
('Why is repeatOnLifecycle commonly preferred for collecting UI Flow?', 'Flow', 'It permanently collects even when the UI is stopped', 'It starts and cancels collection with a lifecycle state', 'It converts Flow into LiveData', 'It disables cancellation', 'b', 'repeatOnLifecycle launches collection when the lifecycle reaches the requested state and cancels it when it falls below it.', 3),
('What is a common benefit of immutable UI state objects?', 'Architecture', 'They make state transitions explicit and easier to reason about', 'They require global variables', 'They eliminate all recomposition', 'They prevent testing', 'a', 'Immutable state makes state changes explicit and reduces accidental mutation.', 4),
('Which change most directly reduces unnecessary work when rendering a large Android screen?', 'Performance', 'Move every operation to the main thread', 'Avoid unnecessary allocations and repeated expensive computation', 'Disable lifecycle handling', 'Use a larger bitmap for every image', 'b', 'Reducing repeated work and allocations is a common performance optimization.', 5),
('What is a key reason to paginate a large remote dataset?', 'Networking', 'To load the complete dataset before showing anything', 'To bound memory and network work per interaction', 'To eliminate caching', 'To avoid HTTP entirely', 'b', 'Pagination limits the amount of data fetched and held at one time.', 6),
('What is a useful property of an idempotent API operation?', 'Networking', 'Repeating the same request does not create additional unintended effects', 'It must always return 500', 'It cannot be authenticated', 'It can only use GET', 'a', 'Idempotency is useful for safe retries because repeating an operation has the same intended effect.', 7),
('Why can database indexes improve query performance?', 'Database', 'They can reduce the amount of data that must be scanned for suitable queries', 'They remove the need for transactions', 'They always reduce storage', 'They replace schema design', 'a', 'An appropriate index can reduce scanning for indexed predicates and ordering.', 8),
('What is a common reason to use database transactions?', 'Database', 'To ensure a related set of changes succeeds or fails together', 'To disable concurrency', 'To make every query read-only', 'To replace indexes', 'a', 'Transactions provide atomicity for related database changes.', 9),
('What is a key benefit of modularizing a large Android application?', 'Modularization', 'It can improve ownership boundaries, build isolation and dependency structure', 'It guarantees zero bugs', 'It removes all interfaces', 'It forces one Activity per module', 'a', 'Modules can create clearer boundaries and reduce unnecessary coupling.', 10),
('Which dependency direction is generally preferred in Clean Architecture?', 'Architecture', 'Inner business rules depend on outer UI frameworks', 'Outer layers depend on inner abstractions', 'Every layer depends on every other layer', 'The database owns the domain model', 'b', 'A common Clean Architecture rule is that dependencies point inward toward stable business rules and abstractions.', 11),
('What does a repository abstraction help isolate?', 'Architecture', 'Data-source details from consumers of the data', 'The Android launcher from the manifest', 'Gradle from Kotlin syntax', 'Unit tests from assertions', 'a', 'Repositories can hide whether data comes from network, database or another source.', 12),
('Which approach is most appropriate when diagnosing an intermittent production crash?', 'Debugging', 'Use reproducible logs, crash context and affected versions to narrow the failure', 'Change random code without evidence', 'Disable all error reporting', 'Only inspect the UI color', 'a', 'Production debugging benefits from evidence such as stack traces, versions, device context and reproducibility.', 13),
('Why are deterministic unit tests valuable?', 'Testing', 'They make failures repeatable and easier to diagnose', 'They require production servers for every test', 'They must use real network calls', 'They prevent refactoring', 'a', 'Deterministic tests produce repeatable outcomes, improving diagnosis and maintenance.', 14),
('What is a useful strategy for testing coroutine-based business logic?', 'Testing', 'Use controlled coroutine execution and test dispatchers where appropriate', 'Always sleep for several seconds', 'Require a physical device for every test', 'Disable cancellation', 'a', 'Controlled coroutine execution makes timing and cancellation behavior more predictable in tests.', 15),
('What is backpressure concerned with in reactive streams?', 'Flow', 'Handling differences between production and consumption rates', 'Increasing screen density', 'Changing database schemas', 'Signing APKs', 'a', 'Backpressure concerns what happens when producers can emit faster than consumers can process.', 16),
('Why should cancellation be propagated through coroutine call chains?', 'Advanced Kotlin', 'To avoid work continuing after its owning scope is no longer valid', 'To guarantee every job finishes', 'To disable structured concurrency', 'To keep network calls alive forever', 'a', 'Cancellation propagation prevents obsolete work from continuing after the owning scope is cancelled.', 17),
('Which practice helps reduce memory leaks in Android?', 'Advanced Android', 'Avoid retaining Activity or View references beyond their lifecycle', 'Store every Activity in a singleton', 'Keep every View globally referenced', 'Disable lifecycle callbacks', 'a', 'Long-lived objects should not retain short-lived UI objects unless their lifetime is intentionally managed.', 18),
('What is a production concern when caching network data?', 'Production Android', 'Defining freshness, invalidation and failure behavior', 'Assuming cached data is always correct', 'Never handling stale data', 'Removing all offline behavior', 'a', 'A production cache needs explicit freshness and invalidation rules and should handle failures.', 19),
('What is a practical benefit of separating domain logic from Android framework classes?', 'Production Android', 'More portable and testable business logic', 'It forces all code into Activities', 'It prevents dependency injection', 'It requires XML layouts', 'a', 'Framework-independent domain logic is easier to test and reuse.', 20)
) as v(question_text,category,option_a,option_b,option_c,option_d,correct_option,explanation,sort_order)
where not exists (select 1 from public.l2_assessment_questions q where q.question_text=v.question_text);


create or replace function public.get_l2_assessment_category_results(p_attempt_id uuid)
returns table(category text, correct_answers integer, total_questions integer, score integer)
language sql stable security definer set search_path=public
as $$
  select q.category,
         count(*) filter (where a.selected_option=q.correct_option)::integer as correct_answers,
         count(*)::integer as total_questions,
         round((count(*) filter (where a.selected_option=q.correct_option)::numeric / count(*)::numeric) * 100)::integer as score
  from public.l2_assessment_attempts at
  join public.l2_assessment_answers a on a.attempt_id=at.id
  join public.l2_assessment_questions q on q.id=a.question_id and q.is_active=true
  where at.id=p_attempt_id
    and (at.student_id=auth.uid() or public.has_role(auth.uid(),'admin'::public.app_role))
  group by q.category
  order by score asc, q.category asc;
$$;

revoke all on function public.get_l2_assessment_category_results(uuid) from public, anon;
grant execute on function public.get_l2_assessment_category_results(uuid) to authenticated;
