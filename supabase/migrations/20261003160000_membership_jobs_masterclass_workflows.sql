-- TLH job visibility and lifecycle controls.
-- All authenticated Leaders can browse the common job board.
-- Each job can require a minimum membership. Applications respect the same requirement.

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS minimum_membership public.membership_level NOT NULL DEFAULT 'free';

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published';

ALTER TABLE public.jobs
  DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
  ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('draft', 'published', 'archived'));

UPDATE public.jobs
SET minimum_membership = 'free'
WHERE minimum_membership IS NULL;

UPDATE public.jobs
SET status = 'published'
WHERE status IS NULL;

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Jobs L1 students read" ON public.jobs;
DROP POLICY IF EXISTS "jobs_authenticated_select" ON public.jobs;
DROP POLICY IF EXISTS "Jobs all leaders read" ON public.jobs;

CREATE POLICY "Jobs all leaders read"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  status = 'published'
);

DROP POLICY IF EXISTS "Students create own applications" ON public.job_applications;
DROP POLICY IF EXISTS "Students update own applications" ON public.job_applications;

CREATE POLICY "Students create own applications"
ON public.job_applications
FOR INSERT
TO authenticated
WITH CHECK (
  student_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.id = job_id
      AND j.status = 'published'
      AND public.has_membership(j.minimum_membership)
  )
);

CREATE POLICY "Students update own applications"
ON public.job_applications
FOR UPDATE
TO authenticated
USING (student_id = auth.uid())
WITH CHECK (
  student_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.jobs j
    WHERE j.id = job_id
      AND j.status = 'published'
      AND public.has_membership(j.minimum_membership)
  )
);

CREATE INDEX IF NOT EXISTS jobs_status_minimum_membership_idx
  ON public.jobs (status, minimum_membership, created_at DESC);
