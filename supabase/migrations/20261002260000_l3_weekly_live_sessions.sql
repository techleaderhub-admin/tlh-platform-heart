-- Task 9: Weekly Live Sessions
create table if not exists public.l3_live_sessions (
 id uuid primary key default gen_random_uuid(), title text not null, topic text, session_date timestamptz not null,
 session_link text, membership public.membership_level not null default 'l3', is_active boolean not null default false,
 created_by uuid references public.profiles(id) on delete set null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists l3_live_sessions_date_idx on public.l3_live_sessions(session_date);
create table if not exists public.l3_session_attendance (
 id uuid primary key default gen_random_uuid(), session_id uuid not null references public.l3_live_sessions(id) on delete cascade,
 student_id uuid not null references public.profiles(id) on delete cascade, attended boolean not null default false,
 responded_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(session_id,student_id)
);
create index if not exists l3_session_attendance_student_idx on public.l3_session_attendance(student_id,updated_at desc);
create index if not exists l3_session_attendance_session_idx on public.l3_session_attendance(session_id);
drop trigger if exists l3_live_sessions_updated_at on public.l3_live_sessions;
create trigger l3_live_sessions_updated_at before update on public.l3_live_sessions for each row execute function public.touch_l3_updated_at();
drop trigger if exists l3_session_attendance_updated_at on public.l3_session_attendance;
create trigger l3_session_attendance_updated_at before update on public.l3_session_attendance for each row execute function public.touch_l3_updated_at();
alter table public.l3_live_sessions enable row level security;
alter table public.l3_session_attendance enable row level security;
drop policy if exists l3_live_sessions_student_select on public.l3_live_sessions;
create policy l3_live_sessions_student_select on public.l3_live_sessions for select to authenticated using (is_active and public.has_membership(membership));
drop policy if exists l3_live_sessions_admin_manage on public.l3_live_sessions;
create policy l3_live_sessions_admin_manage on public.l3_live_sessions for all to authenticated using(public.has_role(auth.uid(),'admin'::public.app_role)) with check(public.has_role(auth.uid(),'admin'::public.app_role));
drop policy if exists l3_session_attendance_student_select on public.l3_session_attendance;
create policy l3_session_attendance_student_select on public.l3_session_attendance for select to authenticated using(student_id=auth.uid());
drop policy if exists l3_session_attendance_student_insert on public.l3_session_attendance;
create policy l3_session_attendance_student_insert on public.l3_session_attendance for insert to authenticated with check(student_id=auth.uid() and public.has_membership('l3'::public.membership_level) and exists(select 1 from public.l3_live_sessions s where s.id=session_id and s.is_active));
drop policy if exists l3_session_attendance_student_update on public.l3_session_attendance;
create policy l3_session_attendance_student_update on public.l3_session_attendance for update to authenticated using(student_id=auth.uid()) with check(student_id=auth.uid() and public.has_membership('l3'::public.membership_level));
drop policy if exists l3_session_attendance_admin_select on public.l3_session_attendance;
create policy l3_session_attendance_admin_select on public.l3_session_attendance for select to authenticated using(public.has_role(auth.uid(),'admin'::public.app_role));
drop policy if exists l3_session_attendance_admin_manage on public.l3_session_attendance;
create policy l3_session_attendance_admin_manage on public.l3_session_attendance for all to authenticated using(public.has_role(auth.uid(),'admin'::public.app_role)) with check(public.has_role(auth.uid(),'admin'::public.app_role));
revoke all on public.l3_live_sessions,public.l3_session_attendance from anon;
grant select on public.l3_live_sessions to authenticated;
grant select,insert,update on public.l3_session_attendance to authenticated;
