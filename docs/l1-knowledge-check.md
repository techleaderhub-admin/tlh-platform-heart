# TLH L1 Silver Knowledge Check

## Purpose

The L1 Silver knowledge check verifies a student's existing Android foundation before deeper L1 learning.

## Scope

The seeded V1 question set contains 20 multiple-choice questions covering:

- Kotlin
- Kotlin coroutines
- Android fundamentals
- Android UI
- Jetpack
- Networking
- Architecture
- Testing

Jetpack Compose is intentionally excluded from this L1 check.

## Progression rule

40% is the defined checkpoint.

The result is stored as a readiness signal. It does **not** automatically upgrade or downgrade membership. Membership remains an explicit admin-controlled entitlement.

## Security

- L1+ membership is required to read active questions and create an attempt.
- Students can only read/write their own in-progress attempt and answers.
- Admins can manage questions and review attempts.
- Final scoring is performed by the database RPC submit_l1_assessment, rather than trusting a client-calculated score.

## V1 UX

1. Student opens L1 Knowledge Check from the dashboard.
2. Student starts or resumes an attempt.
3. Each answer is saved immediately.
4. Student submits after all questions are answered.
5. Database calculates score and the 40% checkpoint.
6. Student sees the result and can retake.

The V1 question set is stored in l1_assessment_questions so the question content can later be managed from an admin workspace without changing the student UI.
