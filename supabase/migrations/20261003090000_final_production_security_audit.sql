-- Final production security audit hardening.
-- Prevent anonymous callers from invoking the L1 category-results RPC.
-- The function already enforces ownership/admin access, but auth.uid() is NULL
-- for anonymous requests; execution must therefore be restricted at the privilege layer.
revoke all on function public.get_l1_assessment_category_results(uuid) from public, anon;
grant execute on function public.get_l1_assessment_category_results(uuid) to authenticated;
