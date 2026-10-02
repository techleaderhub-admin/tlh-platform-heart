import { ClipboardCheck, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Assessment = Database["public"]["Tables"]["career_assessments"]["Row"];
type SkillGap = Database["public"]["Tables"]["career_skill_gaps"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const statuses = ["open", "developing", "strength", "in_progress", "resolved"];

export function CareerAssessmentsAdminPage() {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [gaps, setGaps] = useState<SkillGap[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const [assessmentResult, gapResult, profileResult] = await Promise.all([
      supabase.from("career_assessments").select("*").order("created_at", { ascending: false }),
      supabase.from("career_skill_gaps").select("*").order("last_assessed_at", { ascending: false }),
      supabase.from("profiles").select("*"),
    ]);
    if (assessmentResult.error || gapResult.error || profileResult.error) {
      setMessage("Assessment data could not be loaded.");
      return;
    }
    setAssessments(assessmentResult.data ?? []);
    setGaps(gapResult.data ?? []);
    setProfiles(Object.fromEntries((profileResult.data ?? []).map((profile) => [profile.id, profile])));
  };

  useEffect(() => { void load(); }, []);

  const latestByStudent = useMemo(() => {
    const result: Record<string, Assessment> = {};
    assessments.forEach((assessment) => {
      if (!result[assessment.student_id]) result[assessment.student_id] = assessment;
    });
    return result;
  }, [assessments]);

  const filteredGaps = useMemo(() => {
    const q = search.trim().toLowerCase();
    return gaps.filter((gap) => {
      const student = profiles[gap.student_id];
      const statusMatch = statusFilter === "all" || gap.status === statusFilter;
      const searchMatch = !q || [student?.full_name, gap.domain, gap.recommendation]
        .some((value) => value?.toLowerCase().includes(q));
      return statusMatch && searchMatch;
    });
  }, [gaps, profiles, search, statusFilter]);

  const updateStatus = async (gap: SkillGap, status: string) => {
    setBusy(gap.id);
    const { error } = await supabase.from("career_skill_gaps").update({ status }).eq("id", gap.id);
    if (error) setMessage(error.message);
    else { setMessage("Skill-gap status updated."); await load(); }
    setBusy(null);
  };

  return (
    <AdminShell title="Career Assessments" subtitle="Review Leader assessment baselines and maintain the current skill-gap snapshot that will feed Career OS.">
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Assessments</p><p className="mt-1 text-2xl font-bold">{assessments.length}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Leaders assessed</p><p className="mt-1 text-2xl font-bold">{Object.keys(latestByStudent).length}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Open / developing gaps</p><p className="mt-1 text-2xl font-bold">{gaps.filter((gap) => gap.status === "open" || gap.status === "developing").length}</p></CardContent></Card>
        </section>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle className="flex items-center gap-2"><ClipboardCheck className="size-5 text-primary" /> Skill-gap tracker</CardTitle><p className="mt-1 text-sm text-muted-foreground">One current domain snapshot per Leader, with status that can be maintained by the admin team.</p></div>
              <div className="flex flex-wrap gap-2">
                <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search leader or domain…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredGaps.map((gap) => {
              const student = profiles[gap.student_id];
              return (
                <div key={gap.id} className="rounded-2xl border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{student?.full_name ?? "Unknown leader"}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{gap.domain}</p>
                    </div>
                    <Badge>{gap.score ?? 0}% · {gap.status}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{gap.recommendation ?? "No recommendation recorded."}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {statuses.map((status) => (
                      <Button key={status} size="sm" variant={gap.status === status ? "default" : "outline"} disabled={busy === gap.id} onClick={() => void updateStatus(gap, status)}>
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
            {filteredGaps.length === 0 && <p className="p-5 text-sm text-muted-foreground">No skill-gap records match the current filters. Leader records will appear after an assessment is saved.</p>}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
