import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileWarning,
  MessageSquareText,
  RefreshCw,
  ShieldOff,
  Target,
  UserPlus,
  ShieldCheck,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MembershipLevel = Database["public"]["Enums"]["membership_level"];

/** Same tier names the Leader dashboard shows. */
const TIERS: Array<{ level: MembershipLevel; label: string }> = [
  { level: "free", label: "Free" },
  { level: "l0", label: "Bronz" },
  { level: "l1", label: "Silver" },
  { level: "l2", label: "Gold" },
  { level: "l3", label: "Diamond" },
  { level: "l4", label: "Reserved" },
];

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

type Attention = {
  key: string;
  label: string;
  hint: string;
  count: number | null; // null = could not be loaded
  to: string;
  icon: LucideIcon;
};

type Overview = {
  leaders: number;
  activeLeaders: number;
  newLeaders: number;
  admins: number;
  registrations: number;
  newRegistrations: number;
  distribution: Array<{ label: string; count: number }>;
  attention: Attention[];
};

/** Counts rows matching a query; returns null instead of throwing so one failure never blanks the page. */
async function countOf(query: PromiseLike<{ count: number | null; error: unknown }>) {
  const { count, error } = await query;
  return error ? null : (count ?? 0);
}

async function loadOverview(): Promise<Overview> {
  const weekAgo = new Date(Date.now() - WEEK_MS).toISOString();

  const [
    profilesResult,
    rolesResult,
    careerProfilesResult,
    assessmentsResult,
    openGapsResult,
    membershipsResult,
    registrations,
    newRegistrations,
    pendingReviews,
    uncuratedQuestions,
    interviewStage,
    failedPaymentEvents,
  ] = await Promise.all([
    supabase.from("profiles").select("id, is_blocked, deleted_at, created_at"),
    supabase.from("user_roles").select("user_id, role"),
    supabase.from("career_profiles").select("student_id"),
    supabase.from("career_assessments").select("student_id"),
    supabase.from("career_skill_gaps").select("student_id").eq("status", "open"),
    supabase.from("student_memberships").select("student_id, level, is_active"),
    countOf(
      supabase.from("masterclass_registrations").select("id", { count: "exact", head: true }),
    ),
    countOf(
      supabase
        .from("masterclass_registrations")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekAgo),
    ),
    countOf(
      supabase
        .from("l1_assignment_submissions")
        .select("id", { count: "exact", head: true })
        .in("status", ["submitted", "under_review"]),
    ),
    countOf(
      supabase
        .from("interview_questions")
        .select("id", { count: "exact", head: true })
        .is("question_bank_id", null),
    ),
    countOf(
      supabase
        .from("job_applications")
        .select("id", { count: "exact", head: true })
        .eq("status", "interview"),
    ),
    countOf(
      supabase
        .from("payment_events")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed"),
    ),
  ]);

  const adminIds = new Set(
    (rolesResult.data ?? []).filter((row) => row.role === "admin").map((row) => row.user_id),
  );
  // Leaders = non-admin accounts that are not soft-deleted. Admins also hold the default
  // student role, so counting "student" roles would include them.
  const leaders = (profilesResult.data ?? []).filter(
    (profile) => !adminIds.has(profile.id) && !profile.deleted_at,
  );
  const leaderIds = new Set(leaders.map((leader) => leader.id));
  const activeLeaders = leaders.filter((leader) => !leader.is_blocked);
  const blocked = leaders.length - activeLeaders.length;

  const withProfile = new Set((careerProfilesResult.data ?? []).map((row) => row.student_id));
  const withAssessment = new Set((assessmentsResult.data ?? []).map((row) => row.student_id));
  const withOpenGaps = new Set(
    (openGapsResult.data ?? []).map((row) => row.student_id).filter((id) => leaderIds.has(id)),
  );

  const levelByLeader = new Map(
    (membershipsResult.data ?? [])
      .filter((row) => row.is_active !== false)
      .map((row) => [row.student_id, row.level] as const),
  );
  const distribution = TIERS.map(({ level, label }) => ({
    level,
    label,
    count: activeLeaders.filter((leader) => (levelByLeader.get(leader.id) ?? "free") === level)
      .length,
  }))
    // L4 has no public tier name yet; only show it if someone is on it.
    .filter((tier) => tier.level !== "l4")
    .map(({ label, count }) => ({ label, count }));

  const missingProfiles = careerProfilesResult.error
    ? null
    : activeLeaders.filter((leader) => !withProfile.has(leader.id)).length;
  const missingAssessments = assessmentsResult.error
    ? null
    : activeLeaders.filter((leader) => !withAssessment.has(leader.id)).length;

  return {
    leaders: leaders.length,
    activeLeaders: activeLeaders.length,
    newLeaders: leaders.filter((leader) => leader.created_at >= weekAgo).length,
    admins: adminIds.size,
    registrations: registrations ?? 0,
    newRegistrations: newRegistrations ?? 0,
    distribution,
    attention: [
      {
        key: "reviews",
        label: "Assignments awaiting review",
        hint: "L1 submissions that are submitted or under review",
        count: pendingReviews,
        to: "/admin/l1-learning",
        icon: ClipboardCheck,
      },
      {
        key: "profiles",
        label: "Career profile not started",
        hint: "Active Leaders with no career profile yet",
        count: missingProfiles,
        to: "/admin/students",
        icon: FileWarning,
      },
      {
        key: "assessments",
        label: "Assessment not taken",
        hint: "Active Leaders who have never completed the career assessment",
        count: missingAssessments,
        to: "/admin/assessments",
        icon: Target,
      },
      {
        key: "gaps",
        label: "Leaders with open skill gaps",
        hint: "At least one domain scored below 60",
        count: openGapsResult.error ? null : withOpenGaps.size,
        to: "/admin/career-os",
        icon: AlertTriangle,
      },
      {
        key: "interviews",
        label: "Applications at interview stage",
        hint: "Leaders who may need interview preparation now",
        count: interviewStage,
        to: "/admin/applications",
        icon: BriefcaseBusiness,
      },
      {
        key: "questions",
        label: "Interview questions to curate",
        hint: "Recorded questions not yet linked to the Interview Bank",
        count: uncuratedQuestions,
        to: "/admin/interview-questions",
        icon: MessageSquareText,
      },
      {
        key: "payments",
        label: "Failed payment events",
        hint: "Provider events that could not be processed",
        count: failedPaymentEvents,
        to: "/admin/payments",
        icon: CreditCard,
      },
      {
        key: "blocked",
        label: "Blocked Leaders",
        hint: "Accounts that cannot sign in until unblocked",
        count: profilesResult.error ? null : blocked,
        to: "/admin/students",
        icon: ShieldOff,
      },
    ],
  };
}

