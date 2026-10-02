import { BriefcaseBusiness, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Job = Database["public"]["Tables"]["jobs"]["Row"];

const emptyForm = { company_name: "", job_title: "", job_url: "", location: "", employment_type: "", source: "" };

export function JobsAdminPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data, error } = await supabase.from("jobs").select("*").order("created_at", { ascending: false });
    if (error) setMessage(error.message);
    else setJobs(data ?? []);
  };

  useEffect(() => { void load(); }, []);

  const save = async () => {
    if (!form.company_name.trim() || !form.job_title.trim()) {
      setMessage("Company name and job title are required.");
      return;
    }
    setBusy(true);
    const payload = {
      company_name: form.company_name.trim(),
      job_title: form.job_title.trim(),
      job_url: form.job_url.trim() || null,
      location: form.location.trim() || null,
      employment_type: form.employment_type.trim() || null,
      source: form.source.trim() || null,
    };
    const result = editingId
      ? await supabase.from("jobs").update(payload).eq("id", editingId)
      : await supabase.from("jobs").insert(payload);
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
      company_name: job.company_name,
      job_title: job.job_title,
      job_url: job.job_url ?? "",
      location: job.location ?? "",
      employment_type: job.employment_type ?? "",
      source: job.source ?? "",
    });
  };

  const remove = async (job: Job) => {
    if (!window.confirm(`Delete ${job.job_title} at ${job.company_name}?`)) return;
    setBusy(true);
    const { error } = await supabase.from("jobs").delete().eq("id", job.id);
    if (error) setMessage(error.message);
    else {
      setMessage("Job removed.");
      await load();
    }
    setBusy(false);
  };

  return (
    <AdminShell title="Jobs Management" subtitle="Create and maintain the roles that appear in the TLH Leader job board. No external jobs are invented or imported automatically.">
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Plus className="size-5 text-primary" /> {editingId ? "Edit job" : "Publish a job"}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Company name *" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
            <Input placeholder="Job title *" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
            <Input placeholder="Job posting URL" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} />
            <Input placeholder="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
            <Input placeholder="Employment type, e.g. Full-time" value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} />
            <Input placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} />
            <div className="flex gap-2 md:col-span-2">
              <Button onClick={() => void save()} disabled={busy}>{editingId ? "Update job" : "Publish job"}</Button>
              {editingId && <Button variant="outline" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</Button>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle className="flex items-center gap-2"><BriefcaseBusiness className="size-5 text-primary" /> Published jobs</CardTitle><Badge variant="outline">{jobs.length}</Badge></div></CardHeader>
          <CardContent className="space-y-3">
            {jobs.map((job) => (
              <div key={job.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4">
                <div><p className="font-semibold">{job.job_title}</p><p className="mt-1 text-sm text-muted-foreground">{job.company_name} · {job.location ?? "Location not specified"} · {job.employment_type ?? "Type not specified"}</p><p className="mt-1 text-xs text-muted-foreground">{job.source ?? "TLH"}{job.job_url ? " · External posting linked" : ""}</p></div>
                <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => edit(job)}><Pencil /> Edit</Button><Button size="sm" variant="outline" onClick={() => void remove(job)} disabled={busy}><Trash2 /> Delete</Button></div>
              </div>
            ))}
            {jobs.length === 0 && <p className="p-5 text-sm text-muted-foreground">No jobs published yet. Add the first verified opportunity above.</p>}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
