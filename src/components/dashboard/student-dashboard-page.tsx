import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  MessageSquareText,
  RefreshCw,
  Target,
  UserRound,
} from "lucide-react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MembershipLevel = Database["public"]["Enums"]["membership_level"];

const LEVEL_RANK: Record<MembershipLevel, number> = {
  free: 0,
  l0: 1,
  l1: 2,
  l2: 3,
  l3: 4,
  l4: 5,
};

const LEVEL_LABEL: Record<MembershipLevel, string> = {
  free: "Free",
  l0: "L0",
  l1: "L1",
  l2: "L2",
  l3: "L3",
  l4: "L4",
};

type ModuleCard = {
  title: string;
  description: string;
  minimumLevel: MembershipLevel;
  icon: typeof UserRound;
  status: string;
};

const modules: ModuleCard[] = [
  {
    title: "Career Profile",
    description: "Build the profile that will power your TLH career workflows.",
    minimumLevel: "free",
    icon: UserRound,
    status: "Foundation",
  },
  {
    title: "Learning Workspace",
    description: "Access your learning path and track progress as programs are connected.",
    minimumLevel: "l0",
    icon: BookOpen,
    status: "Coming next",
  },
  {
    title: "Interview Workspace",
    description: "Capture interview question sets, answers and review progress.",
    minimumLevel: "l1",
    icon: MessageSquareText,
    status: "Coming next",
  },
  {
    title: "Job Applications",
    description: "Track target roles, applications and interview stages in one place.",
    minimumLevel: "l1",
    icon: BriefcaseBusiness,
    status: "Coming next",
  },
  {
    title: "Career Assessments",
    description: "Review assessment results, gaps and recommended next actions.",
    minimumLevel: "l0",
    icon: ClipboardCheck,
    status: "Coming next",
  },
  {
    title: "Coaching Workspace",
    description: "Reserved for higher membership levels and future coaching workflows.",
    minimumLevel: "l2",
    icon: Target,
    status: "Coming next",
  },
];

