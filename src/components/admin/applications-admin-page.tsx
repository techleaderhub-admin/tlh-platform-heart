import { ClipboardList, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Application = Database["public"]["Tables"]["job_applications"]["Row"];
type Job = Database["public"]["Tables"]["jobs"]["Row"];
type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
const statuses: Database["public"]["Enums"]["application_status"][] = ["saved", "applied", "screening", "interview", "offer", "rejected", "withdrawn"];

export function ApplicationsAdminPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [interviewCounts, setInterviewCounts] = useState<Record<string, number>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const [appResult, jobResult, profileResult, interviewResult] = await Promise.all([
      supabase.from("job_applications").select("*").order("updated_at", { ascending: false }),
      supabase.from("jobs").select("*"),
      supabase.from("profiles").select("*"),
      supabase.from("interviews").select("id,job_application_id"),
    ]);
    if (appResult.error || jobResult.error || profileResult.error || interviewResult.error) {
      setMessage("Application administration data could not be loaded.");
      return;
    }
    setApplications(appResult.data ?? []);
    setJobs(Object.fromEntries((jobResult.data ?? []).map((job) => [job.id, job])));
    setProfiles(Object.fromEntries((profileResult.data ?? []).map((profile) => [profile.id, profile])));
    const counts: Record<string, number> = {};
    (interviewResult.data ?? []).forEach((item) => { if (item.job_application_id) counts[item.job_application_id] = (counts[item.job_application_id] ?? 0) + 1; });
    setInterviewCounts(counts);
    setNotes(Object.fromEntries((appResult.data ?? []).map((app) => [app.id, app.notes ?? ""])));
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      const job = jobs[app.job_id];
      const student = profiles[app.student_id];
      const statusMatch = statusFilter === "all" || app.status === statusFilter;
      const searchMatch = !q || [job?.company_name, job?.job_title, student?.full_name, student?.email].some((value) => value?.toLowerCase().includes(q));
      return statusMatch && searchMatch;
    });
  }, [applications, jobs, profiles, search, statusFilter]);

  const updateStatus = async (application: Application, status: Database["public"]["Enums"]["application_status"]) => {
    setBusy(application.id);
    const { error } = await supabase.from("job_applications").update({
      status,
      applied_at: status === "saved" ? application.applied_at : (application.applied_at ?? new Date().toISOString()),
    }).eq("id", application.id);
    if (error) setMessage(error.message);
    else { setMessage("Application updated."); await load(); }
    setBusy(null);
  };

  const saveNotes = async (application: Application) => {
    setBusy(application.id);
    const { error } = await supabase.from("job_applications").update({ notes: notes[application.id] ?? "" }).eq("id", application.id);
    if (error) setMessage(error.message);
    else { setMessage("Admin notes saved."); await load(); }
    setBusy(null);
  };

  return (
    <AdminShell title="Application Oversight" subtitle="Central view of every Leader's saved roles, applications, statuses, notes and linked interview activity.">
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}
        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Applications</p><p className="mt-1 text-2xl font-bold">{applications.length}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">In interview stage</p><p className="mt-1 text-2xl font-bold">{applications.filter((item) => item.status === "interview").length}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Offers</p><p className="mt-1 text-2xl font-bold">{applications.filter((item) => item.status === "offer").length}</p></CardContent></Card>
        </section>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle className="flex items-center gap-2"><ClipboardList className="size-5 text-primary" /> All Leader applications</CardTitle><p className="mt-1 text-sm text-muted-foreground">Search by leader, company or role and update the tracked status.</p></div>
              <div className="flex flex-wrap gap-2">
                <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search leader, company, role…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filtered.map((application) => {
              const job = jobs[application.job_id];
              const student = profiles[application.student_id];
              return (
                <div key={application.id} className="rounded-2xl border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div><p className="font-semibold">{job?.job_title ?? "Unknown job"}</p><p className="mt-1 text-sm text-muted-foreground">{job?.company_name ?? "Unknown company"} · {student?.full_name ?? "Unknown leader"}{student?.email ? " · " + student.email : ""}</p></div>
                    <Badge>{application.status}</Badge>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">{statuses.map((status) => <Button key={status} size="sm" variant={application.status === status ? "default" : "outline"} disabled={busy === application.id} onClick={() => void updateStatus(application, status)}>{status}</Button>)}</div>
                  <p className="mt-4 text-xs text-muted-foreground">Linked interviews: {interviewCounts[application.id] ?? 0}</p>
                  <Textarea className="mt-3 min-h-20" value={notes[application.id] ?? ""} onChange={(e) => setNotes((current) => ({ ...current, [application.id]: e.target.value }))} placeholder="Admin notes…" />
                  <Button className="mt-2" size="sm" variant="outline" disabled={busy === application.id} onClick={() => void saveNotes(application)}>Save notes</Button>
                </div>
              );
            })}
            {filtered.length === 0 && <p className="p-5 text-sm text-muted-foreground">No applications match the current filters.</p>}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
