-- Final production security audit hardening.
--
-- 1) The L1 category-results RPC is authenticated/owner checked internally,
--    but anonymous callers have auth.uid() = NULL. Restrict EXECUTE at the
--    database privilege layer so the function is not an anonymous API.
revoke all on function public.get_l1_assessment_category_results(uuid) from public, anon;
grant execute on function public.get_l1_assessment_category_results(uuid) to authenticated;

-- 2) Trigger-only functions are not application RPC APIs. Remove direct
--    execution privileges from exposed roles. Triggers continue to invoke
--    these functions through their configured triggers.
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.prepare_blog_post() from public, anon, authenticated;
revoke all on function public.touch_updated_at() from public, anon, authenticated;
revoke all on function public.touch_l3_updated_at() from public, anon, authenticated;
revoke all on function public.touch_student_l3_progress_updated_at() from public, anon, authenticated;