export function StudentDashboardPage({ name }: { name: string | null }) {
  const [membership, setMembership] = useState<MembershipLevel>("free");
  const [profileComplete, setProfileComplete] = useState(false);
  const [roadmapCount, setRoadmapCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [interviewCount, setInterviewCount] = useState(0);
  const [assessmentCount, setAssessmentCount] = useState(0);
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
    const [membershipResult, profileResult, roadmapResult, applicationResult, interviewResult, assessmentResult] =
      await Promise.all([
        supabase.from("student_memberships").select("level, is_active").eq("student_id", studentId).maybeSingle(),
        supabase.from("career_profiles").select("id").eq("student_id", studentId).maybeSingle(),
        supabase.from("career_roadmaps").select("id", { count: "exact", head: true }).eq("student_id", studentId),
        supabase.from("job_applications").select("id", { count: "exact", head: true }).eq("student_id", studentId),
        supabase.from("interviews").select("id", { count: "exact", head: true }).eq("student_id", studentId),
        supabase.from("career_assessments").select("id", { count: "exact", head: true }).eq("student_id", studentId),
      ]);

    if (membershipResult.error || profileResult.error || roadmapResult.error || applicationResult.error || interviewResult.error || assessmentResult.error) {
      setError("Some dashboard data could not be loaded. Please refresh and try again.");
    }

    const activeMembership = membershipResult.data?.is_active === false ? "free" : (membershipResult.data?.level ?? "free");
    setMembership(activeMembership);
    setProfileComplete(Boolean(profileResult.data));
    setRoadmapCount(roadmapResult.count ?? 0);
    setApplicationCount(applicationResult.count ?? 0);
    setInterviewCount(interviewResult.count ?? 0);
    setAssessmentCount(assessmentResult.count ?? 0);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const rank = LEVEL_RANK[membership];
  const profileProgress = profileComplete ? 100 : 0;
  const firstName = name?.trim().split(/\s+/)[0] || "there";

  return (
    <StudentShell
      title={"Welcome back, " + firstName}
      subtitle="Your TLH career workspace starts here. Your membership level controls which platform capabilities are available to your account."
      membershipLabel={LEVEL_LABEL[membership] + " Membership"}
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Membership</span>
                <Badge variant="outline">{LEVEL_LABEL[membership]}</Badge>
              </div>
              <p className="mt-3 font-heading text-2xl font-bold">{LEVEL_LABEL[membership]}</p>
              <p className="mt-1 text-xs text-muted-foreground">Current access level</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <span className="text-sm text-muted-foreground">Career Profile</span>
              <p className="mt-3 font-heading text-2xl font-bold">{profileProgress}%</p>
              <Progress value={profileProgress} className="mt-3 h-2" />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <span className="text-sm text-muted-foreground">Applications</span>
              <p className="mt-3 font-heading text-2xl font-bold">{loading ? "—" : applicationCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Tracked applications</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <span className="text-sm text-muted-foreground">Interviews</span>
              <p className="mt-3 font-heading text-2xl font-bold">{loading ? "—" : interviewCount}</p>
              <p className="mt-1 text-xs text-muted-foreground">Tracked interviews</p>
            </CardContent>
          </Card>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-primary/[0.03]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-5 text-primary" />
                <p className="font-semibold">Your TLH access is membership-driven</p>
              </div>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                You currently have {LEVEL_LABEL[membership]} access. Higher-level capabilities stay locked until an admin assigns the corresponding membership.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-background px-5 py-4 text-center">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Access level</p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">{LEVEL_LABEL[membership]}</p>
            </div>
          </CardContent>
        </Card>

        <section>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-heading text-xl font-bold">Your workspace</h2>
              <p className="mt-1 text-sm text-muted-foreground">Capabilities are shown according to your current membership.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {modules.map((module) => {
              const Icon = module.icon;
              const unlocked = rank >= LEVEL_RANK[module.minimumLevel];

              return (
                <Card key={module.title} className={unlocked ? "border-border" : "border-border/70 bg-muted/20"}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border border-border bg-muted/40">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      {unlocked ? (
                        <Badge variant="outline" className="border-primary/30 text-primary">
                          Available
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="gap-1 text-muted-foreground">
                          <LockKeyhole className="size-3" />
                          Requires {LEVEL_LABEL[module.minimumLevel]}
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="pt-1 text-lg">{module.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="min-h-12 text-sm leading-6 text-muted-foreground">{module.description}</p>
                    <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                      <span className="text-xs text-muted-foreground">{module.status}</span>
                      {module.title === "Career Profile" ? (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/dashboard/profile">
                            <ArrowRight />
                            Open profile
                          </Link>
                        </Button>
                      ) : module.title === "Career Assessments" && unlocked ? (
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/dashboard/assessment">
                            <ArrowRight />
                            Take assessment
                          </Link>
                        </Button>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground">
                          {unlocked ? "Access will be connected next" : "Locked"}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Career activity</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Roadmaps</p>
                <p className="mt-1 text-xl font-bold">{loading ? "—" : roadmapCount}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Interviews</p>
                <p className="mt-1 text-xl font-bold">{loading ? "—" : interviewCount}</p>
              </div>
              <div className="rounded-lg bg-muted/30 p-3 text-center">
                <p className="text-xs text-muted-foreground">Assessments</p>
                <p className="mt-1 text-xl font-bold">{loading ? "—" : assessmentCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Next step</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                {profileComplete
                  ? "Your career profile is created. The next platform modules will build on this foundation."
                  : "Complete your career profile first. It will become the foundation for assessments, roadmap and career workflows."}
              </p>
              <Button className="mt-4" variant="outline" asChild>
                <Link to="/dashboard/profile">
                  {profileComplete ? "Review career profile" : "Build career profile"}
                  <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </StudentShell>
  );
}
