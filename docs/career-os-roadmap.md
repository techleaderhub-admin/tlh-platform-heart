# Career OS / Personalized Career Roadmap

## Purpose
Career OS connects the existing career profile, career skill-gap snapshot, and existing career roadmap tables into one student workflow.

## Student
Route: `/dashboard/career-os`

Students can:
- review target role, career goal, experience, compensation and locations from `career_profiles`;
- see the latest `career_skill_gaps` snapshot;
- view the current roadmap and milestones from `career_roadmaps` and `roadmap_items`;
- mark a milestone completed or move a completed milestone back to in-progress.

Roadmap creation remains an admin responsibility. No job, salary or hiring outcome is generated automatically.

## Admin
Route: `/admin/career-os`

Admins can:
- see students and their target roles;
- create a roadmap for a student;
- set a description and target date;
- add concrete roadmap milestones;
- maintain milestone status.

## Security
- Student roadmap reads use `get_my_career_os()`, which is scoped to `auth.uid()`.
- Student milestone status changes use `update_my_roadmap_item_status()`, which verifies ownership.
- Admin roadmap/item policies are added only when the named policies do not already exist.
- Existing career profile and skill-gap RLS remains the source of truth for those tables.

## No invented data
This feature does not seed roadmaps, milestones, student profiles, jobs or outcomes.
