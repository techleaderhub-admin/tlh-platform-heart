# Admin 360

Admin 360 is the central operational student workspace.

## Student snapshot
For each student, admins can inspect:
- membership level
- profile and contact basics
- career profile and target role
- career skill gaps
- career roadmaps and milestone progress
- L1 assessment attempts
- assignment submissions
- interview experiences
- job applications
- payment records

## Access
Route: `/admin/admin-360`.

The page reuses existing tables and existing admin RLS. It does not create duplicate student data structures or generate outcomes automatically.

## Data safety
No student data is seeded or modified by Admin 360. It is a read-oriented operational view; existing dedicated admin pages remain responsible for editing membership, Career OS, applications, jobs, interviews and learning records.
