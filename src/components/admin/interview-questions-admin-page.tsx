import { CheckCircle2, Filter, Search, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Question = Database["public"]["Tables"]["interview_questions"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function InterviewQuestionsAdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [status, setStatus] = useState("pending");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});

  const load = async () => {
    setMessage(null);
    const [questionResult, profileResult] = await Promise.all([
      supabase.from("interview_questions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
    ]);
    if (questionResult.error || profileResult.error) setMessage("Interview question administration data could not be loaded.");
    else {
      setQuestions(questionResult.data ?? []);
      setProfiles(Object.fromEntries((profileResult.data ?? []).map((profile) => [profile.id, profile])));
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      const statusMatch = status === "all" || item.status === status;
      const searchMatch = !q || [item.question_text, item.topic, item.company_name, item.role_title, item.interview_round, item.submission_notes].some((value) => value?.toLowerCase().includes(q));
      return statusMatch && searchMatch;
    });
  }, [questions, status, search]);

  const updateStatus = async (question: Question, nextStatus: Question["status"], publish: boolean) => {
    setBusy(question.id);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await supabase.from("interview_questions").update({
      status: nextStatus,
      is_public: publish,
      reviewed_by: userData.user?.id ?? null,
      reviewed_at: new Date().toISOString(),
      admin_notes: editingNotes[question.id]?.trim() || question.admin_notes || null,
    }).eq("id", question.id);
    if (error) setMessage(error.message);
    else await load();
    setBusy(null);
  };

  const saveNotes = async (question: Question) => {
    setBusy(question.id);
    const { error } = await supabase.from("interview_questions").update({ admin_notes: editingNotes[question.id]?.trim() || null }).eq("id", question.id);
    if (error) setMessage(error.message);
    else await load();
    setBusy(null);
  };

  const pending = questions.filter((item) => item.status === "pending").length;
  const approved = questions.filter((item) => item.status === "approved" && item.is_public).length;
  const studentSubmitted = questions.filter((item) => item.source_type === "student").length;

  return (
    <AdminShell title="Interview Question Bank" subtitle="One central workspace for every student-submitted interview question, admin-curated questions, review decisions and the published question bank.">
      <div className="space-y-6">
        {message && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm text-destructive">{message}</CardContent></Card>}

        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Pending review</p><p className="mt-1 text-2xl font-bold">{pending}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Published</p><p className="mt-1 text-2xl font-bold">{approved}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Student submissions</p><p className="mt-1 text-2xl font-bold">{studentSubmitted}</p></CardContent></Card>
        </section>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle>Central interview question bank</CardTitle><p className="mt-1 text-sm text-muted-foreground">Search by question, company, role, round or topic.</p></div>
              <div className="flex flex-wrap gap-2">
                <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search all questions" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
                  {["pending","approved","rejected","archived","all"].map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filtered.map((question) => {
              const student = question.submitted_by ? profiles[question.submitted_by] : null;
              const note = editingNotes[question.id] ?? question.admin_notes ?? "";
              return (
                <div key={question.id} className="rounded-2xl border border-border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2"><Badge>{question.status}</Badge><Badge variant="outline">{question.source_type}</Badge><Badge variant="outline">{question.difficulty}</Badge></div>
                      <h3 className="mt-3 font-semibold leading-6">{question.question_text}</h3>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                        <span>{question.topic}</span>
                        {question.company_name && <span>· {question.company_name}</span>}
                        {question.role_title && <span>· {question.role_title}</span>}
                        {question.interview_round && <span>· {question.interview_round}</span>}
                        {question.interview_stage && <span>· {question.interview_stage}</span>}
                        {student && <span>· Submitted by {student.full_name ?? student.id}</span>}
                      </div>
                      {question.submission_notes && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm">{question.submission_notes}</p>}
                    </div>
                  </div>

                  <Textarea className="mt-4 min-h-20" placeholder="Admin notes / moderation notes" value={note} onChange={(e) => setEditingNotes((current) => ({ ...current, [question.id]: e.target.value }))} />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" disabled={busy === question.id} onClick={() => void saveNotes(question)}><Filter /> Save notes</Button>
                    <Button size="sm" disabled={busy === question.id} onClick={() => void updateStatus(question, "approved", true)}><CheckCircle2 /> Approve & publish</Button>
                    <Button size="sm" variant="outline" disabled={busy === question.id} onClick={() => void updateStatus(question, "rejected", false)}><XCircle /> Reject</Button>
                    {question.status === "approved" && <Button size="sm" variant="outline" disabled={busy === question.id} onClick={() => void updateStatus(question, "archived", false)}>Archive</Button>}
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No interview questions match the current filter.</p>}
          </CardContent>
        </Card>

        <Card><CardContent className="p-5 text-sm text-muted-foreground">Student submissions are private by default. Only an admin approval action can make a question public in the shared student bank.</CardContent></Card>
      </div>
    </AdminShell>
  );
}
