# TLH Membership & Access Architecture

## Levels

- **Free** — default for every new signup; lead/limited-access user.
- **L0** — entry paid membership.
- **L1** — membership level 1.
- **L2** — membership level 2.
- **L3** — membership level 3.
- **L4** — highest membership level.
- **Admin** — platform role; not a membership level.

## Rules

1. Signup creates an authenticated user with the **Free** membership.
2. Authentication alone never grants L0-L4 access.
3. Admin controls the current membership level during the manual-approval phase.
4. A user's membership can move up or down (for example L3 → L1).
5. Membership access is hierarchical: a member at L3 can access resources protected at Free, L0, L1, L2, and L3, subject to any resource-specific rules.
6. Admin access is independent of membership and bypasses membership thresholds.
7. Payment automation can later assign the appropriate level; it must not replace the membership/permission model.
8. Membership changes are recorded in membership_history for auditability.

## Database model

- user_roles controls **Admin vs Student** platform role.
- student_memberships stores the student's current membership level and status.
- membership_history records level changes.
- membership_level is the allowed set: free, l0, l1, l2, l3, l4.

## Access helpers

- get_my_membership_level() returns the current active level, defaulting to Free.
- has_membership(minimum_level) returns true when the signed-in user meets the required level or is an admin.

## Future use

Every protected platform resource should declare its minimum membership level rather than hard-coding access checks in individual pages. This keeps Student Dashboard, interview workflows, programs, resources, and future payment automation on one access model.