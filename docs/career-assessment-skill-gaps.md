# Career Assessment + Skill Gap Tracking

## Existing assessment

TLH already had the career_assessments table and student Career Readiness Assessment v1. This task extends that system instead of creating a duplicate assessment table.

The current assessment measures four domains:

- Architecture
- Kotlin & Concurrency
- Mobile System Design
- Leadership

Students rate each statement from 1 to 5. The existing assessment stores the overall score, strengths, gaps, recommendations and answers.

## Skill-gap snapshot

A new career_skill_gaps table stores the current domain snapshot for each student.

Each row contains student, source assessment, domain, score, status, recommendation and last assessed time.

The unique (student_id, domain) constraint means each domain has one current snapshot while the original career_assessments table preserves assessment history.

## Status model

Assessment-derived status:

- < 60% -> open
- 60–79% -> developing
- 80%+ -> strength

Admins can additionally maintain the operational status as in_progress or resolved.

## Student flow

1. Student opens Career Assessment.
2. Completes all assessment statements.
3. Saves the assessment.
4. Assessment history remains in career_assessments.
5. The latest domain scores are upserted into career_skill_gaps.
6. The dashboard exposes the assessment as part of the Career OS foundation.

## Admin flow

Admins get a central Career Assessments workspace with total assessments, assessed-student count, open/developing gap count, search, status filtering, domain score/recommendation visibility and operational gap-status updates.

## Career OS connection

The skill-gap table is intentionally separate from assessment history. Future Career OS roadmap generation can consume the current skill-gap snapshot without rewriting assessment history.

No automatic membership upgrade or career outcome is triggered by assessment results.
