import { BookOpen, CheckCircle2, ExternalLink, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Resource = Database["public"]["Tables"]["foundation_resources"]["Row"];
type Progress = Database["public"]["Tables"]["student_resource_progress"]["Row"];
type MembershipLevel = Database["public"]["Enums"]["membership_level"];
const MEMBERSHIP_LABEL: Record<MembershipLevel, string> = { free: "Free", l0: "L0", l1: "L1 Silver", l2: "L2", l3: "L3 Career Track", l4: "L4" };

const statusLabel: Record<Progress["status"], string> = {
  not_started: "Not started",
  in_progress: "In progress",
  completed: "Completed",
};

export function FoundationReadingPage({ membershipLabel }: { membershipLabel?: string }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [resolvedMembershipLabel, setResolvedMembershipLabel] = useState(membershipLabel ?? "Membership");
  const [progress, setProgress] = useState<Record<string, Progress>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
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

    const [membershipResult, resourceResult, progressResult] = await Promise.all([
      supabase.from("student_memberships").select("level, is_active").eq("student_id", userData.user.id).maybeSingle(),
      supabase
        .from("foundation_resources")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("student_resource_progress")
        .select("*")
        .eq("student_id", userData.user.id),
    ]);

    const level = membershipResult.data?.is_active === false ? "free" : (membershipResult.data?.level ?? "free");
    setResolvedMembershipLabel(MEMBERSHIP_LABEL[level]);

    if (resourceResult.error || progressResult.error || membershipResult.error) {
      setError("We could not load your foundation reading. Please refresh.");
    } else {
      setResources(resourceResult.data ?? []);
      setProgress(Object.fromEntries((progressResult.data ?? []).map((item) => [item.resource_id, item])));
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const setStatus = async (resourceId: string, status: Progress["status"]) => {
    setBusyId(resourceId);
    setError(null);

    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Your session expired. Please sign in again.");
      setBusyId(null);
      return;
    }

    const existing = progress[resourceId];
    const now = new Date().toISOString();
    const payload = {
      student_id: userData.user.id,
      resource_id: resourceId,
      status,
      started_at: existing?.started_at ?? now,
      completed_at: status === "completed" ? now : null,
    };

    const { data, error: saveError } = await supabase
      .from("student_resource_progress")
      .upsert(payload, { onConflict: "student_id,resource_id" })
      .select("*")
      .single();

    if (saveError) {
      setError("We could not save your reading progress. Please try again.");
    } else {
      setProgress((current) => ({ ...current, [resourceId]: data }));
    }
    setBusyId(null);
  };

  const completedRequired = resources.filter((resource) => resource.is_required).filter((resource) => progress[resource.id]?.status === "completed").length;
  const requiredTotal = resources.filter((resource) => resource.is_required).length;

  return (
    <StudentShell
      title="Foundation Reading"
      subtitle="Complete the assigned PDF material before moving into the next TLH learning stage. Reading progress is intentionally simple in V1."
      membershipLabel={resolvedMembershipLabel}
    >
      <div className="space-y-6">
        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <Badge variant="outline" className="border-primary/30 text-primary">{membershipLabel}</Badge>
                <h2 className="mt-3 font-heading text-2xl font-bold">Your foundation task</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Read the required material, mark it complete when you have finished, and return to your dashboard for the next step.
                </p>
              </div>
              {requiredTotal > 0 && (
                <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm">
                  <span className="font-semibold">{completedRequired}</span> / {requiredTotal} required
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading your foundation material…</CardContent></Card>
        ) : resources.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookOpen className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-4 font-heading text-xl font-semibold">Foundation material is not published yet</h2>
              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Your journey is ready, but an admin still needs to publish the assigned PDF. Once it is published, it will appear here automatically.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {resources.map((resource) => {
              const item = progress[resource.id];
              const status = item?.status ?? "not_started";
              const busy = busyId === resource.id;
              return (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="size-5 text-primary" />
                          {resource.title}
                        </CardTitle>
                        {resource.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{resource.description}</p>}
                      </div>
                      <Badge variant={status === "completed" ? "default" : "outline"}>
                        {status === "completed" && <CheckCircle2 />}
                        {statusLabel[status]}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      <Button
                        asChild
                        onClick={() => void setStatus(resource.id, status === "not_started" ? "in_progress" : status)}
                      >
                        <a href={resource.resource_url} target="_blank" rel="noreferrer">
                          Open PDF
                          <ExternalLink />
                        </a>
                      </Button>
                      {status !== "completed" && (
                        <Button variant="outline" onClick={() => void setStatus(resource.id, "completed")} disabled={busy}>
                          <CheckCircle2 />
                          Mark as completed
                        </Button>
                      )}
                      {status === "completed" && (
                        <Button variant="outline" onClick={() => void setStatus(resource.id, "in_progress")} disabled={busy}>
                          Mark as in progress
                        </Button>
                      )}
                    </div>
                    {resource.is_required && <p className="mt-3 text-xs text-muted-foreground">Required for the Free/L0 foundation journey.</p>}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold">Next stage</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              After the foundation material is complete, L1 Silver is the video-learning stage. The L1 knowledge check will be added in the next journey module.
            </p>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
