import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  LockKeyhole,
  Map,
  MessageSquareText,
  RefreshCw,
  Sparkles,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { MEMBERSHIP_LABEL } from "@/lib/membership-access";

type MembershipLevel = Database["public"]["Enums"]["membership_level"];

type Attempt = {
  score: number | null;
  passed: boolean | null;
  status: string;
};

type SkillGap = { domain: string; score: number | null; status: string };

type DashboardData = {
  membership: MembershipLevel;
  profileComplete: boolean;
  profileFieldsDone: number;
  profileFieldsTotal: number;
  foundation: { total: number; completed: number };
  l1: {
    published: boolean;
    lessonsTotal: number;
    lessonsCompleted: number;
    assignmentsTotal: number;
    assignmentsSubmitted: number;
    latestAttempt: Attempt | null;
  };
  l2: { latestAttempt: Attempt | null };
  l3: {
    published: boolean;
    lessonsTotal: number;
    lessonsCompleted: number;
    requiredAssignmentsTotal: number;
    requiredAssignmentsSubmitted: number;
    sessionsTotal: number;
    sessionsResponded: number;
    sessionsAttended: number;
  };
  interviews: number;
  skillGaps: SkillGap[];
};

const LEVEL_LABEL = MEMBERSHIP_LABEL;

const LEVEL_RANK: Record<MembershipLevel, number> = {
  free: 0,
  l0: 1,
  l1: 2,
  l2: 3,
  l3: 4,
  l4: 5,
};

const STAGES = [
  { key: "free", label: "Free", description: "Free resources and foundation reading", rank: 1 },
  { key: "l0", label: "Bronz", description: "Paid access with TagMango courses", rank: 2 },
  { key: "l1", label: "Silver", description: "Learning + knowledge check", rank: 3 },
  { key: "l2", label: "Gold", description: "Advanced knowledge check", rank: 4 },
  {
    key: "l3",
    label: "Diamond",
    description: "Course + assignments + live sessions",
    rank: 5,
  },
] as const;

function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Animates from its previous value to the next whenever `value` changes; respects reduced motion. */
function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [shown, setShown] = useState(value);
  const previous = useRef(value);

  useEffect(() => {
    if (
      previous.current === value ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      previous.current = value;
      setShown(value);
      return;
    }
    const from = previous.current;
    const start = performance.now();
    const duration = 700;
    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(from + (value - from) * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    previous.current = value;
    return () => window.cancelAnimationFrame(frame);
  }, [value]);

  return (
    <span className="tabular-nums">
      {shown}
      {suffix}
    </span>
  );
}

function stageFor(level: MembershipLevel) {
  if (level === "free") {
    return {
      eyebrow: "Foundation",
      title: "Build your foundation",
      description: "Access your free TLH resources and complete your foundation material.",
      href: "/dashboard/foundation",
      cta: "Open foundation",
    };
  }
  if (level === "l0") {
    return {
      eyebrow: "Bronz",
      title: "Continue your TLH courses",
      description:
        "Your Bronz membership includes access to your TagMango courses and paid learning resources.",
      href: "https://app.techleaderhub.com/web/courses",
      cta: "Open courses",
    };
  }
  if (level === "l1") {
    return {
      eyebrow: "Silver",
      title: "Build stronger Android fundamentals",
      description:
        "Learn, practice through assignments and use the Silver knowledge check as your next checkpoint.",
      href: "/dashboard/l1-learning",
      cta: "Continue Silver learning",
    };
  }
  if (level === "l2") {
    return {
      eyebrow: "Gold",
      title: "Advance your Android engineering depth",
      description:
        "Use the Gold knowledge check to measure advanced Android readiness and identify areas to strengthen.",
      href: "/dashboard/l2-knowledge-check",
      cta: "Open Gold knowledge check",
    };
  }
  if (level === "l3") {
    return {
      eyebrow: "Diamond",
      title: "Execute your career track",
      description:
        "Move through the Diamond course, assignments and live sessions while building real interview evidence.",
      href: "/dashboard/l3-course",
      cta: "Continue Diamond track",
    };
  }
  return {
    eyebrow: "Diamond",
    title: "Continue your advanced journey",
    description: "Your advanced journey will appear here as current Diamond content is published.",
    href: "/dashboard/career-os",
    cta: "Open Career OS",
  };
}