export function AdminOverviewPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await loadOverview());
    } catch {
      setError("The overview could not be loaded. Please refresh and try again.");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const needsAttention = (data?.attention ?? []).filter((item) => item.count !== 0);
  const maxTier = Math.max(1, ...(data?.distribution ?? []).map((tier) => tier.count));

  const stats: Array<{ label: string; value: string; detail: string; icon: LucideIcon }> = [
    {
      label: "Active Leaders",
      value: data ? String(data.activeLeaders) : "—",
      detail: data ? `${data.leaders} total, excluding deleted accounts` : "",
      icon: Users,
    },
    {
      label: "New Leaders (7 days)",
      value: data ? String(data.newLeaders) : "—",
      detail: "Accounts created this week",
      icon: UserPlus,
    },
    {
      label: "Masterclass leads",
      value: data ? String(data.registrations) : "—",
      detail: data ? `${data.newRegistrations} in the last 7 days` : "",
      icon: Video,
    },
    {
      label: "Admins",
      value: data ? String(data.admins) : "—",
      detail: "Accounts with admin access",
      icon: ShieldCheck,
    },
  ];

  return (
    <AdminShell
      title="Admin Overview"
      subtitle="What is happening across TLH, who needs attention, and where to act next."
    >
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={loading ? "animate-spin" : ""} />
          Refresh
        </Button>
      </div>

      {error ? (
        <Card className="mt-4 border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 text-sm font-medium text-destructive">{error}</CardContent>
        </Card>
      ) : null}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, detail, icon: Icon }) => (
          <Card key={label} className="border-border/80 bg-card/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-3 font-heading text-3xl font-bold">{loading ? "—" : value}</p>
              {detail && !loading ? (
                <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        {/* Needs attention */}
        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-primary" aria-hidden="true" />
              <h2 className="font-heading text-xl font-bold">Needs attention</h2>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Where the TLH team should act next. Items with nothing pending are hidden.
            </p>

            {loading ? (
              <p className="mt-6 text-sm text-muted-foreground">Checking the platform…</p>
            ) : needsAttention.length === 0 ? (
              <div className="mt-6 flex items-center gap-3 rounded-xl border border-border p-4">
                <CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
                <p className="text-sm font-medium">All clear. Nothing needs attention right now.</p>
              </div>
            ) : (
              <ul className="mt-5 divide-y divide-border rounded-xl border border-border">
                {needsAttention.map(({ key, label, hint, count, to, icon: Icon }) => (
                  <li key={key}>
                    <Link
                      to={to}
                      className="flex min-h-14 items-center gap-4 px-4 py-3 transition-colors hover:bg-muted/50"
                    >
                      <Icon className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold">{label}</span>
                        <span className="block text-xs text-muted-foreground">{hint}</span>
                      </span>
                      <span
                        className={
                          "rounded-full px-2.5 py-1 text-sm font-bold tabular-nums " +
                          (count === null
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/10 text-primary")
                        }
                        title={count === null ? "Could not be loaded" : undefined}
                      >
                        {count === null ? "?" : count}
                      </span>
                      <ArrowRight
                        className="size-4 shrink-0 text-muted-foreground"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Membership distribution */}
        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <h2 className="font-heading text-xl font-bold">Leader journey</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Active Leaders by membership. Leaders without a membership record count as Free.
            </p>
            <ul className="mt-5 space-y-3">
              {(
                data?.distribution ??
                TIERS.slice(0, 5).map((tier) => ({ label: tier.label, count: 0 }))
              ).map((tier) => (
                <li key={tier.label} className="grid grid-cols-[72px_1fr_40px] items-center gap-3">
                  <span className="text-sm font-medium">{tier.label}</span>
                  <span className="h-2.5 overflow-hidden rounded-full bg-muted">
                    <span
                      className="block h-full rounded-full bg-primary transition-[width] duration-500"
                      style={{ width: `${loading ? 0 : (tier.count / maxTier) * 100}%` }}
                    />
                  </span>
                  <span className="text-right text-sm font-semibold tabular-nums">
                    {loading ? "—" : tier.count}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/students">
                  Manage Leaders <ArrowRight />
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/admin/admin-360">Open Admin 360</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
