-- Student profile and interview recording improvements.
-- LinkedIn is stored on the student profile.
-- Interview application URL is optional and independent of the job application system.

alter table public.profiles
  add column if not exists linkedin_url text;

alter table public.interviews
  add column if not exists job_application_url text;

alter table public.profiles
  drop constraint if exists profiles_linkedin_url_format;

alter table public.profiles
  add constraint profiles_linkedin_url_format
  check (
    linkedin_url is null
    or linkedin_url ~* '^https?://([a-z0-9-]+\.)?linkedin\.com/.*$'
  );

alter table public.interviews
  drop constraint if exists interviews_job_application_url_format;

alter table public.interviews
  add constraint interviews_job_application_url_format
  check (
    job_application_url is null
    or job_application_url ~* '^https?://.*$'
  );
