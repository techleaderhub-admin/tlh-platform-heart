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
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MembershipLevel = Database["public"]["Enums"]["membership_level"];

type Attempt = {
  score: number | null;
  passed: boolean | null;
  status: string;
};

type DashboardData = {
  membership: MembershipLevel;
  profileComplete: boolean;
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
  skillGaps: number;
};

const LEVEL_LABEL: Record<MembershipLevel, string> = {
  free: "Free",
  l0: "Bronz",
  l1: "Silver",
  l2: "Gold",
  l3: "Diamond",
  l4: "L4",
};

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
  { key: "l3", label: "Diamond", description: "Course + assignments + live sessions", rank: 5 },
] as const;

function pct(done: number, total: number) {
  return total ? Math.round((done / total) * 100) : 0;
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
      description: "Your Bronz membership includes access to your TagMango courses and paid learning resources.",
      href: "https://app.techleaderhub.com/web/courses",
      cta: "Open courses",
    };
  }
  if (level === "l1") {
    return {
      eyebrow: "Silver",
      title: "Build stronger Android fundamentals",
      description: "Learn, practice through assignments and use the Silver knowledge check as your next checkpoint.",
      href: "/dashboard/l1-learning",
      cta: "Continue Silver learning",
    };
  }
  if (level === "l2") {
    return {
      eyebrow: "Gold",
      title: "Advance your Android engineering depth",
      description: "Use the Gold knowledge check to measure advanced Android readiness and identify areas to strengthen.",
      href: "/dashboard/l2-knowledge-check",
      cta: "Open Gold knowledge check",
    };
  }
  if (level === "l3") {
    return {
      eyebrow: "Diamond",
      title: "Execute your career track",
      description: "Move through the Diamond course, assignments and live sessions while building real interview evidence.",
      href: "/dashboard/l3-course",
      cta: "Continue Diamond track",
    };
  }
  return {
    eyebrow: "L4",
    title: "Continue your advanced journey",
    description: "Your L4 journey will appear here as L4 content is published.",
    href: null,
    cta: "L4 content pending",
  };
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
      supabase.from("student_memberships").select("level, is_active").eq("student_id", studentId).maybeSingle(),
      supabase
        .from("career_profiles")
        .select("current_company,current_job_role,experience_years,target_role,career_goal,primary_skills,preferred_locations")
        .eq("student_id", studentId)
        .maybeSingle(),
      supabase.from("foundation_resources").select("id").eq("is_active", true),
      supabase.from("student_resource_progress").select("resource_id,status").eq("student_id", studentId),
      supabase.from("l1_courses").select("id").eq("is_active", true).order("sort_order").limit(1).maybeSingle(),
      supabase.from("l1_course_lessons").select("id").eq("is_active", true),
      supabase.from("student_lesson_progress").select("lesson_id,status").eq("student_id", studentId),
      supabase.from("l1_assignments").select("id").eq("is_active", true).eq("is_required", true),
      supabase.from("l1_assignment_submissions").select("assignment_id").eq("student_id", studentId),
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
      supabase.from("l3_programs").select("id").eq("is_active", true).order("sort_order").limit(1).maybeSingle(),
      supabase.from("l3_courses").select("id").eq("is_active", true).order("sort_order").limit(1).maybeSingle(),
      supabase.from("l3_course_modules").select("id").eq("is_active", true),
      supabase.from("l3_course_lessons").select("id").eq("is_active", true),
      supabase.from("student_l3_lesson_progress").select("lesson_id,status").eq("student_id", studentId),
      supabase.from("l3_assignments").select("id,is_required").eq("is_active", true),
      supabase.from("l3_assignment_submissions").select("assignment_id").eq("student_id", studentId),
      supabase.from("l3_live_sessions").select("id").eq("is_active", true),
      supabase.from("l3_session_attendance").select("session_id,attended").eq("student_id", studentId),
      supabase.from("interviews").select("id", { count: "exact", head: true }).eq("student_id", studentId),
      supabase.from("career_skill_gaps").select("id", { count: "exact", head: true }).eq("student_id", studentId),
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
      (l3AssignmentResult.data ?? [])
        .filter((row) => row.is_required)
        .map((row) => row.id),
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
    const profileComplete = Boolean(
      profile &&
        profile.current_company &&
        profile.current_job_role &&
        profile.experience_years !== null &&
        profile.target_role &&
        profile.career_goal &&
        profile.primary_skills?.length &&
        profile.preferred_locations?.length,
    );

    setData({
      membership,
      profileComplete,
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
        published: Boolean(l3ProgramResult.data && l3CourseResult.data && l3ModuleResult.data?.length),
        lessonsTotal: l3LessonIds.size,
        lessonsCompleted: l3LessonsCompleted,
        requiredAssignmentsTotal: l3RequiredAssignmentIds.size,
        requiredAssignmentsSubmitted: l3AssignmentsSubmitted,
        sessionsTotal: l3SessionResult.data?.length ?? 0,
        sessionsResponded: new Set(l3Attendance.map((row) => row.session_id)).size,
        sessionsAttended: l3Attendance.filter((row) => row.attended).length,
      },
      interviews: interviewResult.count ?? 0,
      skillGaps: skillGapResult.count ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const firstName = name?.trim().split(/\s+/)[0] || "there";
  const stage = data ? stageFor(data.membership) : stageFor("free");
  const rank = data ? LEVEL_RANK[data.membership] : 0;

  const foundationProgress = data ? pct(data.foundation.completed, data.foundation.total) : 0;
  const l1Progress = data ? pct(data.l1.lessonsCompleted, data.l1.lessonsTotal) : 0;
  const l3Total = data ? data.l3.lessonsTotal + data.l3.requiredAssignmentsTotal : 0;
  const l3Done = data ? data.l3.lessonsCompleted + data.l3.requiredAssignmentsSubmitted : 0;
  const l3Progress = pct(l3Done, l3Total);

  const nextAction = useMemo(() => {
    if (!data) return null;

    if (data.membership === "free" || data.membership === "l0") {
      if (!data.profileComplete) {
        return {
          title: "Complete your career profile",
          description: "Add your current role, target role, experience, skills and locations so your TLH journey has the right context.",
          href: "/dashboard/profile",
          label: "Complete profile",
        };
      }
      if (data.foundation.total === 0) {
        return {
          title: "Foundation content is being prepared",
          description: "Your Leader dashboard is ready. Foundation resources will appear here when an admin publishes them.",
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
        description: "Your foundation resources are complete. Continue with Bronz or a higher membership when assigned.",
        href: "/dashboard/profile",
        label: "Review profile",
      };
    }

    if (data.membership === "l1") {
      if (!data.profileComplete) {
        return {
          title: "Complete your career profile",
          description: "Finish your profile so your learning and career journey have the right context.",
          href: "/dashboard/profile",
          label: "Complete profile",
        };
      }
      if (!data.l1.published) {
        return {
          title: "Silver learning content is not published yet",
          description: "Your Silver workspace is ready. An admin needs to publish the course content.",
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
        title: data.l1.latestAttempt.passed ? "Review your Silver result" : "Review and retake your Silver knowledge check",
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
          title: data.l2.latestAttempt ? "Continue your Gold knowledge check" : "Start your Gold knowledge check",
          description: data.l2.latestAttempt
            ? "Your saved Gold attempt is ready to continue."
            : "Measure advanced Android engineering readiness across the Gold question set.",
          href: "/dashboard/l2-knowledge-check",
          label: data.l2.latestAttempt ? "Continue assessment" : "Start assessment",
        };
      }
      return {
        title: data.l2.latestAttempt.passed ? "Review your Gold result" : "Review and retake your Gold knowledge check",
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
          description: "Your Diamond area is ready. An admin needs to publish the program and course content.",
          href: null,
          label: "Content pending",
        };
      }
      if (data.l3.lessonsCompleted < data.l3.lessonsTotal || data.l3.requiredAssignmentsSubmitted < data.l3.requiredAssignmentsTotal) {
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
      description: "Your next L4 modules will appear here as they are published.",
      href: null,
      label: "Content pending",
    };
  }, [data]);

  return (
    <StudentShell
      title={`Welcome back, ${firstName}`}
      subtitle="Your TLH home is one clear journey: complete the next action, track real progress and keep your career evidence current."
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
            <CardContent className="p-10 text-center text-muted-foreground">Loading your TLH journey…</CardContent>
          </Card>
        ) : data ? (
          <>
            <section className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
              <Card className="overflow-hidden border-primary/20 bg-primary/[0.03]">
                <CardContent className="p-6 sm:p-7">
                  <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="max-w-2xl">
                      <Badge variant="outline" className="border-primary/30 text-primary">
                        Current level · {LEVEL_LABEL[data.membership]}
                      </Badge>
                      <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">{stage.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{stage.description}</p>
                    </div>
                    <div className="rounded-2xl border border-border bg-background px-5 py-4 text-center">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground">Current stage</p>
                      <p className="mt-1 font-heading text-lg font-bold text-primary">{stage.eyebrow}</p>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    {stage.href ? (
                      <Button asChild>
                        <a
                          href={stage.href}
                          target={stage.href.startsWith("http") ? "_blank" : undefined}
                          rel={stage.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        >
                          {stage.cta}<ArrowRight />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="outline" disabled>{stage.cta}</Button>
                    )}
                    <Button variant="ghost" asChild>
                      <a href="/dashboard/profile"><UserRound /> {data.profileComplete ? "Review profile" : "Complete profile"}</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Membership</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-heading text-2xl font-bold">{LEVEL_LABEL[data.membership]}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Your membership controls which journey stage is available to you.
                  </p>
                  <Badge className="mt-4">{data.membership === "free" ? "Foundation access" : "Active membership"}</Badge>
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle>Your TLH Journey</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">One path from foundation to career-track execution.</p>
                  </div>
                  <Badge variant="outline">Step {Math.min(Math.max(rank + 1, 1), 5)} of 5</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-4">
                  {STAGES.map((item) => {
                    const current =
                      (item.key === data.membership);
                    const unlocked = rank + 1 >= item.rank;

                    return (
                      <div
                        key={item.key}
                        className={
                          "rounded-xl border p-4 " +
                          (current ? "border-primary bg-primary/[0.06]" : unlocked ? "border-border" : "border-border/60 bg-muted/20")
                        }
                      >
                        <div className="flex items-center justify-between">
                          {unlocked ? <CheckCircle2 className="size-5 text-primary" /> : <LockKeyhole className="size-4 text-muted-foreground" />}
                          {current && <Badge variant="outline" className="border-primary/30 text-primary">Current</Badge>}
                        </div>
                        <p className="mt-3 font-semibold">{item.label}</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">{item.description}</p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="border-primary/20 bg-primary/[0.03]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-5 text-primary" />
                    <CardTitle>Next Action</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{nextAction?.title}</p>
                      <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{nextAction?.description}</p>
                    </div>
                    {nextAction?.href && (
                      <Button variant="outline" asChild>
                        <a href={nextAction.href}>{nextAction.label}<ArrowRight /></a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Career Profile</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{data.profileComplete ? "Profile complete" : "Profile needs attention"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {data.profileComplete ? "Your career context is ready." : "Add the core career details used across your TLH journey."}
                      </p>
                    </div>
                    <Badge variant={data.profileComplete ? "default" : "outline"}>{data.profileComplete ? "Ready" : "Pending"}</Badge>
                  </div>
                  <Button className="mt-5" variant="outline" asChild>
                    <a href="/dashboard/profile">{data.profileComplete ? "Review profile" : "Complete profile"}<ArrowRight /></a>
                  </Button>
                </CardContent>
              </Card>
            </section>

            {data.membership === "free" || data.membership === "l0" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2"><BookOpen className="size-5 text-primary" /><CardTitle>Foundation Progress</CardTitle></div>
                  <p className="text-sm text-muted-foreground">Your assigned foundation resources.</p>
                </CardHeader>
                <CardContent>
                  {data.foundation.total ? (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span>{data.foundation.completed} of {data.foundation.total} completed</span>
                        <span className="font-semibold">{foundationProgress}%</span>
                      </div>
                      <Progress value={foundationProgress} className="mt-2" />
                      <Button className="mt-5" variant="outline" asChild><a href="/dashboard/foundation">Open foundation<ArrowRight /></a></Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No foundation resources are published for your workspace yet.</p>
                  )}
                </CardContent>
              </Card>
            ) : data.membership === "l1" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2"><BookOpen className="size-5 text-primary" /><CardTitle>Silver Progress</CardTitle></div>
                  <p className="text-sm text-muted-foreground">Learning, assignments and knowledge-check status for Silver.</p>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Lessons</p>
                    <p className="mt-2 text-2xl font-bold">{l1Progress}%</p>
                    <Progress value={l1Progress} className="mt-2" />
                    <p className="mt-2 text-xs text-muted-foreground">{data.l1.lessonsCompleted}/{data.l1.lessonsTotal} completed</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Assignments</p>
                    <p className="mt-2 text-2xl font-bold">{data.l1.assignmentsSubmitted}/{data.l1.assignmentsTotal}</p>
                    <p className="mt-2 text-xs text-muted-foreground">Required submissions</p>
                  </div>
                  <div className="rounded-xl border p-4">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground">Knowledge Check</p>
                    <p className="mt-2 text-2xl font-bold">
                      {data.l1.latestAttempt?.status === "submitted" ? `${data.l1.latestAttempt.score ?? 0}%` : "Pending"}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {data.l1.latestAttempt?.status === "submitted"
                        ? data.l1.latestAttempt.passed ? "Checkpoint reached" : "Review and retake"
                        : "Not submitted yet"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : data.membership === "l2" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2"><ClipboardCheck className="size-5 text-primary" /><CardTitle>Gold Progress</CardTitle></div>
                  <p className="text-sm text-muted-foreground">Your latest Gold knowledge-check state.</p>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold">
                      {!data.l2.latestAttempt ? "Not started" : data.l2.latestAttempt.status === "in_progress" ? "In progress" : `${data.l2.latestAttempt.score ?? 0}% latest score`}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {!data.l2.latestAttempt
                        ? "Start the 20-question advanced Android checkpoint."
                        : data.l2.latestAttempt.status === "in_progress"
                          ? "Your saved answers are ready to continue."
                          : data.l2.latestAttempt.passed ? "Checkpoint reached. Review your category breakdown." : "Checkpoint not reached. Review and retake when ready."}
                    </p>
                  </div>
                  <Button variant="outline" asChild><a href="/dashboard/l2-knowledge-check">Open Gold check<ArrowRight /></a></Button>
                </CardContent>
              </Card>
            ) : data.membership === "l3" ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2"><GraduationCap className="size-5 text-primary" /><CardTitle>Diamond Career Track Progress</CardTitle></div>
                  <p className="text-sm text-muted-foreground">Diamond course, assignments and weekly live-session participation.</p>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <div className="flex items-center justify-between text-sm"><span>Track progress</span><span className="font-semibold">{l3Progress}%</span></div>
                    <Progress value={l3Progress} className="mt-2" />
                    <p className="mt-2 text-xs text-muted-foreground">{data.l3.lessonsCompleted}/{data.l3.lessonsTotal} lessons · {data.l3.requiredAssignmentsSubmitted}/{data.l3.requiredAssignmentsTotal} required assignments</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border p-4"><div className="flex items-center gap-2"><GraduationCap className="size-4 text-primary"/><p className="font-semibold">Course & assignments</p></div><p className="mt-1 text-xs text-muted-foreground">Continue lessons and submit required work.</p><Button className="mt-3" size="sm" variant="outline" asChild><a href="/dashboard/l3-course">Open track<ArrowRight /></a></Button></div>
                    <div className="rounded-xl border p-4"><div className="flex items-center gap-2"><CalendarDays className="size-4 text-primary"/><p className="font-semibold">Live sessions</p></div><p className="mt-1 text-xs text-muted-foreground">{data.l3.sessionsAttended}/{data.l3.sessionsTotal} attended · {data.l3.sessionsResponded}/{data.l3.sessionsTotal} responses</p><Button className="mt-3" size="sm" variant="outline" asChild><a href="/dashboard/l3-live-sessions">Open sessions<ArrowRight /></a></Button></div>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <section className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-5">
                  <MessageSquareText className="size-5 text-primary" />
                  <p className="mt-3 font-semibold">Interview Questions</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{data.interviews} interview experience{data.interviews === 1 ? "" : "s"} recorded.</p>
                  <Button className="mt-4" size="sm" variant="outline" asChild><a href="/dashboard/interview-questions">Record / review<ArrowRight /></a></Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <Map className="size-5 text-primary" />
                  <p className="mt-3 font-semibold">Career OS</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {data.skillGaps ? `${data.skillGaps} skill-gap records available.` : "Review your assessment, skill gaps and roadmap."}
                  </p>
                  <Button className="mt-4" size="sm" variant="outline" asChild><a href="/dashboard/career-os">Open Career OS<ArrowRight /></a></Button>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <UserRound className="size-5 text-primary" />
                  <p className="mt-3 font-semibold">Career Profile</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">{data.profileComplete ? "Core career information is complete." : "Complete the core career information."}</p>
                  <Button className="mt-4" size="sm" variant="outline" asChild><a href="/dashboard/profile">Open profile<ArrowRight /></a></Button>
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">How to use your dashboard</CardTitle>
                <p className="text-sm text-muted-foreground">The dashboard is your starting point, not a second copy of every workspace.</p>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border p-4"><p className="text-sm font-semibold">1. Follow Next Action</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Start with the single action selected for your current membership and progress.</p></div>
                <div className="rounded-xl border p-4"><p className="text-sm font-semibold">2. Keep evidence current</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Record real interview questions and keep your career profile updated.</p></div>
                <div className="rounded-xl border p-4"><p className="text-sm font-semibold">3. Use the dedicated workspaces</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Open learning, assessments, Career OS and live sessions only when you need them.</p></div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </StudentShell>
  );
}
