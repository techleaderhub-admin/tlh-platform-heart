# TLH Final Production Security Audit

Date: 2026-10-03

## Scope

This audit covers the security controls represented in the repository current main codebase and the final hardening migration added by this audit.

## Verified controls

- RLS is enabled on the application tables introduced by the TLH platform migrations.
- Student-owned records use auth.uid() ownership checks.
- Admin operations use the admin application role.
- Membership-gated resources use the membership hierarchy/RPCs.
- L1 and L2 assessment answer keys are not returned by the student question RPCs.
- L1/L2 assessment submission and category-result RPCs perform server-side authorization.
- Interview records and interview questions are isolated by student ownership; the admin role can operate the central question bank.
- Payment event ingestion is not exposed to client roles after the production-hardening migration.
- Payment membership automation runs from the payment table trigger rather than a client-callable RPC.
- Similar-question search is authenticated and membership-gated.
- Public blog search is intentionally available to anonymous users; admin write access remains role-gated.
- Trigger-only functions are not application APIs after the final hardening migration.

## Finding fixed by this audit

### L1 category-results RPC execution exposure

get_l1_assessment_category_results(uuid) checked the requested attempt owner/admin role internally, but its migration only granted authenticated without first revoking the default PUBLIC execution privilege.

Because auth.uid() is NULL for anonymous requests, authorization code that relies on auth.uid() must be paired with an execution grant that excludes anonymous callers.

The final migration now revokes execution from public and anon, and grants execution only to authenticated.

### Trigger-only RPC surface

The final migration also revokes direct execution from trigger-only functions:

- handle_new_user()
- prepare_blog_post()
- touch_updated_at()
- touch_l3_updated_at()
- touch_student_l3_progress_updated_at()

These remain attached to their database triggers and are not intended as Data API functions.

## Remaining production verification

Repository review cannot inspect the live Supabase project's effective privileges, exposed schemas, authentication configuration, storage policies, or current Security Advisor state.

Before declaring the deployed database production-certified, run Supabase Security Advisor against the live project and verify that no unexpected warning/error remains. Supabase specifically recommends checking RLS on every exposed table and reviewing SECURITY DEFINER function execution privileges.

## Result

Repository security hardening: complete.

Live Supabase production certification: environment verification required.

No application UI redesign or feature scope was changed by this audit.
