import { ArrowRight, BookOpen, CheckCircle2, LockKeyhole, MessageSquareText, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MembershipLevel = Database["public"]["Enums"]["membership_level"];

const LEVELS: MembershipLevel[] = ["free", "l0", "l1", "l2", "l3"];
const LEVEL_LABEL: Record<MembershipLevel, string> = {
  free: "Free",
  l0: "L0",
  l1: "L1 Silver",
  l2: "L2",
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

function journeyTitle(level: MembershipLevel) {
  if (level === "free" || level === "l0") return "Complete your foundation reading";
  if (level === "l1") return "Complete your L1 knowledge check";
  if (level === "l2") return "Complete your L2 knowledge check";
  if (level === "l3") return "Continue your weekly L3 career track";
  return "Continue your L4 journey";
}

function journeyDescription(level: MembershipLevel) {
  if (level === "free" || level === "l0") return "Read the assigned foundation material. Video learning starts with L1 Silver Membership.";
  if (level === "l1") return "Check what you know across Kotlin, Android fundamentals, Jetpack and application development. Compose is not part of L1.";
  if (level === "l2") return "Check your advanced Android, Kotlin, architecture and production-development knowledge.";
  if (level === "l3") return "Keep the weekly rhythm: course progress, assignments, live session attendance and interview-question recording.";
  return "Continue the advanced career journey assigned to your membership.";
}

function journeyCta(level: MembershipLevel) {
  if (level === "free" || level === "l0") return "Foundation reading";
  if (level === "l1") return "L1 knowledge check";
  if (level === "l2") return "L2 knowledge check";
  if (level === "l3") return "Weekly journey";
  return "Current journey";
}

export function StudentDashboardPage({ name }: { name: string | null }) {
  const [membership, setMembership] = useState<MembershipLevel>("free");
  const [profileComplete, setProfileComplete] = useState(false);
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
    const [membershipResult, profileResult] = await Promise.all([
      supabase.from("student_memberships").select("level, is_active").eq("student_id", studentId).maybeSingle(),
      supabase.from("career_profiles").select("id").eq("student_id", studentId).maybeSingle(),
    ]);

    if (membershipResult.error || profileResult.error) {
      setError("Some journey information could not be loaded. Please refresh and try again.");
    }

    const activeMembership =
      membershipResult.data?.is_active === false
        ? "free"
        : (membershipResult.data?.level ?? "free");

    setMembership(activeMembership);
    setProfileComplete(Boolean(profileResult.data));
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const rank = LEVEL_RANK[membership];
  const firstName = name?.trim().split(/\s+/)[0] || "there";
  const currentJourneyIndex = Math.min(
    Math.max(LEVELS.findIndex((level) => LEVEL_RANK[level] >= rank), 0),
    LEVELS.length - 1,
  );

  const journeyProgress = useMemo(() => {
    if (membership === "free") return 0;
    if (membership === "l0") return 25;
    if (membership === "l1") return 50;
    if (membership === "l2") return 75;
    return 100;
  }, [membership]);

  return (
    <StudentShell
      title={"Welcome back, " + firstName}
      subtitle="Your TLH dashboard keeps the journey simple: know your level, complete the next action, keep your weekly rhythm and record your real interview experience."
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

        <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <Card className="overflow-hidden border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <Badge variant="outline" className="border-primary/30 text-primary">
                    Current level · {LEVEL_LABEL[membership]}
                  </Badge>
                  <h2 className="mt-4 font-heading text-2xl font-bold sm:text-3xl">
                    {journeyTitle(membership)}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {journeyDescription(membership)}
                  </p>
                </div>
                <div className="rounded-2xl border border-border bg-background px-5 py-4 text-center">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Journey</p>
                  <p className="mt-1 text-2xl font-bold text-primary">{journeyProgress}%</p>
                </div>
              </div>
              <Progress value={journeyProgress} className="mt-6 h-2" />
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Button variant="outline" disabled>
                  {journeyCta(membership)}
                  <ArrowRight />
                </Button>
                <span className="text-xs text-muted-foreground">This action will connect when the next journey module is built.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile foundation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{profileComplete ? "Career profile created" : "Career profile not created yet"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {profileComplete ? "Your profile is available for future journey features." : "Your profile is supporting information, not a separate career roadmap."}
                  </p>
                </div>
                <Badge variant={profileComplete ? "default" : "outline"}>
                  {profileComplete ? "Ready" : "Pending"}
                </Badge>
              </div>
              <Button className="mt-5" variant="outline" asChild>
                <a href="/dashboard/profile">
                  {profileComplete ? "Review profile" : "Complete profile"}
                  <ArrowRight />
                </a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>Your TLH Journey</CardTitle>
            <p className="text-sm text-muted-foreground">Your membership determines the journey stage available to you.</p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-5">
              {LEVELS.map((level, index) => {
                const unlocked = rank >= LEVEL_RANK[level];
                const current = level === membership;
                return (
                  <div
                    key={level}
                    className={
                      "rounded-xl border p-4 " +
                      (current
                        ? "border-primary bg-primary/[0.06]"
                        : unlocked
                          ? "border-border"
                          : "border-border/60 bg-muted/20")
                    }
                  >
                    <div className="flex items-center justify-between gap-2">
                      {unlocked ? (
                        <CheckCircle2 className="size-5 text-primary" />
                      ) : (
                        <LockKeyhole className="size-4 text-muted-foreground" />
                      )}
                      <span className="text-xs text-muted-foreground">Step {index + 1}</span>
                    </div>
                    <p className="mt-3 font-semibold">{LEVEL_LABEL[level]}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {level === "free" || level === "l0"
                        ? "Foundation reading"
                        : level === "l1"
                          ? "Android fundamentals check"
                          : level === "l2"
                            ? "Advanced knowledge check"
                            : level === "l3"
                              ? "Course + assignments + live sessions"
                              : "Advanced journey"}
                    </p>
                    {current && <Badge className="mt-3">Current</Badge>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="size-5 text-primary" />
                <CardTitle className="text-base">This Week</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="size-2 rounded-full bg-muted-foreground" />
                <div><p className="text-sm font-medium">Course / reading</p><p className="text-xs text-muted-foreground">Weekly completion tracking will be connected to the learning module.</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="size-2 rounded-full bg-muted-foreground" />
                <div><p className="text-sm font-medium">Assignment</p><p className="text-xs text-muted-foreground">Submission tracking will be connected to the program module.</p></div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <span className="size-2 rounded-full bg-muted-foreground" />
                <div><p className="text-sm font-medium">Weekly live session</p><p className="text-xs text-muted-foreground">You will confirm attendance after each live session.</p></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquareText className="size-5 text-primary" />
                <CardTitle className="text-base">Interview Experience</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-muted-foreground">
                Whenever you attend an interview, record the company, role, date, round, result and every question you remember. You will later be able to search and filter your interview history.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button variant="outline" disabled>
                  Record an interview
                  <ArrowRight />
                </Button>
                <span className="self-center text-xs text-muted-foreground">Interview workspace coming next</span>
              </div>
            </CardContent>
          </Card>
        </section>

        <Card className="border-border/80">
          <CardContent className="p-5 sm:p-6">
            <p className="text-sm font-semibold">V1 dashboard principle</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              TLH will not ask you to manage a complicated career roadmap here. The dashboard focuses on your current membership, one next action, weekly participation and your real interview experience.
            </p>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
