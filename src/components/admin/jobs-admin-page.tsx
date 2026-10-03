import { BriefcaseBusiness, Check, Clock3, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

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
  status: string;
  created_by: string | null;
  published_at: string | null;
  created_at: string;
};

type Submitter = { id: string; full_name: string | null };

function jobsTable() {
  // Cast at the query boundary only: the real schema already has these columns
  // (migration 20261003170000); the generated types.ts just hasn't caught up.
  return supabase.from("jobs") as unknown as {
    select: (
      columns: string,
    ) => PromiseLike<{ data: Job[] | null; error: { message: string } | null }>;
    insert: (row: Partial<Job>) => PromiseLike<{ error: { message: string } | null }>;
    update: (row: Partial<Job>) => {
      eq: (column: string, value: string) => PromiseLike<{ error: { message: string } | null }>;
    };
    delete: () => {
      eq: (column: string, value: string) => PromiseLike<{ error: { message: string } | null }>;
    };
  };
}

const emptyForm = { company_name: "", job_title: "", job_url: "" };

export function JobsAdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [submitters, setSubmitters] = useState<Record<string, Submitter>>({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await jobsTable().select("*");
    if (error) {
      setMessage(error.message);
      return;
    }
    const all = (data ?? []).slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
    setJobs(all);

    const submitterIds = Array.from(
      new Set(all.map((job) => job.created_by).filter((id): id is string => Boolean(id))),
    );
    if (submitterIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id,full_name")
        .in("id", submitterIds);
      const byId: Record<string, Submitter> = {};
      for (const profile of profiles ?? []) byId[profile.id] = profile;
      setSubmitters(byId);
    } else {
      setSubmitters({});
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const pending = jobs.filter((job) => job.status === "pending");
  const posted = jobs.filter((job) => job.status !== "pending");

  const save = async () => {
    const company_name = form.company_name.trim();
    const job_title = form.job_title.trim();
    const job_url = form.job_url.trim();
    if (!company_name && !job_title && !job_url) {
      setMessage("Add at least a job title, a company name or a link.");
      return;
    }
    setBusy(true);
    const payload = {
      company_name: company_name || null,
      job_title: job_title || null,
      job_url: job_url || null,
      status: "published",
    };
    const result = editingId
      ? await jobsTable().update(payload).eq("id", editingId)
      : await jobsTable().insert(payload);
    if (result.error) setMessage(result.error.message);
    else {
      setMessage(editingId ? "Job updated." : "Job published to the Leader job board.");
      setForm(emptyForm);
      setEditingId(null);
      await load();
    }
    setBusy(false);
  };

  const edit = (job: Job) => {
    setEditingId(job.id);
    setForm({
      company_name: job.company_name ?? "",
      job_title: job.job_title ?? "",
      job_url: job.job_url ?? "",
    });
  };

  const remove = async (job: Job) => {
    if (!window.confirm(`Delete ${job.job_title ?? job.company_name ?? "this job"}?`)) return;
    setBusy(true);
    const { error } = await jobsTable().delete().eq("id", job.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Job removed.");
      await load();
    }
    setBusy(false);
  };

  const review = async (job: Job, decision: "published" | "rejected") => {
    setBusy(true);
    const { error } = await jobsTable().update({ status: decision }).eq("id", job.id);
    if (error) setMessage(error.message);
    else {
      setMessage(
        decision === "published" ? "Submission approved and published." : "Submission rejected.",
      );
      await load();
    }
    setBusy(false);
  };

  return (
    <AdminShell
      title="Jobs Management"
      subtitle="Publish roles directly, or review the ones Leaders submit before they go live."
    >
      <div className="space-y-6">
        {message && (
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-4 text-sm">{message}</CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="size-5 text-primary" /> {editingId ? "Edit job" : "Publish a job"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Job title (optional)"
                value={form.job_title}
                onChange={(e) => setForm({ ...form, job_title: e.target.value })}
              />
              <Input
                placeholder="Company name (optional)"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
              <Input
                placeholder="Job posting link (optional)"
                value={form.job_url}
                onChange={(e) => setForm({ ...form, job_url: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => void save()} disabled={busy}>
                {editingId ? "Update job" : "Publish job"}
              </Button>
              {editingId && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingId(null);
                    setForm(emptyForm);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <Clock3 className="size-5 text-primary" /> Pending approval
              </CardTitle>
              <Badge variant="outline">{pending.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pending.map((job) => (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
              >
                <div>
                  <p className="font-semibold">{job.job_title ?? "Role not specified"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company_name ?? "Company not specified"}
                    {job.job_url ? " · Link included" : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Submitted by{" "}
                    {job.created_by
                      ? (submitters[job.created_by]?.full_name ?? "a Leader")
                      : "a Leader"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => void review(job, "published")} disabled={busy}>
                    <Check /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void review(job, "rejected")}
                    disabled={busy}
                  >
                    <X /> Reject
                  </Button>
                </div>
              </div>
            ))}
            {pending.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">
                No submissions waiting for review.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="flex items-center gap-2">
                <BriefcaseBusiness className="size-5 text-primary" /> Jobs
              </CardTitle>
              <Badge variant="outline">{posted.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {posted.map((job) => (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4"
              >
                <div>
                  <p className="font-semibold">{job.job_title ?? "Role not specified"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {job.company_name ?? "Company not specified"}
                    {job.job_url ? " · External posting linked" : ""}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{job.status}</p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => edit(job)}>
                    <Pencil /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void remove(job)}
                    disabled={busy}
                  >
                    <Trash2 /> Delete
                  </Button>
                </div>
              </div>
            ))}
            {posted.length === 0 && (
              <p className="p-5 text-sm text-muted-foreground">
                No jobs published yet. Add the first verified opportunity above.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
