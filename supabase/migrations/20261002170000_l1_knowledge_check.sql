-- TLH L1 Silver: Android knowledge check
create table if not exists public.l1_assessment_questions (
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
create table if not exists public.l1_assessment_attempts (
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
create table if not exists public.l1_assessment_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.l1_assessment_attempts(id) on delete cascade,
  question_id uuid not null references public.l1_assessment_questions(id) on delete cascade,
  selected_option text check (selected_option in ('a','b','c','d')),
  created_at timestamptz not null default now(),
  unique(attempt_id, question_id)
);
create index if not exists l1_questions_active_order_idx on public.l1_assessment_questions(is_active, sort_order);
create index if not exists l1_attempts_student_idx on public.l1_assessment_attempts(student_id, created_at desc);
create index if not exists l1_answers_attempt_idx on public.l1_assessment_answers(attempt_id);

alter table public.l1_assessment_questions enable row level security;
alter table public.l1_assessment_attempts enable row level security;
alter table public.l1_assessment_answers enable row level security;

drop policy if exists "Eligible students read L1 questions" on public.l1_assessment_questions;
create policy "Eligible students read L1 questions" on public.l1_assessment_questions for select to authenticated
using (is_active and (public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_membership('l1'::public.membership_level)));

drop policy if exists "Admins manage L1 questions" on public.l1_assessment_questions;
create policy "Admins manage L1 questions" on public.l1_assessment_questions for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Students read own L1 attempts" on public.l1_assessment_attempts;
create policy "Students read own L1 attempts" on public.l1_assessment_attempts for select to authenticated
using (student_id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Students create own L1 attempts" on public.l1_assessment_attempts;
create policy "Students create own L1 attempts" on public.l1_assessment_attempts for insert to authenticated
with check (student_id = auth.uid() and public.has_membership('l1'::public.membership_level));

drop policy if exists "Students update own L1 attempts" on public.l1_assessment_attempts;
create policy "Students update own L1 attempts" on public.l1_assessment_attempts for update to authenticated
using (student_id = auth.uid() and status = 'in_progress')
with check (student_id = auth.uid() and status = 'in_progress');

drop policy if exists "Admins manage L1 attempts" on public.l1_assessment_attempts;
create policy "Admins manage L1 attempts" on public.l1_assessment_attempts for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

drop policy if exists "Students read own L1 answers" on public.l1_assessment_answers;
create policy "Students read own L1 answers" on public.l1_assessment_answers for select to authenticated
using (exists (select 1 from public.l1_assessment_attempts a where a.id = attempt_id and (a.student_id = auth.uid() or public.has_role(auth.uid(), 'admin'::public.app_role))));

drop policy if exists "Students write own L1 answers" on public.l1_assessment_answers;
create policy "Students write own L1 answers" on public.l1_assessment_answers for insert to authenticated
with check (exists (select 1 from public.l1_assessment_attempts a where a.id = attempt_id and a.student_id = auth.uid() and a.status = 'in_progress' and public.has_membership('l1'::public.membership_level)));

drop policy if exists "Students update own L1 answers" on public.l1_assessment_answers;
create policy "Students update own L1 answers" on public.l1_assessment_answers for update to authenticated
using (exists (select 1 from public.l1_assessment_attempts a where a.id = attempt_id and a.student_id = auth.uid() and a.status = 'in_progress'))
with check (exists (select 1 from public.l1_assessment_attempts a where a.id = attempt_id and a.student_id = auth.uid() and a.status = 'in_progress'));

drop policy if exists "Admins manage L1 answers" on public.l1_assessment_answers;
create policy "Admins manage L1 answers" on public.l1_assessment_answers for all to authenticated
using (public.has_role(auth.uid(), 'admin'::public.app_role))
with check (public.has_role(auth.uid(), 'admin'::public.app_role));

create or replace function public.submit_l1_assessment(p_attempt_id uuid)
returns public.l1_assessment_attempts
language plpgsql security definer set search_path = public
as $$
declare
  v_attempt public.l1_assessment_attempts;
  v_total integer;
  v_score integer;
begin
  select * into v_attempt from public.l1_assessment_attempts where id = p_attempt_id for update;
  if not found then raise exception 'Assessment attempt not found'; end if;
  if v_attempt.student_id <> auth.uid() and not public.has_role(auth.uid(), 'admin'::public.app_role) then raise exception 'Not authorized'; end if;
  if v_attempt.status = 'submitted' then return v_attempt; end if;

  select count(*) into v_total from public.l1_assessment_questions where is_active = true;
  if v_total = 0 then raise exception 'No active L1 questions are available'; end if;

  select count(*) into v_score
  from public.l1_assessment_answers a
  join public.l1_assessment_questions q on q.id = a.question_id
  where a.attempt_id = p_attempt_id and a.selected_option = q.correct_option and q.is_active = true;

  update public.l1_assessment_attempts
  set status = 'submitted',
      score = round((v_score::numeric / v_total::numeric) * 100),
      total_questions = v_total,
      passed = ((v_score::numeric / v_total::numeric) * 100) >= 40,
      submitted_at = now()
  where id = p_attempt_id
  returning * into v_attempt;
  return v_attempt;
end;
$$;

revoke all on function public.submit_l1_assessment(uuid) from public;
grant execute on function public.submit_l1_assessment(uuid) to authenticated;

insert into public.l1_assessment_questions
(question_text, category, option_a, option_b, option_c, option_d, correct_option, explanation, sort_order)
select * from (values
('Which Kotlin feature is designed to represent a value that may be absent?', 'Kotlin', 'lateinit', 'Nullable types', 'data class', 'sealed class', 'b', 'Nullable types use ? to explicitly model a value that can be null.', 1),
('Which coroutine builder is commonly used when a caller needs the result of a coroutine?', 'Kotlin Coroutines', 'launch', 'async', 'runBlocking only', 'yield', 'b', 'async returns a Deferred whose result can be obtained with await.', 2),
('What does suspend mean on a Kotlin function?', 'Kotlin Coroutines', 'It always runs on the main thread', 'It can pause and resume without blocking the underlying thread', 'It creates a new thread', 'It makes the function synchronous', 'b', 'A suspend function can suspend coroutine execution without blocking the thread.', 3),
('Which Android component is primarily responsible for presenting UI and handling a screen interaction lifecycle?', 'Android Fundamentals', 'Activity', 'BroadcastReceiver', 'ContentProvider', 'Service', 'a', 'An Activity represents a UI entry point and participates in the screen lifecycle.', 4),
('Why is ViewModel used in modern Android architecture?', 'Android Architecture', 'To store UI state across configuration changes', 'To replace every Repository', 'To render XML layouts', 'To access Bluetooth hardware directly', 'a', 'ViewModel helps retain screen-related state across configuration changes.', 5),
('What is the primary purpose of Room?', 'Jetpack', 'HTTP networking', 'Local structured data persistence', 'Image loading', 'Dependency injection', 'b', 'Room provides an abstraction over SQLite for local structured persistence.', 6),
('What does Jetpack Navigation primarily help manage?', 'Jetpack', 'Database migrations', 'Screen destinations and navigation back stack', 'Gradle dependencies', 'APK signing', 'b', 'Navigation provides APIs for destinations, navigation actions and back-stack behavior.', 7),
('What is Retrofit commonly used for?', 'Networking', 'Local database encryption', 'HTTP API communication', 'UI animation', 'Dependency injection', 'b', 'Retrofit is commonly used to define and call HTTP APIs.', 8),
('Which HTTP status code generally means the request succeeded?', 'Networking', '200', '301', '404', '500', 'a', '200 is the standard success response for a typical successful request.', 9),
('What is dependency injection intended to improve?', 'Architecture', 'Hard-coded object creation and coupling', 'XML file size', 'Screen density', 'APK icon resolution', 'a', 'Dependency injection moves dependency creation outside the class and reduces coupling.', 10),
('Which Android principle helps prevent a UI layer from directly owning all business and data logic?', 'Architecture', 'Separation of concerns', 'Single activity only', 'Manual threading', 'Static state everywhere', 'a', 'Separation of concerns keeps responsibilities in appropriate layers.', 11),
('What is the purpose of a Repository in a typical Android architecture?', 'Architecture', 'Act as a single access point for data operations', 'Render every View', 'Replace the Activity lifecycle', 'Compile Kotlin code', 'a', 'A Repository commonly coordinates data sources and exposes data to the rest of the app.', 12),
('Which collection is immutable by default when declared with listOf?', 'Kotlin', 'MutableList', 'List', 'ArrayList only', 'Sequence only', 'b', 'listOf returns a read-only List interface.', 13),
('What does lateinit allow for a non-null Kotlin property?', 'Kotlin', 'Deferring initialization until later', 'Making a property nullable automatically', 'Creating a coroutine', 'Persisting a property in Room', 'a', 'lateinit allows certain non-null mutable properties to be initialized after declaration.', 14),
('What is RecyclerView mainly designed for?', 'Android UI', 'Efficiently displaying scrolling collections of items', 'Running background services', 'Storing key-value data', 'Handling deep links only', 'a', 'RecyclerView efficiently reuses item views for scrolling collections.', 15),
('Why should long-running work generally not run on the Android main thread?', 'Android Fundamentals', 'It can block UI responsiveness', 'It increases screen resolution', 'It disables navigation', 'It prevents compilation', 'a', 'Blocking the main thread can cause an unresponsive UI and poor user experience.', 16),
('Which Jetpack component is commonly used to expose observable UI state?', 'Jetpack', 'LiveData', 'Gradle', 'Manifest', 'APK', 'a', 'LiveData is an observable data holder lifecycle-aware components can observe.', 17),
('What is the purpose of AndroidManifest.xml?', 'Android Fundamentals', 'Declare app components, permissions and app metadata', 'Store Room rows', 'Write Kotlin business logic', 'Host server APIs', 'a', 'The manifest declares components, permissions and other application metadata.', 18),
('Which testing approach verifies a small unit of business logic without requiring the Android framework?', 'Testing', 'Unit test', 'Screenshot test only', 'Manual QA only', 'Production monitoring', 'a', 'Unit tests isolate small pieces of logic and can run without the Android framework.', 19),
('Which statement best describes Clean Architecture?', 'Architecture', 'It separates responsibilities into layers with controlled dependencies', 'It requires Compose', 'It removes all interfaces', 'It means using XML only', 'a', 'Clean Architecture organizes responsibilities and dependency direction to improve maintainability.', 20)
) as v(question_text,category,option_a,option_b,option_c,option_d,correct_option,explanation,sort_order)
where not exists (select 1 from public.l1_assessment_questions q where q.question_text = v.question_text);