/** A section fades/rises in on mount, staggered by `index`. Content is never hidden — only animated. */
function Reveal({ index, children }: { index: number; children: React.ReactNode }) {
  return (
    <div className="dash-reveal" style={{ "--i": index } as React.CSSProperties}>
      {children}
    </div>
  );
}

export function StudentDashboardPage({ name }: { name: string | null }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Your session could not be loaded. Please sign in again.");
      setLoading(false);
      return;
    }

    const studentId = userData.user.id;

    const [
      membershipResult,
      profileResult,
      foundationResult,
      foundationProgressResult,
      l1CourseResult,
      l1LessonResult,
      l1ProgressResult,
      l1AssignmentResult,
      l1SubmissionResult,
      l1AttemptResult,
      l2AttemptResult,
      l3ProgramResult,
      l3CourseResult,
      l3ModuleResult,
      l3LessonResult,
      l3ProgressResult,
      l3AssignmentResult,
      l3SubmissionResult,
      l3SessionResult,
      l3AttendanceResult,
      interviewResult,
      skillGapResult,
    ] = await Promise.all([
      supabase
        .from("student_memberships")
        .select("level, is_active")
        .eq("student_id", studentId)
        .maybeSingle(),
      supabase
        .from("career_profiles")
        .select(
          "current_company,current_job_role,experience_years,target_role,career_goal,primary_skills,preferred_locations",
        )
        .eq("student_id", studentId)
        .maybeSingle(),
      supabase.from("foundation_resources").select("id").eq("is_active", true),
      supabase
        .from("student_resource_progress")
        .select("resource_id,status")
        .eq("student_id", studentId),
      supabase
        .from("l1_courses")
        .select("id")
        .eq("is_active", true)
        .order("sort_order")
        .limit(1)
        .maybeSingle(),
      supabase.from("l1_course_lessons").select("id").eq("is_active", true),
      supabase
        .from("student_lesson_progress")
        .select("lesson_id,status")
        .eq("student_id", studentId),
      supabase.from("l1_assignments").select("id").eq("is_active", true).eq("is_required", true),
      supabase
        .from("l1_assignment_submissions")
        .select("assignment_id")
        .eq("student_id", studentId),
      supabase
        .from("l1_assessment_attempts")
        .select("score,passed,status")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("l2_assessment_attempts")
        .select("score,passed,status")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("l3_programs")
        .select("id")
        .eq("is_active", true)
        .order("sort_order")
        .limit(1)
        .maybeSingle(),
      supabase
        .from("l3_courses")
        .select("id")
        .eq("is_active", true)
        .order("sort_order")
        .limit(1)
        .maybeSingle(),
      supabase.from("l3_course_modules").select("id").eq("is_active", true),
      supabase.from("l3_course_lessons").select("id").eq("is_active", true),
      supabase
        .from("student_l3_lesson_progress")
        .select("lesson_id,status")
        .eq("student_id", studentId),
      supabase.from("l3_assignments").select("id,is_required").eq("is_active", true),
      supabase
        .from("l3_assignment_submissions")
        .select("assignment_id")
        .eq("student_id", studentId),
      supabase.from("l3_live_sessions").select("id").eq("is_active", true),
      supabase
        .from("l3_session_attendance")
        .select("session_id,attended")
        .eq("student_id", studentId),
      supabase
        .from("interviews")
        .select("id", { count: "exact", head: true })
        .eq("student_id", studentId),
      supabase
        .from("career_skill_gaps")
        .select("domain,score,status")
        .eq("student_id", studentId)
        .order("domain"),
    ]);

    const hardErrors = [
      membershipResult.error,
      profileResult.error,
      foundationResult.error,
      foundationProgressResult.error,
      l1CourseResult.error,
      l1LessonResult.error,
      l1ProgressResult.error,
      l1AssignmentResult.error,
      l1SubmissionResult.error,
      l1AttemptResult.error,
      l2AttemptResult.error,
      l3ProgramResult.error,
      l3CourseResult.error,
      l3ModuleResult.error,
      l3LessonResult.error,
      l3ProgressResult.error,
      l3AssignmentResult.error,
      l3SubmissionResult.error,
      l3SessionResult.error,
      l3AttendanceResult.error,
      interviewResult.error,
      skillGapResult.error,
    ].filter(Boolean);

    if (hardErrors.length) {
      setError("Some journey information could not be loaded. Please refresh.");
      setLoading(false);
      return;
    }

    const membership =
      membershipResult.data?.is_active === false
        ? "free"
        : (membershipResult.data?.level ?? "free");

    const foundationRows = foundationResult.data ?? [];
    const foundationProgress = foundationProgressResult.data ?? [];
    const foundationCompleted = foundationProgress.filter(
      (row) =>
        row.status === "completed" &&
        foundationRows.some((resource) => resource.id === row.resource_id),
    ).length;

    const l1LessonIds = new Set((l1LessonResult.data ?? []).map((row) => row.id));
    const l1AssignmentIds = new Set((l1AssignmentResult.data ?? []).map((row) => row.id));

    const l1LessonsCompleted = (l1ProgressResult.data ?? []).filter(
      (row) => row.status === "completed" && l1LessonIds.has(row.lesson_id),
    ).length;
    const l1AssignmentsSubmitted = new Set(
      (l1SubmissionResult.data ?? [])
        .filter((row) => l1AssignmentIds.has(row.assignment_id))
        .map((row) => row.assignment_id),
    ).size;

    const l3LessonIds = new Set((l3LessonResult.data ?? []).map((row) => row.id));
    const l3RequiredAssignmentIds = new Set(
      (l3AssignmentResult.data ?? []).filter((row) => row.is_required).map((row) => row.id),
    );
    const l3LessonsCompleted = (l3ProgressResult.data ?? []).filter(
      (row) => row.status === "completed" && l3LessonIds.has(row.lesson_id),
    ).length;
    const l3AssignmentsSubmitted = new Set(
      (l3SubmissionResult.data ?? [])
        .filter((row) => l3RequiredAssignmentIds.has(row.assignment_id))
        .map((row) => row.assignment_id),
    ).size;
    const l3Attendance = l3AttendanceResult.data ?? [];

    const profile = profileResult.data;
    const profileFields = [
      profile?.current_company,
      profile?.current_job_role,
      profile?.experience_years !== null && profile?.experience_years !== undefined,
      profile?.target_role,
      profile?.career_goal,
      profile?.primary_skills?.length,
      profile?.preferred_locations?.length,
    ];
    const profileFieldsDone = profileFields.filter(Boolean).length;
    const profileComplete = profileFieldsDone === profileFields.length;

    setData({
      membership,
      profileComplete,
      profileFieldsDone,
      profileFieldsTotal: profileFields.length,
      foundation: { total: foundationRows.length, completed: foundationCompleted },
      l1: {
        published: Boolean(l1CourseResult.data),
        lessonsTotal: l1LessonIds.size,
        lessonsCompleted: l1LessonsCompleted,
        assignmentsTotal: l1AssignmentIds.size,
        assignmentsSubmitted: l1AssignmentsSubmitted,
        latestAttempt: l1AttemptResult.data ?? null,
      },
      l2: { latestAttempt: l2AttemptResult.data ?? null },
      l3: {
        published: Boolean(
          l3ProgramResult.data && l3CourseResult.data && l3ModuleResult.data?.length,
        ),
        lessonsTotal: l3LessonIds.size,
        lessonsCompleted: l3LessonsCompleted,
        requiredAssignmentsTotal: l3RequiredAssignmentIds.size,
        requiredAssignmentsSubmitted: l3AssignmentsSubmitted,
        sessionsTotal: l3SessionResult.data?.length ?? 0,
        sessionsResponded: new Set(l3Attendance.map((row) => row.session_id)).size,
        sessionsAttended: l3Attendance.filter((row) => row.attended).length,
      },
      interviews: interviewResult.count ?? 0,
      skillGaps: skillGapResult.data ?? [],
    });
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const firstName = name?.trim().split(/\s+/)[0] || "there";
  const stage = data ? stageFor(data.membership) : stageFor("free");
  const rank = data ? LEVEL_RANK[data.membership] : 0;
  const stepIndex = Math.min(Math.max(rank, 0), STAGES.length - 1);

  const foundationProgress = data ? pct(data.foundation.completed, data.foundation.total) : 0;
  const l1Progress = data ? pct(data.l1.lessonsCompleted, data.l1.lessonsTotal) : 0;
  const l3Total = data ? data.l3.lessonsTotal + data.l3.requiredAssignmentsTotal : 0;
  const l3Done = data ? data.l3.lessonsCompleted + data.l3.requiredAssignmentsSubmitted : 0;
  const l3Progress = pct(l3Done, l3Total);
  const profilePct = data ? pct(data.profileFieldsDone, data.profileFieldsTotal) : 0;

  const nextAction = useMemo(() => {
    if (!data) return null;

    if (data.membership === "free" || data.membership === "l0") {
      if (!data.profileComplete) {
        return {
          title: "Complete your career profile",
          description:
            "Add your current role, target role, experience, skills and locations so your TLH journey has the right context.",
          href: "/dashboard/profile",
          label: "Complete profile",
        };
      }
      if (data.foundation.total === 0) {
        return {
          title: "Foundation content is being prepared",
          description:
            "Your Leader dashboard is ready. Foundation resources will appear here when an admin publishes them.",
          href: null,
          label: "Content pending",
        };
      }
      if (data.foundation.completed < data.foundation.total) {
        return {
          title: "Complete your foundation reading",
          description: `${data.foundation.completed} of ${data.foundation.total} assigned resources completed.`,
          href: "/dashboard/foundation",
          label: "Open foundation",
        };
      }
      return {
        title: "Foundation complete",
        description:
          "Your foundation resources are complete. Continue with Bronz or a higher membership when assigned.",
        href: "/dashboard/profile",
        label: "Review profile",
      };
    }

    if (data.membership === "l1") {
      if (!data.profileComplete) {
        return {
          title: "Complete your career profile",
          description:
            "Finish your profile so your learning and career journey have the right context.",
          href: "/dashboard/profile",
          label: "Complete profile",
        };
      }
      if (!data.l1.published) {
        return {
          title: "Silver learning content is not published yet",
          description:
            "Your Silver workspace is ready. An admin needs to publish the course content.",
          href: null,
          label: "Content pending",
        };
      }
      if (data.l1.lessonsCompleted < data.l1.lessonsTotal) {
        return {
          title: "Continue Silver learning",
          description: `${data.l1.lessonsCompleted} of ${data.l1.lessonsTotal} lessons completed.`,
          href: "/dashboard/l1-learning",
          label: "Continue learning",
        };
      }
      if (data.l1.assignmentsSubmitted < data.l1.assignmentsTotal) {
        return {
          title: "Submit your required Silver assignments",
          description: `${data.l1.assignmentsSubmitted} of ${data.l1.assignmentsTotal} required assignments submitted.`,
          href: "/dashboard/l1-learning",
          label: "Open assignments",
        };
      }
      if (!data.l1.latestAttempt || data.l1.latestAttempt.status !== "submitted") {
        return {
          title: "Take your Silver knowledge check",
          description: "Use the checkpoint to measure your current Silver readiness.",
          href: "/dashboard/l1-knowledge-check",
          label: "Take knowledge check",
        };
      }
      return {
        title: data.l1.latestAttempt.passed
          ? "Review your Silver result"
          : "Review and retake your Silver knowledge check",
        description: `Latest score: ${data.l1.latestAttempt.score ?? 0}%. The result is a readiness signal and does not automatically change membership.`,
        href: "/dashboard/l1-knowledge-check",
        label: data.l1.latestAttempt.passed ? "View result" : "Review result",
      };
    }

    if (data.membership === "l2") {
      if (!data.profileComplete) {
        return {
          title: "Complete your career profile",
          description: "Finish your profile before using the advanced career journey.",
          href: "/dashboard/profile",
          label: "Complete profile",
        };
      }
      if (!data.l2.latestAttempt || data.l2.latestAttempt.status === "in_progress") {
        return {
          title: data.l2.latestAttempt
            ? "Continue your Gold knowledge check"
            : "Start your Gold knowledge check",
          description: data.l2.latestAttempt
            ? "Your saved Gold attempt is ready to continue."
            : "Measure advanced Android engineering readiness across the Gold question set.",
          href: "/dashboard/l2-knowledge-check",
          label: data.l2.latestAttempt ? "Continue assessment" : "Start assessment",
        };
      }
      return {
        title: data.l2.latestAttempt.passed
          ? "Review your Gold result"
          : "Review and retake your Gold knowledge check",
        description: `Latest score: ${data.l2.latestAttempt.score ?? 0}%. Use the category breakdown to decide what to strengthen next.`,
        href: "/dashboard/l2-knowledge-check",
        label: data.l2.latestAttempt.passed ? "View result" : "Review result",
      };
    }

    if (data.membership === "l3") {
      if (!data.profileComplete) {
        return {
          title: "Complete your career profile",
          description: "Keep your career context current while you execute the Diamond track.",
          href: "/dashboard/profile",
          label: "Complete profile",
        };
      }
      if (!data.l3.published) {
        return {
          title: "Diamond career-track content is being prepared",
          description:
            "Your Diamond area is ready. An admin needs to publish the program and course content.",
          href: null,
          label: "Content pending",
        };
      }
      if (
        data.l3.lessonsCompleted < data.l3.lessonsTotal ||
        data.l3.requiredAssignmentsSubmitted < data.l3.requiredAssignmentsTotal
      ) {
        return {
          title: "Continue your Diamond career track",
          description: `${data.l3.lessonsCompleted}/${data.l3.lessonsTotal} lessons and ${data.l3.requiredAssignmentsSubmitted}/${data.l3.requiredAssignmentsTotal} required assignments complete.`,
          href: "/dashboard/l3-course",
          label: "Continue Diamond",
        };
      }
      if (data.l3.sessionsResponded < data.l3.sessionsTotal) {
        return {
          title: "Review your upcoming live sessions",
          description: `${data.l3.sessionsResponded} of ${data.l3.sessionsTotal} attendance responses recorded.`,
          href: "/dashboard/l3-live-sessions",
          label: "Open live sessions",
        };
      }
      return {
        title: "Keep building interview evidence",
        description: `${data.interviews} interview experience${data.interviews === 1 ? "" : "s"} recorded so far.`,
        href: "/dashboard/interview-questions",
        label: "Record interview",
      };
    }

    return {
      title: "Continue your advanced journey",
      description:
        "Continue your current advanced journey through the available Diamond workspaces.",
      href: null,
      label: "Content pending",
    };
  }, [data]);

  return (
    <StudentShell
      title={`Welcome back, ${firstName}`}
      subtitle="Your TLH journey is one clear path: take the next action, build real evidence, and move closer to your career goal."
      membershipLabel={data ? `${LEVEL_LABEL[data.membership]} Membership` : "Leader workspace"}
    >
      <div className="space-y-6">
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
                <RefreshCw className={loading ? "animate-spin" : ""} />
                Refresh
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="p-10 text-center text-[var(--dash-faint)]">
              Loading your TLH journey…
            </CardContent>
          </Card>
        ) : data ? (
          <>
            {/* ---------- Hero ---------- */}
            <Reveal index={0}>
              <div className="dash-hero p-6 sm:p-8">
                <div className="dash-hero-glow" aria-hidden="true" />
                <div className="relative flex flex-wrap items-start justify-between gap-6">
                  <div className="max-w-xl">
                    <p className="dash-eyebrow">
                      {greeting()}, {firstName}
                    </p>
                    <h2 className="dash-greeting mt-2">{stage.title}</h2>
                    <p className="mt-3 text-sm leading-6 text-[var(--dash-faint)]">
                      {stage.description}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      {stage.href ? (
                        <Button asChild>
                          <a
                            href={stage.href}
                            target={stage.href.startsWith("http") ? "_blank" : undefined}
                            rel={stage.href.startsWith("http") ? "noopener noreferrer" : undefined}
                          >
                            {stage.cta}
                            <ArrowRight />
                          </a>
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          {stage.cta}
                        </Button>
                      )}
                      <Button variant="ghost" className="text-white hover:bg-white/10" asChild>
                        <a href="/dashboard/profile">
                          <UserRound />{" "}
                          {data.profileComplete ? "Review profile" : "Complete profile"}
                        </a>
                      </Button>
                    </div>
                  </div>

                  <div className="relative flex flex-col items-center gap-2">
                    <div
                      className="dash-ring"
                      style={{ "--p": `${profilePct}%` } as React.CSSProperties}
                    >
                      <span>
                        <CountUp value={profilePct} suffix="%" />
                      </span>
                    </div>
                    <p className="text-center text-xs font-medium text-[var(--dash-faint)]">
                      Career profile
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* ---------- Journey stepper ---------- */}
            <Reveal index={1}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>Your TLH Journey</CardTitle>
                      <p className="mt-1 text-sm text-[var(--dash-faint)]">
                        One path from foundation to career-track execution.
                      </p>
                    </div>
                    <Badge variant="outline" className="border-white/15 text-white">
                      Step {stepIndex + 1} of {STAGES.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="dash-steps pb-2">
                    <div
                      className="dash-steps-fill"
                      style={{ width: `${(stepIndex / (STAGES.length - 1)) * 85}%` }}
                      aria-hidden="true"
                    />
                    {STAGES.map((item, index) => {
                      const done = index < stepIndex;
                      const current = index === stepIndex;
                      const unlocked = index <= stepIndex;
                      return (
                        <div
                          key={item.key}
                          className={
                            "dash-step" + (current ? " is-current" : done ? " is-done" : "")
                          }
                        >
                          <span className="dash-step-dot">
                            {unlocked ? (
                              <CheckCircle2 className="size-4" aria-hidden="true" />
                            ) : (
                              <LockKeyhole className="size-4" aria-hidden="true" />
                            )}
                          </span>
                          <span className="dash-step-label">{item.label}</span>
                          <span className="dash-step-desc">{item.description}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            {/* ---------- Next Action + Career Profile ---------- */}
            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Reveal index={2}>
                <Card className="dash-glow relative h-full overflow-hidden border-[rgba(11,99,229,.25)] bg-[linear-gradient(180deg,rgba(11,99,229,.08),transparent)]">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-5 text-[var(--dash-blue-bright)]" />
                      <CardTitle>Next Action</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="font-semibold text-white">{nextAction?.title}</p>
                        <p className="mt-1 max-w-2xl text-sm leading-6 text-[var(--dash-faint)]">
                          {nextAction?.description}
                        </p>
                      </div>
                      {nextAction?.href && (
                        <Button asChild>
                          <a href={nextAction.href}>
                            {nextAction.label}
                            <ArrowRight />
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal index={3}>
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-base">Membership</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-heading text-2xl font-bold text-white">
                      {LEVEL_LABEL[data.membership]}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-[var(--dash-faint)]">
                      Your membership controls which journey stage is available to you.
                    </p>
                    <Badge className="mt-4">
                      {data.membership === "free" ? "Foundation access" : "Active membership"}
                    </Badge>
                  </CardContent>
                </Card>
              </Reveal>
            </section>

            {/* ---------- Per-membership progress ---------- */}
            <Reveal index={4}>
              {data.membership === "free" || data.membership === "l0" ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-5 text-[var(--dash-blue-bright)]" />
                      <CardTitle>Foundation Progress</CardTitle>
                    </div>
                    <p className="text-sm text-[var(--dash-faint)]">
                      Your assigned foundation resources.
                    </p>
                  </CardHeader>
                  <CardContent>
                    {data.foundation.total ? (
                      <>
                        <div className="flex items-center justify-between text-sm">
                          <span>
                            {data.foundation.completed} of {data.foundation.total} completed
                          </span>
                          <span className="font-semibold">
                            <CountUp value={foundationProgress} suffix="%" />
                          </span>
                        </div>
                        <Progress value={foundationProgress} className="mt-2" />
                        <Button className="mt-5" variant="outline" asChild>
                          <a href="/dashboard/foundation">
                            Open foundation
                            <ArrowRight />
                          </a>
                        </Button>
                      </>
                    ) : (
                      <p className="text-sm text-[var(--dash-faint)]">
                        No foundation resources are published for your workspace yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ) : data.membership === "l1" ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <BookOpen className="size-5 text-[var(--dash-blue-bright)]" />
                      <CardTitle>Silver Progress</CardTitle>
                    </div>
                    <p className="text-sm text-[var(--dash-faint)]">
                      Learning, assignments and knowledge-check status for Silver.
                    </p>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-xl border border-[var(--dash-line)] p-4">
                      <p className="text-xs uppercase tracking-wider text-[var(--dash-faint)]">
                        Lessons
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        <CountUp value={l1Progress} suffix="%" />
                      </p>
                      <Progress value={l1Progress} className="mt-2" />
                      <p className="mt-2 text-xs text-[var(--dash-faint)]">
                        {data.l1.lessonsCompleted}/{data.l1.lessonsTotal} completed
                      </p>
                    </div>
                    <div className="rounded-xl border border-[var(--dash-line)] p-4">
                      <p className="text-xs uppercase tracking-wider text-[var(--dash-faint)]">
                        Assignments
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {data.l1.assignmentsSubmitted}/{data.l1.assignmentsTotal}
                      </p>
                      <p className="mt-2 text-xs text-[var(--dash-faint)]">Required submissions</p>
                    </div>
                    <div className="rounded-xl border border-[var(--dash-line)] p-4">
                      <p className="text-xs uppercase tracking-wider text-[var(--dash-faint)]">
                        Knowledge Check
                      </p>
                      <p className="mt-2 text-2xl font-bold text-white">
                        {data.l1.latestAttempt?.status === "submitted"
                          ? `${data.l1.latestAttempt.score ?? 0}%`
                          : "Pending"}
                      </p>
                      <p className="mt-2 text-xs text-[var(--dash-faint)]">
                        {data.l1.latestAttempt?.status === "submitted"
                          ? data.l1.latestAttempt.passed
                            ? "Checkpoint reached"
                            : "Review and retake"
                          : "Not submitted yet"}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : data.membership === "l2" ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className="size-5 text-[var(--dash-blue-bright)]" />
                      <CardTitle>Gold Progress</CardTitle>
                    </div>
                    <p className="text-sm text-[var(--dash-faint)]">
                      Your latest Gold knowledge-check state.
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-white">
                        {!data.l2.latestAttempt
                          ? "Not started"
                          : data.l2.latestAttempt.status === "in_progress"
                            ? "In progress"
                            : `${data.l2.latestAttempt.score ?? 0}% latest score`}
                      </p>
                      <p className="mt-1 text-sm text-[var(--dash-faint)]">
                        {!data.l2.latestAttempt
                          ? "Start the 20-question advanced Android checkpoint."
                          : data.l2.latestAttempt.status === "in_progress"
                            ? "Your saved answers are ready to continue."
                            : data.l2.latestAttempt.passed
                              ? "Checkpoint reached. Review your category breakdown."
                              : "Checkpoint not reached. Review and retake when ready."}
                      </p>
                    </div>
                    <Button variant="outline" asChild>
                      <a href="/dashboard/l2-knowledge-check">
                        Open Gold check
                        <ArrowRight />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ) : data.membership === "l3" ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="size-5 text-[var(--dash-blue-bright)]" />
                      <CardTitle>Diamond Career Track Progress</CardTitle>
                    </div>
                    <p className="text-sm text-[var(--dash-faint)]">
                      Diamond course, assignments and weekly live-session participation.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Track progress</span>
                        <span className="font-semibold">
                          <CountUp value={l3Progress} suffix="%" />
                        </span>
                      </div>
                      <Progress value={l3Progress} className="mt-2" />
                      <p className="mt-2 text-xs text-[var(--dash-faint)]">
                        {data.l3.lessonsCompleted}/{data.l3.lessonsTotal} lessons ·{" "}
                        {data.l3.requiredAssignmentsSubmitted}/{data.l3.requiredAssignmentsTotal}{" "}
                        required assignments
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="dash-tile">
                        <div className="flex items-center gap-2">
                          <span className="dash-tile-icon">
                            <GraduationCap className="size-5" aria-hidden="true" />
                          </span>
                          <p className="font-semibold text-white">Course & assignments</p>
                        </div>
                        <p className="mt-2 text-xs text-[var(--dash-faint)]">
                          Continue lessons and submit required work.
                        </p>
                        <Button className="mt-3" size="sm" variant="outline" asChild>
                          <a href="/dashboard/l3-course">
                            Open track
                            <ArrowRight className="dash-tile-arrow" />
                          </a>
                        </Button>
                      </div>
                      <div className="dash-tile">
                        <div className="flex items-center gap-2">
                          <span className="dash-tile-icon">
                            <CalendarDays className="size-5" aria-hidden="true" />
                          </span>
                          <p className="font-semibold text-white">Live sessions</p>
                        </div>
                        <p className="mt-2 text-xs text-[var(--dash-faint)]">
                          {data.l3.sessionsAttended}/{data.l3.sessionsTotal} attended ·{" "}
                          {data.l3.sessionsResponded}/{data.l3.sessionsTotal} responses
                        </p>
                        <Button className="mt-3" size="sm" variant="outline" asChild>
                          <a href="/dashboard/l3-live-sessions">
                            Open sessions
                            <ArrowRight className="dash-tile-arrow" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </Reveal>

            {/* ---------- Career strengths ---------- */}
            {data.skillGaps.length > 0 && (
              <Reveal index={5}>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Map className="size-5 text-[var(--dash-blue-bright)]" />
                      <CardTitle>Career Strengths & Gaps</CardTitle>
                    </div>
                    <p className="text-sm text-[var(--dash-faint)]">
                      From your latest career assessment, by domain.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.skillGaps.map((gap) => {
                      const score = gap.score ?? 0;
                      const fillClass =
                        gap.status === "strength"
                          ? "is-strong"
                          : gap.status === "open"
                            ? "is-gap"
                            : "";
                      return (
                        <div key={gap.domain} className="dash-bar-row">
                          <span className="text-sm font-medium text-white">{gap.domain}</span>
                          <span className="text-sm font-semibold tabular-nums text-[var(--dash-faint)]">
                            <CountUp value={score} suffix="%" />
                          </span>
                          <div className="dash-bar-track">
                            <div
                              className={"dash-bar-fill " + fillClass}
                              style={{ "--w": `${score}%` } as React.CSSProperties}
                            />
                          </div>
                        </div>
                      );
                    })}
                    <Button variant="outline" size="sm" asChild>
                      <a href="/dashboard/career-os">
                        Open Career OS
                        <ArrowRight />
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </Reveal>
            )}

            {/* ---------- Quick access ---------- */}
            <Reveal index={6}>
              <section className="grid gap-4 md:grid-cols-3">
                <a href="/dashboard/interview-questions" className="dash-tile">
                  <span className="dash-tile-icon">
                    <MessageSquareText className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-semibold text-white">Interview Questions</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--dash-faint)]">
                    <CountUp value={data.interviews} /> interview experience
                    {data.interviews === 1 ? "" : "s"} recorded.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white">
                    Record / review
                    <ArrowRight className="dash-tile-arrow size-4" aria-hidden="true" />
                  </span>
                </a>
                <a href="/dashboard/career-os" className="dash-tile">
                  <span className="dash-tile-icon">
                    <Map className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-semibold text-white">Career OS</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--dash-faint)]">
                    {data.skillGaps.length
                      ? `${data.skillGaps.length} skill-gap records available.`
                      : "Review your assessment, skill gaps and roadmap."}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white">
                    Open Career OS
                    <ArrowRight className="dash-tile-arrow size-4" aria-hidden="true" />
                  </span>
                </a>
                <a href="/dashboard/profile" className="dash-tile">
                  <span className="dash-tile-icon">
                    <UserRound className="size-5" aria-hidden="true" />
                  </span>
                  <p className="mt-3 font-semibold text-white">Career Profile</p>
                  <p className="mt-1 text-xs leading-5 text-[var(--dash-faint)]">
                    {data.profileComplete
                      ? "Core career information is complete."
                      : "Complete the core career information."}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white">
                    Open profile
                    <ArrowRight className="dash-tile-arrow size-4" aria-hidden="true" />
                  </span>
                </a>
              </section>
            </Reveal>

            {/* ---------- How to use ---------- */}
            <Reveal index={7}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">How to use your workspace</CardTitle>
                  <p className="text-sm text-[var(--dash-faint)]">
                    The dashboard is your starting point, not a second copy of every workspace.
                  </p>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-3">
                  <div className="rounded-xl border border-[var(--dash-line)] p-4">
                    <p className="text-sm font-semibold text-white">1. Follow Next Action</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--dash-faint)]">
                      Start with the single action selected for your current membership and
                      progress.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--dash-line)] p-4">
                    <p className="text-sm font-semibold text-white">2. Keep evidence current</p>
                    <p className="mt-1 text-xs leading-5 text-[var(--dash-faint)]">
                      Record real interview questions and keep your career profile updated.
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--dash-line)] p-4">
                    <p className="text-sm font-semibold text-white">
                      3. Use the dedicated workspaces
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--dash-faint)]">
                      Open learning, assessments, Career OS and live sessions only when you need
                      them.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </>
        ) : null}
      </div>
    </StudentShell>
  );
}
