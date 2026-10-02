import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
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

type DashboardData = {
  membership: MembershipLevel;
  profileComplete: boolean;
  foundation: { total: number; completed: number };
  l1: {
    coursePublished: boolean;
    lessonsTotal: number;
    lessonsCompleted: number;
    assignmentsTotal: number;
    assignmentsSubmitted: number;
    latestAttempt: { score: number | null; passed: boolean | null; status: string } | null;
  };
  interviews: number;
};

const LEVEL_LABEL: Record<MembershipLevel, string> = {
  free: "Free",
  l0: "L0 Foundation",
  l1: "L1 Silver",
  l2: "L2 Advanced",
  l3: "L3 Career Track",
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

function getStage(level: MembershipLevel) {
  if (level === "free" || level === "l0") {
    return {
      eyebrow: "Foundation",
      title: "Build your foundation",
      description: "Read the assigned foundation material and complete it before exploring L1.",
      href: "/dashboard/foundation",
      cta: "Start foundation reading",
    };
  }
  if (level === "l1") {
    return {
      eyebrow: "L1 Silver",
      title: "Strengthen your Android foundation",
      description: "Learn through the L1 course, complete assignments and take the L1 knowledge check.",
      href: "/dashboard/l1-learning",
      cta: "Continue L1 learning",
    };
  }
  if (level === "l2") {
    return {
      eyebrow: "L2 Advanced",
      title: "Advance your Android skills",
      description: "The L2 knowledge-check journey is the next checkpoint for this membership level.",
      href: "/dashboard/l2-knowledge-check",
      cta: "Take L2 knowledge check",
    };
  }
  if (level === "l3") {
    return {
      eyebrow: "L3 Career Track",
      title: "Execute your career track",
      description: "Your L3 journey will connect course progress, assignments and live-session participation.",
      href: null,
      cta: "L3 journey",
    };
  }
  return {
    eyebrow: "L4",
    title: "Continue your advanced journey",
    description: "Your current advanced journey will appear here as L4 content is published.",
    href: null,
    cta: "Current journey",
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
      courseResult,
      interviewResult,
    ] = await Promise.all([
      supabase.from("student_memberships").select("level, is_active").eq("student_id", studentId).maybeSingle(),
      supabase.from("career_profiles").select("id").eq("student_id", studentId).maybeSingle(),
      supabase.from("foundation_resources").select("id").eq("is_active", true),
      supabase.from("student_resource_progress").select("resource_id, status").eq("student_id", studentId),
      supabase.from("l1_courses").select("id").eq("is_active", true).order("sort_order").limit(1).maybeSingle(),
      supabase.from("interviews").select("id", { count: "exact", head: true }).eq("student_id", studentId),
    ]);

    if (
      membershipResult.error ||
      profileResult.error ||
      foundationResult.error ||
      foundationProgressResult.error ||
      courseResult.error ||
      interviewResult.error
    ) {
      setError("Some journey information could not be loaded. Please refresh.");
      setLoading(false);
      return;
    }

    const membership =
      membershipResult.data?.is_active === false ? "free" : (membershipResult.data?.level ?? "free");

    const foundationRows = foundationResult.data ?? [];
    const completedFoundation = (foundationProgressResult.data ?? []).filter(
      (row) => row.status === "completed" && foundationRows.some((resource) => resource.id === row.resource_id),
    ).length;

    let l1: DashboardData["l1"] = {
      coursePublished: Boolean(courseResult.data),
      lessonsTotal: 0,
      lessonsCompleted: 0,
      assignmentsTotal: 0,
      assignmentsSubmitted: 0,
      latestAttempt: null,
    };

    if (courseResult.data) {
      const moduleResult = await supabase
        .from("l1_course_modules")
        .select("id")
        .eq("course_id", courseResult.data.id)
        .eq("is_active", true);

      if (moduleResult.error) {
        setError("Your L1 course structure could not be loaded. Please refresh.");
        setLoading(false);
        return;
      }

      const moduleIds = (moduleResult.data ?? []).map((module) => module.id);

      if (moduleIds.length > 0) {
        const [lessonResult, progressResult, assignmentResult, submissionResult] = await Promise.all([
          supabase.from("l1_course_lessons").select("id").in("module_id", moduleIds).eq("is_active", true),
          supabase.from("student_lesson_progress").select("lesson_id, status").eq("student_id", studentId),
          supabase.from("l1_assignments").select("id").in("module_id", moduleIds).eq("is_active", true).eq("is_required", true),
          supabase.from("l1_assignment_submissions").select("assignment_id").eq("student_id", studentId),
        ]);

        if (lessonResult.error || progressResult.error || assignmentResult.error || submissionResult.error) {
          setError("Some L1 progress data could not be loaded. Please refresh.");
          setLoading(false);
          return;
        }

        const lessonIds = new Set((lessonResult.data ?? []).map((lesson) => lesson.id));
        const assignmentIds = new Set((assignmentResult.data ?? []).map((assignment) => assignment.id));

        l1 = {
          ...l1,
          lessonsTotal: lessonIds.size,
          lessonsCompleted: (progressResult.data ?? []).filter(
            (row) => row.status === "completed" && lessonIds.has(row.lesson_id),
          ).length,
          assignmentsTotal: assignmentIds.size,
          assignmentsSubmitted: new Set(
            (submissionResult.data ?? [])
              .filter((row) => assignmentIds.has(row.assignment_id))
              .map((row) => row.assignment_id),
          ).size,
        };
      }

      const attemptResult = await supabase
        .from("l1_assessment_attempts")
        .select("score, passed, status")
        .eq("student_id", studentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (attemptResult.error) {
        setError("Your latest L1 knowledge-check result could not be loaded. Please refresh.");
        setLoading(false);
        return;
      }

      l1.latestAttempt = attemptResult.data ?? null;
    }

    setData({
      membership,
      profileComplete: Boolean(profileResult.data),
      foundation: { total: foundationRows.length, completed: completedFoundation },
      l1,
      interviews: interviewResult.count ?? 0,
    });
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const firstName = name?.trim().split(/\s+/)[0] || "there";
  const stage = data ? getStage(data.membership) : getStage("free");
  const rank = data ? LEVEL_RANK[data.membership] : 0;

  const foundationProgress = data?.foundation.total
    ? Math.round((data.foundation.completed / data.foundation.total) * 100)
    : 0;

  const l1LearningProgress = data?.l1.lessonsTotal
    ? Math.round((data.l1.lessonsCompleted / data.l1.lessonsTotal) * 100)
    : 0;

  const l1NextAction = useMemo(() => {
    if (!data?.l1.coursePublished) {
      return {
        title: "L1 course is not published yet",
        description: "Your dashboard is ready. An admin needs to publish the L1 course content.",
        href: null,
        label: "Learning content pending",
      };
    }
    if (data.l1.lessonsTotal > data.l1.lessonsCompleted) {
      return {
        title: "Continue your L1 learning",
        description: data.l1.lessonsCompleted + " of " + data.l1.lessonsTotal + " lessons completed.",
        href: "/dashboard/l1-learning",
        label: "Continue learning",
      };
    }
    if (!data.l1.latestAttempt || data.l1.latestAttempt.status !== "submitted") {
      return {
        title: "Take your L1 knowledge check",
        description: "Your learning content is complete enough to use the 20-question knowledge checkpoint.",
        href: "/dashboard/l1-knowledge-check",
        label: "Take knowledge check",
      };
    }
    if (data.l1.latestAttempt.passed === false) {
      return {
        title: "Practice and retake your L1 knowledge check",
        description: "Latest score: " + (data.l1.latestAttempt.score ?? 0) + "%. Review weak areas before trying again.",
        href: "/dashboard/l1-knowledge-check",
        label: "Review knowledge check",
      };
    }
    return {
      title: "Review your L1 knowledge-check result",
      description: "Latest score: " + (data.l1.latestAttempt.score ?? 0) + "%. Your result is a readiness signal and does not automatically change membership.",
      href: "/dashboard/l1-knowledge-check",
      label: "View result",
    };
  }, [data]);

  return (
    <StudentShell
      title={"Welcome back, " + firstName}
      subtitle="Your TLH journey is simple: know your current level, complete the next action, keep your learning moving and record the real interview questions you face."
      membershipLabel={data ? LEVEL_LABEL[data.membership] + " Membership" : "Student workspace"}
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
          <Card><CardContent className="p-10 text-center text-muted-foreground">Loading your TLH journey…</CardContent></Card>
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
                      <Button asChild><a href={stage.href}>{stage.cta}<ArrowRight /></a></Button>
                    ) : (
                      <Button variant="outline" disabled>{stage.cta}</Button>
                    )}
                    <Button variant="ghost" asChild><a href="/dashboard/profile"><UserRound /> View profile</a></Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Current membership</CardTitle></CardHeader>
                <CardContent>
                  <p className="font-heading text-2xl font-bold">{LEVEL_LABEL[data.membership]}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">Your membership determines which journey stage is available to you.</p>
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
                  <Badge variant="outline">Step {Math.min(Math.max(rank, 1), 4)} of 4</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-4">
                  {([
                    { key: "foundation", label: "Free / L0", description: "Foundation reading", stageRank: 1 },
                    { key: "l1", label: "L1 Silver", description: "Learning + knowledge check", stageRank: 2 },
                    { key: "l2", label: "L2 Advanced", description: "Advanced knowledge check", stageRank: 3 },
                    { key: "l3", label: "L3 Career Track", description: "Course + assignments + live sessions", stageRank: 4 },
                  ] as const).map((item) => {
                    const current =
                      (item.key === "foundation" && (data.membership === "free" || data.membership === "l0")) ||
                      (item.key === "l1" && data.membership === "l1") ||
                      (item.key === "l2" && data.membership === "l2") ||
                      (item.key === "l3" && data.membership === "l3");
                    const unlocked = item.key === "foundation" ? true : rank >= item.stageRank;

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
                  {data.membership === "l1" ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{l1NextAction.title}</p>
                          <p className="mt-1 text-sm text-muted-foreground">{l1NextAction.description}</p>
                        </div>
                        {l1NextAction.href && <Button variant="outline" asChild><a href={l1NextAction.href}>{l1NextAction.label}<ArrowRight /></a></Button>}
                      </div>
                      {data.l1.coursePublished && (
                        <div className="mt-5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">L1 lesson progress</span>
                            <span className="font-semibold">{l1LearningProgress}%</span>
                          </div>
                          <Progress value={l1LearningProgress} className="mt-2" />
                        </div>
                      )}
                    </>
                  ) : data.membership === "free" || data.membership === "l0" ? (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{data.foundation.total ? "Complete your foundation reading" : "Foundation reading is being prepared"}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {data.foundation.total
                              ? data.foundation.completed + " of " + data.foundation.total + " assigned resources completed."
                              : "An admin needs to publish the assigned foundation material."}
                          </p>
                        </div>
                        {data.foundation.total > 0 && <Button variant="outline" asChild><a href="/dashboard/foundation">Open foundation<ArrowRight /></a></Button>}
                      </div>
                      {data.foundation.total > 0 && (
                        <div className="mt-5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Foundation progress</span>
                            <span className="font-semibold">{foundationProgress}%</span>
                          </div>
                          <Progress value={foundationProgress} className="mt-2" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div>
                      <p className="font-semibold">Career OS</p>
                      <p className="mt-1 text-sm text-muted-foreground">Review your target role, skill gaps and personalized roadmap.</p>
                      <Button className="mt-4" variant="outline" asChild><a href="/dashboard/career-os"><Map />Open Career OS<ArrowRight /></a></Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="text-base">Career Profile</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">{data.profileComplete ? "Profile created" : "Profile not created"}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Supporting information for your TLH journey.</p>
                    </div>
                    <Badge variant={data.profileComplete ? "default" : "outline"}>{data.profileComplete ? "Ready" : "Pending"}</Badge>
                  </div>
                  <Button className="mt-5" variant="outline" asChild>
                    <a href="/dashboard/profile">{data.profileComplete ? "Review profile" : "Complete profile"}<ArrowRight /></a>
                  </Button>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              {data.membership === "l1" ? (
                <>
                  <Card><CardContent className="p-5"><BookOpen className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold">Learning</p><p className="mt-1 text-xs text-muted-foreground">{data.l1.lessonsCompleted} / {data.l1.lessonsTotal} lessons completed.</p></CardContent></Card>
                  <Card><CardContent className="p-5"><ClipboardCheck className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold">Assignments</p><p className="mt-1 text-xs text-muted-foreground">{data.l1.assignmentsSubmitted} / {data.l1.assignmentsTotal} required assignments submitted.</p></CardContent></Card>
                  <Card><CardContent className="p-5"><CheckCircle2 className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold">Knowledge Check</p><p className="mt-1 text-xs text-muted-foreground">{data.l1.latestAttempt?.status === "submitted" ? "Latest score: " + (data.l1.latestAttempt.score ?? 0) + "%" : "Not completed yet."}</p></CardContent></Card>
                </>
              ) : (
                <>
                  <Card><CardContent className="p-5"><BookOpen className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold">Current journey</p><p className="mt-1 text-xs text-muted-foreground">{stage.eyebrow}</p></CardContent></Card>
                  <Card><CardContent className="p-5"><MessageSquareText className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold">Interview experiences</p><p className="mt-1 text-xs text-muted-foreground">{data.interviews} recorded so far.</p></CardContent></Card>
                  <Card><CardContent className="p-5"><UserRound className="size-5 text-primary" /><p className="mt-3 text-sm font-semibold">Profile</p><p className="mt-1 text-xs text-muted-foreground">{data.profileComplete ? "Supporting profile is ready." : "Complete your supporting profile."}</p></CardContent></Card>
                </>
              )}
            </section>

            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardHeader><div className="flex items-center gap-2"><Map className="size-5 text-primary" /><CardTitle>Career OS</CardTitle></div></CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div><p className="font-semibold">Turn your assessment into a plan.</p><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Review your target role, current skill gaps and the roadmap created for your career journey.</p></div>
                <Button variant="outline" asChild><a href="/dashboard/career-os">Open Career OS<ArrowRight /></a></Button>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/[0.03]">
              <CardHeader>
                <div className="flex items-center gap-2"><MessageSquareText className="size-5 text-primary" /><CardTitle>Interview Experience</CardTitle></div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold">Record the real questions you face.</p>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Record the company, role, round and questions after an interview. Your questions can later be curated into the central TLH question bank.</p>
                </div>
                <Button variant="outline" asChild><a href="/dashboard/interview-questions">Record an interview<ArrowRight /></a></Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly focus</CardTitle>
                <p className="text-sm text-muted-foreground">Keep the dashboard focused on what you can complete now.</p>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {data.membership === "l1" ? (
                  <>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">1. Learn</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Continue the next unfinished L1 lesson.</p></div>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">2. Practice</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Submit required assignments as you complete modules.</p></div>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">3. Check</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Use the knowledge check when you are ready.</p></div>
                  </>
                ) : data.membership === "free" || data.membership === "l0" ? (
                  <>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">1. Read</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Open your assigned foundation material.</p></div>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">2. Complete</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Mark the foundation resource complete after reading it.</p></div>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">3. Explore L1</p><p className="mt-1 text-xs leading-5 text-muted-foreground">L1 access begins when the membership is assigned.</p></div>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">1. Current level</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Follow the journey available to your membership.</p></div>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">2. Interview</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Record real interview experiences whenever they happen.</p></div>
                    <div className="rounded-xl border p-4"><p className="text-sm font-semibold">3. Keep moving</p><p className="mt-1 text-xs leading-5 text-muted-foreground">New journey modules will appear as they are published.</p></div>
                  </>
                )}
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>
    </StudentShell>
  );
}
