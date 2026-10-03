-- Private Leader resume storage.
-- career_profiles.resume_url stores the private storage object path for new uploads.
-- Existing external URLs remain untouched.

INSERT INTO storage.buckets (id, name, public)
VALUES ('leader-resumes', 'leader-resumes', false)
ON CONFLICT (id) DO UPDATE SET public = false;

DROP POLICY IF EXISTS "Leader resumes owner select" ON storage.objects;
CREATE POLICY "Leader resumes owner select"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'leader-resumes'
  AND (
    owner_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Leader resumes owner insert" ON storage.objects;
CREATE POLICY "Leader resumes owner insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'leader-resumes'
  AND owner_id = auth.uid()
);

DROP POLICY IF EXISTS "Leader resumes owner update" ON storage.objects;
CREATE POLICY "Leader resumes owner update"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'leader-resumes'
  AND (
    owner_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::public.app_role)
  )
)
WITH CHECK (
  bucket_id = 'leader-resumes'
  AND (
    owner_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::public.app_role)
  )
);

DROP POLICY IF EXISTS "Leader resumes owner delete" ON storage.objects;
CREATE POLICY "Leader resumes owner delete"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'leader-resumes'
  AND (
    owner_id = auth.uid()
    OR public.has_role(auth.uid(),'admin'::public.app_role)
  )
);
