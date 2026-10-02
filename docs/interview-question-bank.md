# Interview Question Bank

## Existing TLH architecture
The repository already contains:
- `interviews`: one interview experience per student/job context
- `interview_questions`: ordered questions recorded against an interview
- `question_bank`: admin-curated reusable question bank

This task builds the missing student/admin workflow on top of those tables rather than creating a duplicate question table.

## Student flow
1. L1+ student opens Interview Experience & Question Bank.
2. Student records company, role, interview type/round and notes.
3. Student adds questions in the order they remember them.
4. Student can study active questions already curated by admin.
5. The student record stays connected to the source interview.

## Admin flow
Admin -> Interview Bank is the central place to:
- see interview experiences from all students
- search by student, company, role, round, category or question
- see every submitted interview question
- see whether a question has already been curated
- promote a submitted question into the shared `question_bank`
- add admin notes to the interview experience

## Access
- Students can manage only their own interview experiences/questions.
- L1+ membership is required to create interview records/questions.
- Students can read active curated question-bank entries.
- Admins can manage all interview data and the curated question bank.
- Existing broader policies were removed/hardened so inactive question-bank content is not generally exposed.

## Important
No interview questions are invented or seeded. The system captures real student-submitted interview experiences and lets admins curate them.
