-- Zoom-based Masterclass attendance and conversion tracking.
-- Attendance is manual for now; the schema is ready for a future Zoom sync.

ALTER TABLE public.masterclass_registrations
  ADD COLUMN IF NOT EXISTS attendance_status text NOT NULL DEFAULT 'registered';

ALTER TABLE public.masterclass_registrations
  ADD COLUMN IF NOT EXISTS attendance_marked_at timestamptz;

ALTER TABLE public.masterclass_registrations
  ADD COLUMN IF NOT EXISTS conversion_status text NOT NULL DEFAULT 'none';

ALTER TABLE public.masterclass_registrations
  ADD COLUMN IF NOT EXISTS conversion_notes text;

ALTER TABLE public.masterclass_registrations
  DROP CONSTRAINT IF EXISTS masterclass_attendance_status_check;

ALTER TABLE public.masterclass_registrations
  ADD CONSTRAINT masterclass_attendance_status_check
  CHECK (attendance_status IN ('registered', 'attended', 'no_show'));

ALTER TABLE public.masterclass_registrations
  DROP CONSTRAINT IF EXISTS masterclass_conversion_status_check;

ALTER TABLE public.masterclass_registrations
  ADD CONSTRAINT masterclass_conversion_status_check
  CHECK (conversion_status IN ('none', 'follow_up', 'converted'));

ALTER TABLE public.masterclass_registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Masterclass admins update attendance" ON public.masterclass_registrations;
CREATE POLICY "Masterclass admins update attendance"
ON public.masterclass_registrations
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(),'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(),'admin'::public.app_role));

CREATE INDEX IF NOT EXISTS masterclass_registrations_attendance_idx
  ON public.masterclass_registrations (attendance_status, created_at DESC);
