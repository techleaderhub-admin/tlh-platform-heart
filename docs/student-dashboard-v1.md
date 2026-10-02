# Student Dashboard V1

## Purpose

The student dashboard is the entry point for the TLH V1 student journey.

It intentionally avoids the previously planned complex Career OS / 9-stage roadmap. The dashboard focuses on:

1. Current membership
2. Current journey stage
3. One next action
4. Current learning/checkpoint progress
5. Weekly focus
6. Interview experience recording

## Membership-driven behavior

- Free/L0: foundation reading
- L1 Silver: L1 learning -> assignments -> L1 knowledge check
- L2: L2 knowledge check placeholder until the L2 engine is implemented
- L3: career-track placeholder until course/live-session systems are implemented

The dashboard does not automatically upgrade membership.

## Data sources

The dashboard reuses existing TLH tables:

- student_memberships
- career_profiles
- foundation_resources
- student_resource_progress
- l1_courses
- l1_course_modules
- l1_course_lessons
- student_lesson_progress
- l1_assignments
- l1_assignment_submissions
- l1_assessment_attempts
- interviews

No new database table is required for this task.

## Navigation

The student shell keeps the primary navigation intentionally small:

- Journey
- Profile
- Interview Questions

Jobs remain available in their existing routes but are removed from the primary V1 journey navigation because Jobs & Applications is a later-priority expansion in the revised plan.

## Design principle

The dashboard should answer one question immediately:

> What should I do next?

It should not present a complex career analytics or roadmap system.
