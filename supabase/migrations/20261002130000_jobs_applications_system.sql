-- Jobs + applications system hardening.
-- Reuses the existing jobs, job_applications and interviews schema.

create unique index if not exists job_applications_student_job_unique
  on public.job_applications (student_id, job_id);

alter table public.jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.interviews enable row level security;

drop policy if exists "jobs_authenticated_select" on public.jobs;
drop policy if exists "jobs_admin_manage" on public.jobs;
drop policy if exists "Jobs L1 students read" on public.jobs;
drop policy if exists "Admins manage jobs" on public.jobs;

drop policy if exists "applications_owner" on public.job_applications;
drop policy if exists "Students read own applications" on public.job_applications;
drop policy if exists "Students create own applications" on public.job_applications;
drop policy if exists "Students update own applications" on public.job_applications;
drop policy if exists "Students delete own applications" on public.job_applications;
drop policy if exists "Admins manage applications" on public.job_applications;

drop policy if exists "Students read own interviews" on public.interviews;
drop policy if exists "Students create own interviews" on public.interviews;
drop policy if exists "Students update own interviews" on public.interviews;
drop policy if exists "Students delete own interviews" on public.interviews;
drop policy if exists "Admins manage interviews" on public.interviews;

create policy "Jobs L1 students read"
on public.jobs for select
to authenticated
using (
  public.has_membership('l1'::public.membership_level)
  or public.has_role(auth.uid(),'admin'::public.app_role)
);

create policy "Admins manage jobs"
on public.jobs for all
to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

create policy "Students read own applications"
on public.job_applications for select
to authenticated
using (
  student_id = auth.uid()
  or public.has_role(auth.uid(),'admin'::public.app_role)
);

create policy "Students create own applications"
on public.job_applications for insert
to authenticated
with check (
  student_id = auth.uid()
  and public.has_membership('l1'::public.membership_level)
);

create policy "Students update own applications"
on public.job_applications for update
to authenticated
using (student_id = auth.uid())
with check (
  student_id = auth.uid()
  and public.has_membership('l1'::public.membership_level)
);

create policy "Students delete own applications"
on public.job_applications for delete
to authenticated
using (student_id = auth.uid());

create policy "Admins manage applications"
on public.job_applications for all
to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));

-- Interviews can be associated with an application only when the application
-- belongs to the same student. This keeps the existing interview/question flow
-- connected to the new application tracker without exposing another student's data.
create policy "Students read own interviews"
on public.interviews for select
to authenticated
using (
  student_id = auth.uid()
  or public.has_role(auth.uid(),'admin'::public.app_role)
);

create policy "Students create own interviews"
on public.interviews for insert
to authenticated
with check (
  student_id = auth.uid()
  and public.has_membership('l1'::public.membership_level)
  and (
    job_application_id is null
    or exists (
      select 1
      from public.job_applications a
      where a.id = job_application_id
        and a.student_id = auth.uid()
    )
  )
);

create policy "Students update own interviews"
on public.interviews for update
to authenticated
using (student_id = auth.uid())
with check (
  student_id = auth.uid()
  and (
    job_application_id is null
    or exists (
      select 1
      from public.job_applications a
      where a.id = job_application_id
        and a.student_id = auth.uid()
    )
  )
);

create policy "Students delete own interviews"
on public.interviews for delete
to authenticated
using (student_id = auth.uid());

create policy "Admins manage interviews"
on public.interviews for all
to authenticated
using (public.has_role(auth.uid(),'admin'::public.app_role))
with check (public.has_role(auth.uid(),'admin'::public.app_role));
