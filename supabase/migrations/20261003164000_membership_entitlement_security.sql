-- Enforce the current membership entitlements at the database boundary.
-- UI route guards are helpful UX; these checks protect direct RPC access too.

CREATE OR REPLACE FUNCTION public.submit_career_assessment(p_answers jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_questions jsonb := '{
    "architecture-1": "Architecture", "architecture-2": "Architecture", "architecture-3": "Architecture",
    "kotlin-1": "Kotlin & Concurrency", "kotlin-2": "Kotlin & Concurrency", "kotlin-3": "Kotlin & Concurrency",
    "system-1": "Mobile System Design", "system-2": "Mobile System Design", "system-3": "Mobile System Design",
    "leadership-1": "Leadership", "leadership-2": "Leadership", "leadership-3": "Leadership"
  }'::jsonb;
  v_categories text[] := array['Architecture', 'Kotlin & Concurrency', 'Mobile System Design', 'Leadership'];
  v_key text;
  v_value int;
  v_category text;
  v_score int;
  v_scores jsonb := '{}'::jsonb;
  v_strengths text[] := '{}';
  v_gaps text[] := '{}';
  v_recommendations text[] := '{}';
  v_total int := 0;
  v_overall int;
  v_assessment public.career_assessments%rowtype;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING errcode = '42501';
  END IF;

  IF NOT public.has_membership('l1'::public.membership_level) THEN
    RAISE EXCEPTION 'Career Assessment requires Silver membership.' USING errcode = '42501';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = v_user AND (is_blocked OR deleted_at IS NOT NULL)
  ) THEN
    RAISE EXCEPTION 'This account cannot submit assessments.' USING errcode = '42501';
  END IF;

  IF p_answers IS NULL OR jsonb_typeof(p_answers) <> 'object' THEN
    RAISE EXCEPTION 'Answers are required.';
  END IF;

  FOR v_key IN SELECT jsonb_object_keys(v_questions) LOOP
    IF NOT (p_answers ? v_key) OR jsonb_typeof(p_answers -> v_key) <> 'number' THEN
      RAISE EXCEPTION 'Please answer every question.';
    END IF;
    v_value := (p_answers ->> v_key)::numeric;
    IF v_value < 1 OR v_value > 5 OR (p_answers ->> v_key)::numeric <> v_value THEN
      RAISE EXCEPTION 'Answers must be whole numbers from 1 to 5.';
    END IF;
  END LOOP;

  IF (SELECT count(*) FROM jsonb_object_keys(p_answers)) <> (SELECT count(*) FROM jsonb_object_keys(v_questions)) THEN
    RAISE EXCEPTION 'Unexpected answers were submitted.';
  END IF;

  FOREACH v_category IN ARRAY v_categories LOOP
    SELECT round(sum((p_answers ->> q.key)::int) * 100.0 / (count(*) * 5))::int
      INTO v_score
      FROM jsonb_each_text(v_questions) q
     WHERE q.value = v_category;
    v_scores := v_scores || jsonb_build_object(v_category, v_score);
    v_total := v_total + v_score;
    IF v_score >= 70 THEN v_strengths := v_strengths || v_category; END IF;
    IF v_score < 60 THEN v_gaps := v_gaps || v_category; END IF;
    v_recommendations := v_recommendations || CASE
      WHEN v_score < 60 THEN 'Prioritize a focused ' || v_category || ' practice cycle and review measurable examples from production work.'
      WHEN v_score < 80 THEN 'Strengthen ' || v_category || ' with deeper design exercises, implementation practice and interview-style explanation.'
      ELSE 'Maintain ' || v_category || ' through advanced design reviews, mentoring and increasingly complex production problems.'
    END;
  END LOOP;

  v_overall := round(v_total / 4.0);

  INSERT INTO public.career_assessments (student_id, assessment_type, score, strengths, gaps, recommendations)
  VALUES (
    v_user,
    'tlh-career-readiness-v1',
    v_overall,
    jsonb_build_object('categories', to_jsonb(v_strengths), 'scores', v_scores),
    jsonb_build_object('categories', to_jsonb(v_gaps), 'scores', v_scores),
    jsonb_build_object('items', to_jsonb(v_recommendations), 'answers', p_answers)
  )
  RETURNING * INTO v_assessment;

  INSERT INTO public.career_skill_gaps (student_id, assessment_id, domain, score, status, recommendation, last_assessed_at)
  SELECT
    v_user,
    v_assessment.id,
    c.category,
    (v_scores ->> c.category)::int,
    CASE
      WHEN (v_scores ->> c.category)::int < 60 THEN 'open'
      WHEN (v_scores ->> c.category)::int < 80 THEN 'developing'
      ELSE 'strength'
    END,
    v_recommendations[c.ord],
    v_assessment.created_at
  FROM unnest(v_categories) WITH ORDINALITY AS c(category, ord)
  ON CONFLICT (student_id, domain) DO UPDATE
    SET assessment_id = excluded.assessment_id,
        score = excluded.score,
        status = excluded.status,
        recommendation = excluded.recommendation,
        last_assessed_at = excluded.last_assessed_at;

  RETURN jsonb_build_object(
    'id', v_assessment.id,
    'score', v_assessment.score,
    'created_at', v_assessment.created_at
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_career_os()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_roadmap public.career_roadmaps%rowtype;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Authentication required.' USING errcode = '42501';
  END IF;

  IF NOT public.has_membership('l3'::public.membership_level) THEN
    RAISE EXCEPTION 'Career OS requires Diamond membership.' USING errcode = '42501';
  END IF;

  SELECT *
  INTO v_roadmap
  FROM public.career_roadmaps
  WHERE student_id = v_user
  ORDER BY updated_at DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'profile', (SELECT to_jsonb(cp) FROM public.career_profiles cp WHERE cp.student_id = v_user),
    'skill_gaps', COALESCE(
      (SELECT jsonb_agg(to_jsonb(sg) ORDER BY sg.domain) FROM public.career_skill_gaps sg WHERE sg.student_id = v_user),
      '[]'::jsonb
    ),
    'roadmap', CASE WHEN v_roadmap.id IS NULL THEN NULL ELSE to_jsonb(v_roadmap) END,
    'items', COALESCE(
      (SELECT jsonb_agg(to_jsonb(ri) ORDER BY ri.sort_order, ri.created_at)
       FROM public.roadmap_items ri
       WHERE ri.roadmap_id = v_roadmap.id),
      '[]'::jsonb
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_my_roadmap_item_status(
  p_item_id uuid,
  p_status text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_membership('l3'::public.membership_level) THEN
    RAISE EXCEPTION 'Career OS requires Diamond membership.' USING errcode = '42501';
  END IF;

  IF p_status NOT IN ('not_started','in_progress','completed','blocked') THEN
    RAISE EXCEPTION 'Invalid roadmap status';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.roadmap_items ri
    JOIN public.career_roadmaps cr ON cr.id = ri.roadmap_id
    WHERE ri.id = p_item_id
      AND cr.student_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Roadmap item not found';
  END IF;

  UPDATE public.roadmap_items
  SET status = p_status,
      completed_at = CASE WHEN p_status = 'completed' THEN now() ELSE NULL END,
      updated_at = now()
  WHERE id = p_item_id;

  RETURN true;
END;
$$;
