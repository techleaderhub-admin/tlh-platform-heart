# Jobs & Applications System

## Purpose

The TLH Jobs & Applications system connects verified admin-published jobs to each student's application tracker and the existing interview/question workflow.

## Student flow

1. L1+ student opens **Jobs**.
2. Student searches the admin-published job board.
3. Student selects a job to view its company, role, location, employment type, source and external posting URL.
4. Student can save a role or mark it as applied.
5. Student can maintain application status and preparation notes in **My Applications**.
6. When an interview happens, the existing Interview Questions workspace can link the interview to the relevant application.
7. Linked interviews continue into the existing interview-question and central question-bank workflow.

## Admin flow

- **Jobs**: publish, edit and delete job records.
- **Applications**: central view of all student applications with search, status filters, status updates, notes and linked-interview counts.
- **Interview Bank**: remains the central place for the actual interview questions submitted by students.

## Existing database reused

- jobs
- job_applications
- interviews
- interview_questions
- question_bank

No duplicate job or application tables were created.

## Application statuses

The existing application_status enum is used:

- saved
- applied
- screening
- interview
- offer
- rejected
- withdrawn

## Access control

- Jobs are readable by L1+ students and admins.
- Students can create/read/update/delete only their own applications.
- Application creation/update requires L1+ membership.
- Admins can manage all jobs and applications.
- A student can associate an interview with an application only when that application belongs to the same student.
- A unique (student_id, job_id) index prevents duplicate application records for the same student/job pair.

## Important data rule

No real job listings were invented or seeded. Admins must publish the verified opportunities that should appear in the student job board.
