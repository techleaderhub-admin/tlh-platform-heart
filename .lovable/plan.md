# Step 8: Admin + Student Authentication

## Scope
Build only the authentication entry points and minimal protected destinations:
- `/login` with required email, phone number, and password
- `/signup` with required email, phone number, and password
- `/dashboard` as a student-only placeholder
- `/admin` as an admin-only placeholder
- `/` redirects users according to their current session and role

No full dashboards, learning, coaching, payments, TagMango changes, or unrelated modules will be added.

## Implementation
1. Apply the TLH visual system globally using semantic tokens, Manrope headings, and Inter UI text.
2. Add reusable authentication validation and role-loading modules.
3. Implement signup through the existing account system with email/password, passing the normalized phone into signup metadata and securely storing it in the existing `profiles.phone` field through the current new-user trigger architecture.
4. Implement login in this order:
   - require and validate all three fields;
   - authenticate email/password;
   - read the authenticated user's own profile and role under existing row security;
   - compare normalized supplied phone with `profiles.phone`;
   - immediately sign out and show one generic authentication error when profile, phone, or role verification fails;
   - route `student` to `/dashboard` and `admin` to `/admin`.
5. Use the integration-managed protected route layout for session enforcement, plus role-specific guards that verify the current user and database role before rendering either placeholder.
6. Add clean session initialization, confirmation-needed signup state, expired-session handling, and logout that clears cached protected data before returning to `/login`.
7. Enable email/password authentication in the connected backend. No social, OTP, magic-link, or passwordless flow will be added.

## Security and data handling
- Passwords remain exclusively in the managed authentication system and are never stored or compared in application tables.
- Profile and role reads use the signed-in user's session and existing row-security policies.
- No service credential is exposed to the browser, and no row-security policy is weakened.
- Email uniqueness remains enforced by the authentication system.
- Phone input will be normalized consistently. Because the current schema has no unique constraint on `profiles.phone`, duplicate-phone prevention can only be best-effort without changing the schema; this implementation will not claim database-level uniqueness or expose whether another phone is registered.

## Verification
- Confirm `/login` and `/signup` require all three fields and reject invalid input.
- Confirm unauthenticated access to `/dashboard` and `/admin` returns to `/login`.
- Confirm wrong-phone login is denied and the new session is cleared.
- Confirm student/admin routing and cross-role denial with available test accounts.
- Check desktop and mobile layouts, browser errors, and the final build status.
