import { useEffect, useState } from "react";
import { ArrowLeft, BriefcaseBusiness } from "lucide-react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Job = Database["public"]["Tables"]["jobs"]["Row"];
type Application = Database["public"]["Tables"]["job_applications"]["Row"];

const statuses: Database["public"]["Enums"]["application_status"][] = ["saved", "applied", "screening", "interview", "offer", "rejected", "withdrawn"];

export function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [jobs, setJobs] = useState<Record<string, Job>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const [appResult, jobResult] = await Promise.all([
      supabase.from("job_applications").select("*").eq("student_id", userData.user.id).order("updated_at", { ascending: false }),
      supabase.from("jobs").select("*"),
    ]);
    if (appResult.error || jobResult.error) {
      setMessage("Application data could not be loaded.");
      return;
    }
    setApplications(appResult.data ?? []);
    setJobs(Object.fromEntries((jobResult.data ?? []).map((job) => [job.id, job])));
    setNotes(Object.fromEntries((appResult.data ?? []).map((app) => [app.id, app.notes ?? ""])));
  };

  useEffect(() => { void load(); }, []);

  const updateApplication = async (application: Application, status: Database["public"]["Enums"]["application_status"]) => {
    setBusy(application.id);
    const { error } = await supabase.from("job_applications").update({
      status,
      applied_at: status === "saved" ? application.applied_at : (application.applied_at ?? new Date().toISOString()),
    }).eq("id", application.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Application status updated.");
      await load();
    }
    setBusy(null);
  };

  const saveNotes = async (application: Application) => {
    setBusy(application.id);
    const { error } = await supabase.from("job_applications").update({ notes: notes[application.id] ?? "" }).eq("id", application.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Notes saved.");
      await load();
    }
    setBusy(null);
  };

  return (
    <StudentShell title="My Applications" subtitle="Keep every saved role, application status and preparation note in one place." membershipLabel="Application tracker">
      <div className="space-y-5">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}
        <Button variant="outline" asChild><a href="/dashboard/jobs"><ArrowLeft /> Back to jobs</a></Button>
        {applications.map((application) => {
          const job = jobs[application.job_id];
          return (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><CardTitle className="flex items-center gap-2 text-base"><BriefcaseBusiness className="size-5 text-primary" />{job?.job_title ?? "Job no longer available"}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{job?.company_name ?? "Unknown company"} · {job?.location ?? "Location not specified"}</p></div>
                  <Badge>{application.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => <Button key={status} size="sm" variant={application.status === status ? "default" : "outline"} disabled={busy === application.id} onClick={() => void updateApplication(application, status)}>{status}</Button>)}
                </div>
                <div>
                  <p className="text-sm font-medium">Notes</p>
                  <Textarea className="mt-2 min-h-24" value={notes[application.id] ?? ""} onChange={(e) => setNotes((current) => ({ ...current, [application.id]: e.target.value }))} placeholder="Preparation notes, recruiter details, next steps…" />
                  <Button className="mt-2" variant="outline" disabled={busy === application.id} onClick={() => void saveNotes(application)}>Save notes</Button>
                </div>
                {job?.job_url && <Button variant="ghost" asChild><a href={job.job_url} target="_blank" rel="noreferrer">Open original job posting</a></Button>}
              </CardContent>
            </Card>
          );
        })}
        {applications.length === 0 && <Card><CardContent className="p-8 text-center"><p className="font-semibold">No applications yet.</p><p className="mt-1 text-sm text-muted-foreground">Open the job board and save a role or mark one as applied.</p><Button className="mt-4" asChild><a href="/dashboard/jobs">Browse jobs</a></Button></CardContent></Card>}
      </div>
    </StudentShell>
  );
}
