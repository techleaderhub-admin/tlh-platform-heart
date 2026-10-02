import { BriefcaseBusiness, ExternalLink, Search, Bookmark, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Job = Database["public"]["Tables"]["jobs"]["Row"];
type Application = Database["public"]["Tables"]["job_applications"]["Row"];

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const [jobResult, applicationResult] = await Promise.all([
      supabase.from("jobs").select("*").order("created_at", { ascending: false }),
      supabase.from("job_applications").select("*").eq("student_id", userData.user.id).order("updated_at", { ascending: false }),
    ]);
    if (jobResult.error || applicationResult.error) {
      setMessage("Jobs could not be loaded. Please refresh.");
      return;
    }
    setJobs(jobResult.data ?? []);
    setApplications(applicationResult.data ?? []);
    if (!selectedJobId && jobResult.data?.[0]) setSelectedJobId(jobResult.data[0].id);
  };

  useEffect(() => { void load(); }, []);

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return jobs.filter((job) =>
      !q || [job.company_name, job.job_title, job.location, job.employment_type, job.source]
        .some((value) => value?.toLowerCase().includes(q))
    );
  }, [jobs, search]);

  const selectedJob = jobs.find((job) => job.id === selectedJobId) ?? null;
  const selectedApplication = applications.find((item) => item.job_id === selectedJobId) ?? null;

  const saveOrApply = async (status: "saved" | "applied") => {
    if (!selectedJob) return;
    setBusy(true);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setBusy(false);
      return;
    }

    const existing = applications.find((item) => item.job_id === selectedJob.id);
    const payload = {
      student_id: userData.user.id,
      job_id: selectedJob.id,
      status,
      applied_at: status === "applied" ? (existing?.applied_at ?? new Date().toISOString()) : existing?.applied_at ?? null,
      notes: existing?.notes ?? null,
    };

    const { error } = await supabase
      .from("job_applications")
      .upsert(payload, { onConflict: "student_id,job_id" });

    if (error) setMessage(error.message);
    else {
      setMessage(status === "applied" ? "Application marked as applied." : "Job saved to your application tracker.");
      await load();
    }
    setBusy(false);
  };

  const saveNotes = async () => {
    if (!selectedApplication) return;
    setBusy(true);
    const { error } = await supabase.from("job_applications").update({ notes }).eq("id", selectedApplication.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Application notes saved.");
      await load();
    }
    setBusy(false);
  };

  useEffect(() => {
    setNotes(selectedApplication?.notes ?? "");
  }, [selectedApplication?.id, selectedApplication?.notes]);

  return (
    <StudentShell
      title="Jobs & Applications"
      subtitle="Discover TLH-managed opportunities, save roles you want to pursue and keep your application status connected to your interview journey."
      membershipLabel="Jobs workspace"
    >
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <section className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base"><BriefcaseBusiness className="size-5 text-primary" /> Job board</CardTitle>
                <Badge variant="outline">{filteredJobs.length} roles</Badge>
              </div>
              <div className="relative mt-2"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search company, role, location…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            </CardHeader>
            <CardContent className="space-y-2">
              {filteredJobs.map((job) => {
                const application = applications.find((item) => item.job_id === job.id);
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    className={"w-full rounded-xl border p-4 text-left transition " + (selectedJobId === job.id ? "border-primary bg-primary/[0.04]" : "border-border hover:border-primary/40")}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div><p className="font-semibold">{job.job_title}</p><p className="mt-1 text-sm text-muted-foreground">{job.company_name}</p></div>
                      {application && <Badge variant={application.status === "applied" ? "default" : "outline"}>{application.status}</Badge>}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{job.location ?? "Location flexible"} · {job.employment_type ?? "Type not specified"}</p>
                  </button>
                );
              })}
              {filteredJobs.length === 0 && <p className="p-4 text-sm text-muted-foreground">No jobs match your search. Admin-published roles will appear here.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Job details</CardTitle></CardHeader>
            <CardContent>
              {!selectedJob ? (
                <p className="text-sm text-muted-foreground">Select a role to view its details.</p>
              ) : (
                <div className="space-y-5">
                  <div>
                    <Badge variant="outline" className="border-primary/30 text-primary">Opportunity</Badge>
                    <h2 className="mt-3 font-heading text-2xl font-bold">{selectedJob.job_title}</h2>
                    <p className="mt-1 text-lg text-muted-foreground">{selectedJob.company_name}</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Location</p><p className="mt-1 font-medium">{selectedJob.location ?? "Not specified"}</p></div>
                    <div className="rounded-xl border p-4"><p className="text-xs text-muted-foreground">Employment type</p><p className="mt-1 font-medium">{selectedJob.employment_type ?? "Not specified"}</p></div>
                    <div className="rounded-xl border p-4 sm:col-span-2"><p className="text-xs text-muted-foreground">Source</p><p className="mt-1 font-medium">{selectedJob.source ?? "TLH"}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button onClick={() => void saveOrApply("applied")} disabled={busy || selectedApplication?.status === "applied"}><CheckCircle2 /> {selectedApplication?.status === "applied" ? "Applied" : "Mark as applied"}</Button>
                    <Button variant="outline" onClick={() => void saveOrApply("saved")} disabled={busy || Boolean(selectedApplication)}><Bookmark /> {selectedApplication ? "Saved in tracker" : "Save job"}</Button>
                    {selectedJob.job_url && <Button variant="ghost" asChild><a href={selectedJob.job_url} target="_blank" rel="noreferrer">Open posting <ExternalLink /></a></Button>}
                  </div>
                  {selectedApplication && (
                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                      <p className="font-semibold">Application notes</p>
                      <Textarea className="mt-3 min-h-24" placeholder="Add your preparation notes, recruiter details or next action…" value={notes} onChange={(e) => setNotes(e.target.value)} />
                      <Button className="mt-3" variant="outline" onClick={() => void saveNotes()} disabled={busy}>Save notes</Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div><p className="font-semibold">Track the full hiring journey</p><p className="mt-1 text-sm text-muted-foreground">Applications can be connected to interviews, and interviews can contain the real questions you were asked.</p></div>
            <Button variant="outline" asChild><a href="/dashboard/applications">Open my applications</a></Button>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
