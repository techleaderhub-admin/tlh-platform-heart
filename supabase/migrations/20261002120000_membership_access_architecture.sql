-- TLH membership and access architecture
-- Levels are ordered from least to most access: free < l0 < l1 < l2 < l3 < l4.
-- Admin remains a separate role in public.user_roles.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_level') THEN
    CREATE TYPE public.membership_level AS ENUM ('free', 'l0', 'l1', 'l2', 'l3', 'l4');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.student_memberships (
  student_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  level public.membership_level NOT NULL DEFAULT 'free',
  is_active boolean NOT NULL DEFAULT true,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  note text
);

CREATE TABLE IF NOT EXISTS public.membership_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_level public.membership_level,
  to_level public.membership_level NOT NULL,
  changed_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.membership_level_rank(level_value public.membership_level)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE level_value
    WHEN 'free' THEN 0
    WHEN 'l0' THEN 1
    WHEN 'l1' THEN 2
    WHEN 'l2' THEN 3
    WHEN 'l3' THEN 4
    WHEN 'l4' THEN 5
  END
$$;

CREATE OR REPLACE FUNCTION public.get_my_membership_level()
RETURNS public.membership_level
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT sm.level
      FROM public.student_memberships sm
      WHERE sm.student_id = auth.uid()
        AND sm.is_active = true
    ),
    'free'::public.membership_level
  )
$$;

CREATE OR REPLACE FUNCTION public.has_membership(minimum_level public.membership_level)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT has_role(auth.uid(), 'admin'::public.app_role)
      OR membership_level_rank(get_my_membership_level()) >= membership_level_rank(minimum_level)
$$;

ALTER TABLE public.student_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "membership_self_select" ON public.student_memberships;
CREATE POLICY "membership_self_select"
ON public.student_memberships
FOR SELECT
TO public
USING (
  student_id = auth.uid()
  OR has_role(auth.uid(), 'admin'::public.app_role)
);

DROP POLICY IF EXISTS "membership_admin_manage" ON public.student_memberships;
CREATE POLICY "membership_admin_manage"
ON public.student_memberships
FOR ALL
TO public
USING (has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "membership_history_admin_select" ON public.membership_history;
CREATE POLICY "membership_history_admin_select"
ON public.membership_history
FOR SELECT
TO public
USING (has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "membership_history_self_select" ON public.membership_history;
CREATE POLICY "membership_history_self_select"
ON public.membership_history
FOR SELECT
TO public
USING (student_id = auth.uid());

CREATE OR REPLACE FUNCTION public.touch_student_membership()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS student_memberships_updated_at ON public.student_memberships;
CREATE TRIGGER student_memberships_updated_at
BEFORE UPDATE ON public.student_memberships
FOR EACH ROW
EXECUTE FUNCTION public.touch_student_membership();

CREATE OR REPLACE FUNCTION public.ensure_free_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.student_memberships (student_id, level)
  VALUES (NEW.id, 'free'::public.membership_level)
  ON CONFLICT (student_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_default_membership ON public.profiles;
CREATE TRIGGER profiles_default_membership
AFTER INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_free_membership();

INSERT INTO public.student_memberships (student_id, level)
SELECT p.id, 'free'::public.membership_level
FROM public.profiles p
ON CONFLICT (student_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.record_membership_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.level IS DISTINCT FROM NEW.level THEN
    INSERT INTO public.membership_history (
      student_id, from_level, to_level, changed_by, reason
    )
    VALUES (
      NEW.student_id,
      OLD.level,
      NEW.level,
      COALESCE(auth.uid(), NEW.assigned_by),
      NEW.note
    );
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.membership_history (
      student_id, from_level, to_level, changed_by, reason
    )
    VALUES (
      NEW.student_id,
      NULL,
      NEW.level,
      COALESCE(auth.uid(), NEW.assigned_by),
      NEW.note
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS student_membership_history ON public.student_memberships;
CREATE TRIGGER student_membership_history
AFTER INSERT OR UPDATE OF level ON public.student_memberships
FOR EACH ROW
EXECUTE FUNCTION public.record_membership_change();
