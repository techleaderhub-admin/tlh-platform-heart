# TLH L1 Silver Learning System

## Purpose
L1 Silver is the video-learning stage of the TLH journey. The system supports a published course, ordered modules, video/reading lessons, lesson progress, practical assignments, student submissions and admin review.

## Student flow
1. L1+ membership unlocks the L1 learning page.
2. Student opens the published course.
3. Student works through active modules and lessons.
4. Student marks lessons complete; progress is stored per student.
5. Student submits required assignments as text and/or a URL.
6. Student sees submission/review status and admin feedback.
7. Overall completion is calculated from completed published lessons plus submitted required assignments.
8. Membership level is not automatically changed by learning progress.

## Admin flow
Admin -> L1 Learning is the central workspace for:
- creating and publishing courses
- creating and activating modules
- adding and publishing lessons
- adding and publishing required assignments
- reviewing every student assignment submission

Content is private until explicitly published. No real video URLs or course content are invented by the platform.

## Database
- l1_courses
- l1_course_modules
- l1_course_lessons
- student_lesson_progress
- l1_assignments
- l1_assignment_submissions

RLS restricts student content access to L1+ membership and isolates student progress/submissions. Admins can manage content and review submissions.

## Scope note
Jetpack Compose is not added to L1 content by this implementation. Actual course videos, lesson copy and assignment content should be authored/published by the admin.
