-- Simple job postings, with Leader submission + admin approval.
--
-- Job Title, Company Name and the posting Link are now all optional (a post just
-- needs at least one of them). Admin can still publish a job directly. A Leader can
-- also submit a job, but it is saved as 'pending' and stays invisible to other
-- Leaders until an admin approves it (status -> 'published') or rejects it.
-- "Published in the last 7 days" is measured from published_at, which is stamped
-- the moment a job becomes published (direct admin post, or admin approval of a
-- Leader's submission) rather than when it was first created or submitted.

alter table public.jobs alter column job_title drop not null;
alter table public.jobs alter column company_name drop not null;

alter table public.jobs
  add column if not exists created_by uuid references public.profiles(id) on delete set null,
  add column if not exists published_at timestamptz;

update public.jobs
set published_at = created_at
where status = 'published' and published_at is null;

alter table public.jobs drop constraint if exists jobs_status_check;
alter table public.jobs
  add constraint jobs_status_check
  check (status in ('draft', 'pending', 'published', 'archived', 'rejected'));

-- A post must say at least one of title, company or link; it can't be entirely empty.
alter table public.jobs drop constraint if exists jobs_has_some_content;
alter table public.jobs
  add constraint jobs_has_some_content
  check (job_title is not null or company_name is not null or job_url is not null);

create or replace function public.stamp_job_published_at()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' and (tg_op = 'insert' or old.status is distinct from 'published') then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists jobs_stamp_published_at on public.jobs;
create trigger jobs_stamp_published_at
before insert or update on public.jobs
for each row execute function public.stamp_job_published_at();

create index if not exists jobs_published_at_idx on public.jobs (published_at desc);
create index if not exists jobs_created_by_idx on public.jobs (created_by);

-- Leaders can submit a job for review. It must start as 'pending' and be
-- attributed to them; only an admin (existing "Admins manage jobs" policy) can
-- later move it to 'published' or 'rejected'.
drop policy if exists "Leaders submit jobs for review" on public.jobs;
create policy "Leaders submit jobs for review"
on public.jobs for insert
to authenticated
with check (
  created_by = auth.uid()
  and status = 'pending'
  and not public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- A Leader can see their own submission regardless of its review status
-- (pending/published/rejected), in addition to every published job.
drop policy if exists "Leaders read own submissions" on public.jobs;
create policy "Leaders read own submissions"
on public.jobs for select
to authenticated
using (created_by = auth.uid());
