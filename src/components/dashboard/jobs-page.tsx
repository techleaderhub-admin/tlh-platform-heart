import {
  BriefcaseBusiness,
  Bookmark,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { hasMembership, membershipLabel } from "@/lib/membership-access";

type Application = Database["public"]["Tables"]["job_applications"]["Row"];
type MembershipLevel = Database["public"]["Enums"]["membership_level"];

/**
 * Job Title, Company Name and the posting link are all optional — a post only
 * needs at least one of them. created_by and published_at are new columns the
 * generated Supabase types don't know about yet, so reads and writes on this
 * table go through this local type instead of the stale generated Row/Insert.
 */
type Job = {
  id: string;
  job_title: string | null;
  company_name: string | null;
  job_url: string | null;
  location: string | null;
  employment_type: string | null;
  minimum_membership: MembershipLevel;
  status: string;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
};

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

const STATUS_LABEL: Record<string, string> = {
  pending: "Pending review",
  published: "Published",
  rejected: "Not approved",
  draft: "Draft",
  archived: "Archived",
};

function jobsTable() {
  // Cast at the query boundary only: the real schema already has these columns
  // (migration 20261003170000); the generated types.ts just hasn't caught up.
  return supabase.from("jobs") as unknown as {
    select: (
      columns: string,
    ) => PromiseLike<{ data: Job[] | null; error: { message: string } | null }>;
    insert: (row: Partial<Job>) => PromiseLike<{ error: { message: string } | null }>;
  };
}

function membershipName(level: MembershipLevel) {
  return level === "l0" ? "Bronz" : level === "l1" ? "Silver" : level === "l2" ? "Gold" : "Diamond";
}

export function JobsPage() {
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [membership, setMembership] = useState<MembershipLevel>("free");

  const [form, setForm] = useState({ jobTitle: "", companyName: "", jobUrl: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const userId = userData.user.id;
    const sevenDaysAgo = new Date(Date.now() - SEVEN_DAYS_MS).toISOString();

    const [jobsResult, applicationResult, membershipResult] = await Promise.all([
      jobsTable().select("*"),
      supabase
        .from("job_applications")
        .select("*")
        .eq("student_id", userId)
        .order("updated_at", { ascending: false }),
      supabase
        .from("student_memberships")
        .select("level,is_active")
        .eq("student_id", userId)
        .maybeSingle(),
    ]);
    if (jobsResult.error || applicationResult.error) {
      setMessage("Jobs could not be loaded. Please refresh.");
      return;
    }

    const allVisible = jobsResult.data ?? [];
    // RLS already limits this to published jobs plus the Leader's own submissions;
    // the "last 7 days" board only needs the published ones, newest first.
    const recent = allVisible
      .filter(
        (job) => job.status === "published" && job.published_at && job.published_at >= sevenDaysAgo,
      )
      .sort((a, b) => (b.published_at ?? "").localeCompare(a.published_at ?? ""));
    const mine = allVisible
      .filter((job) => job.created_by === userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    setRecentJobs(recent);
    setMySubmissions(mine);
    setApplications(applicationResult.data ?? []);
    setMembership(
      membershipResult.data?.is_active === false
        ? "free"
        : (membershipResult.data?.level ?? "free"),
    );
    if (!selectedJobId && recent[0]) setSelectedJobId(recent[0].id);
  };

  useEffect(() => {
    void load();
  }, []);

  const selectedJob = recentJobs.find((job) => job.id === selectedJobId) ?? null;
  const selectedApplication = applications.find((item) => item.job_id === selectedJobId) ?? null;
  const selectedJobUnlocked = selectedJob
    ? hasMembership(membership, selectedJob.minimum_membership)
    : false;

  const submitJob = async () => {
    const jobTitle = form.jobTitle.trim();
    const companyName = form.companyName.trim();
    const jobUrl = form.jobUrl.trim();
    if (!jobTitle && !companyName && !jobUrl) {
      setSubmitMessage("Add at least a job title, a company name or a link.");
      return;
    }
    setSubmitting(true);
    setSubmitMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSubmitting(false);
      return;
    }

    const { error } = await jobsTable().insert({
      job_title: jobTitle || null,
      company_name: companyName || null,
      job_url: jobUrl || null,
      status: "pending",
      created_by: userData.user.id,
    });

    if (error) {
      setSubmitMessage("Could not submit this job. " + error.message);
    } else {
      setSubmitMessage(
        "Submitted. The TLH team will review it before it appears on the job board.",
      );
      setForm({ jobTitle: "", companyName: "", jobUrl: "" });
      await load();
    }
    setSubmitting(false);
  };

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
      applied_at:
        status === "applied"
          ? (existing?.applied_at ?? new Date().toISOString())
          : (existing?.applied_at ?? null),
      notes: existing?.notes ?? null,
    };

    const { error } = await supabase
      .from("job_applications")
      .upsert(payload, { onConflict: "student_id,job_id" });

    if (error) setMessage(error.message);
    else {
      setMessage(
        status === "applied"
          ? "Application marked as applied."
          : "Job saved to your application tracker.",
      );
      await load();
    }
    setBusy(false);
  };

  const saveNotes = async () => {
    if (!selectedApplication) return;
    setBusy(true);
    const { error } = await supabase
      .from("job_applications")
      .update({ notes })
      .eq("id", selectedApplication.id);
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
      subtitle="Browse roles published in the last 7 days, or submit one you've found for the TLH team to review."
      membershipLabel={membershipLabel(membership)}
    >
      <div className="space-y-6">
        {message && (
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-4 text-sm">{message}</CardContent>
          </Card>
        )}

        <section className="grid gap-4 lg:grid-cols-[1.1fr_1.9fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <BriefcaseBusiness className="size-5 text-primary" /> Last 7 days
                </CardTitle>
                <Badge variant="outline">{recentJobs.length} roles</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentJobs.map((job) => {
                const application = applications.find((item) => item.job_id === job.id);
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => setSelectedJobId(job.id)}
                    className={
                      "w-full rounded-xl border p-4 text-left transition " +
                      (selectedJobId === job.id
                        ? "border-primary bg-primary/[0.04]"
                        : "border-border hover:border-primary/40")
                    }
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{job.job_title ?? "Role not specified"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {job.company_name ?? "Company not specified"}
                        </p>
                      </div>
                      {application && (
                        <Badge variant={application.status === "applied" ? "default" : "outline"}>
                          {application.status}
                        </Badge>
                      )}
                    </div>
                    {job.minimum_membership !== "free" && (
                      <Badge
                        variant={
                          hasMembership(membership, job.minimum_membership)
                            ? "outline"
                            : "secondary"
                        }
                        className="mt-2"
                      >
                        {hasMembership(membership, job.minimum_membership)
                          ? "Eligible"
                          : `${membershipName(job.minimum_membership)} membership required`}
                      </Badge>
                    )}
                  </button>
                );
              })}
              {recentJobs.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">
                  No roles published in the last 7 days yet. Check back soon, or submit one below.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Job details</CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedJob ? (
                <p className="text-sm text-muted-foreground">Select a role to view its details.</p>
              ) : (
                <div className="space-y-5">
                  <div>
                    <Badge variant="outline" className="border-primary/30 text-primary">
                      Opportunity
                    </Badge>
                    {selectedJob.minimum_membership !== "free" && (
                      <Badge
                        variant={selectedJobUnlocked ? "outline" : "secondary"}
                        className="ml-2"
                      >
                        {selectedJobUnlocked
                          ? "Eligible for your membership"
                          : `${membershipName(selectedJob.minimum_membership)} membership required`}
                      </Badge>
                    )}
                    <h2 className="mt-3 font-heading text-2xl font-bold">
                      {selectedJob.job_title ?? "Role not specified"}
                    </h2>
                    <p className="mt-1 text-lg text-muted-foreground">
                      {selectedJob.company_name ?? "Company not specified"}
                    </p>
                  </div>
                  {(selectedJob.location || selectedJob.employment_type) && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {selectedJob.location && (
                        <div className="rounded-xl border p-4">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="mt-1 font-medium">{selectedJob.location}</p>
                        </div>
                      )}
                      {selectedJob.employment_type && (
                        <div className="rounded-xl border p-4">
                          <p className="text-xs text-muted-foreground">Employment type</p>
                          <p className="mt-1 font-medium">{selectedJob.employment_type}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3">
                    {selectedJob.job_url && (
                      <Button asChild disabled={!selectedJobUnlocked}>
                        <a href={selectedJob.job_url} target="_blank" rel="noreferrer">
                          Open & apply <ExternalLink />
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => void saveOrApply("applied")}
                      disabled={
                        busy || !selectedJobUnlocked || selectedApplication?.status === "applied"
                      }
                    >
                      <CheckCircle2 />{" "}
                      {selectedApplication?.status === "applied" ? "Applied" : "Mark as applied"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => void saveOrApply("saved")}
                      disabled={busy || !selectedJobUnlocked || Boolean(selectedApplication)}
                    >
                      <Bookmark /> {selectedApplication ? "Saved in tracker" : "Save job"}
                    </Button>
                  </div>
                  {selectedApplication && (
                    <div className="rounded-2xl border border-border bg-muted/20 p-4">
                      <p className="font-semibold">Application notes</p>
                      <Textarea
                        className="mt-3 min-h-24"
                        placeholder="Add your preparation notes, recruiter details or next action…"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                      <Button
                        className="mt-3"
                        variant="outline"
                        onClick={() => void saveNotes()}
                        disabled={busy}
                      >
                        Save notes
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Send className="size-5 text-primary" /> Submit a job
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Found a role worth sharing? Add what you have — title, company or a link all work on
              their own. The TLH team reviews every submission before it goes live.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                placeholder="Job title (optional)"
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
              />
              <Input
                placeholder="Company name (optional)"
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
              <Input
                placeholder="Job posting link (optional)"
                value={form.jobUrl}
                onChange={(e) => setForm({ ...form, jobUrl: e.target.value })}
              />
            </div>
            {submitMessage && <p className="text-sm text-muted-foreground">{submitMessage}</p>}
            <Button onClick={() => void submitJob()} disabled={submitting}>
              <Send /> Submit for review
            </Button>

            {mySubmissions.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Clock3 className="size-4 text-muted-foreground" /> Your submissions
                </p>
                {mySubmissions.map((job) => (
                  <div
                    key={job.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {job.job_title ?? job.company_name ?? job.job_url ?? "Untitled submission"}
                      </p>
                      {job.company_name && job.job_title && (
                        <p className="text-xs text-muted-foreground">{job.company_name}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        job.status === "published"
                          ? "default"
                          : job.status === "rejected"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {STATUS_LABEL[job.status] ?? job.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
            <div>
              <p className="font-semibold">Track the full hiring journey</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Applications can be connected to interviews, and interviews can contain the real
                questions you were asked.
              </p>
            </div>
            <Button variant="outline" asChild>
              <a href="/dashboard/applications">Open my applications</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
