import { CheckCircle2, Database, Search, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database as DB } from "@/integrations/supabase/types";

type Interview = DB["public"]["Tables"]["interviews"]["Row"];
type InterviewQuestion = DB["public"]["Tables"]["interview_questions"]["Row"];
type Profile = DB["public"]["Tables"]["profiles"]["Row"];

export function InterviewQuestionsAdminPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [bankCount, setBankCount] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = async () => {
    const [interviewResult, questionResult, profileResult, bankResult] = await Promise.all([
      supabase.from("interviews").select("*").order("created_at", { ascending: false }),
      supabase.from("interview_questions").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("question_bank").select("id", { count: "exact", head: true }).eq("is_active", true),
    ]);
    if (interviewResult.error || questionResult.error || profileResult.error || bankResult.error) {
      setMessage("Interview administration data could not be loaded.");
      return;
    }
    setInterviews(interviewResult.data ?? []);
    setQuestions(questionResult.data ?? []);
    setProfiles(Object.fromEntries((profileResult.data ?? []).map((profile) => [profile.id, profile])));
    setBankCount(bankResult.count ?? 0);
  };

  useEffect(() => { void load(); }, []);

  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((question) => {
      const interview = interviews.find((item) => item.id === question.interview_id);
      const student = interview ? profiles[interview.student_id] : null;
      const statusMatch = selectedStatus === "all" || (question.question_bank_id ? "curated" : "pending");
      const searchMatch = !q || [question.question_text, question.category, interview?.company_name, interview?.job_title, interview?.interview_round, student?.full_name].some((value) => value?.toLowerCase().includes(q));
      return statusMatch && searchMatch;
    });
  }, [questions, interviews, profiles, search, selectedStatus]);

  const promote = async (question: InterviewQuestion) => {
    const interview = interviews.find((item) => item.id === question.interview_id);
    if (!interview) return;
    setBusy(question.id);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    const { data: bankQuestion, error: insertError } = await supabase.from("question_bank").insert({
      question: question.question_text,
      category: question.category ?? "Other",
      technology: "Android",
      difficulty: question.difficulty ?? "medium",
      expected_answer: null,
      evaluation_points: [],
      is_active: true,
      created_by: userData.user?.id ?? null,
    }).select("id").single();
    if (insertError) {
      setMessage(insertError.message);
      setBusy(null);
      return;
    }
    const { error: linkError } = await supabase.from("interview_questions").update({ question_bank_id: bankQuestion.id }).eq("id", question.id);
    if (linkError) setMessage(linkError.message);
    else setMessage("Question promoted into the shared question bank.");
    await load();
    setBusy(null);
  };

  const saveInterviewNotes = async (interview: Interview) => {
    setBusy(interview.id);
    const { error } = await supabase.from("interviews").update({ admin_notes: notes[interview.id] ?? interview.admin_notes }).eq("id", interview.id);
    if (error) setMessage(error.message);
    else await load();
    setBusy(null);
  };

  const pending = questions.filter((item) => !item.question_bank_id).length;

  return (
    <AdminShell title="Interview Question Bank" subtitle="Central admin workspace for every Leader interview experience, every submitted question and the curated question bank.">
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <section className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Interview experiences</p><p className="mt-1 text-2xl font-bold">{interviews.length}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Questions awaiting curation</p><p className="mt-1 text-2xl font-bold">{pending}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Published question bank</p><p className="mt-1 text-2xl font-bold">{bankCount}</p></CardContent></Card>
        </section>

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle className="flex items-center gap-2"><Database className="size-5 text-primary" /> All Leader interview questions</CardTitle><p className="mt-1 text-sm text-muted-foreground">This is the central place to see questions submitted by every Leader.</p></div>
              <div className="flex flex-wrap gap-2">
                <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search company, leader, round, question…" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}><option value="all">All</option><option value="pending">Needs curation</option><option value="curated">Curated</option></select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {filteredQuestions.map((question) => {
              const interview = interviews.find((item) => item.id === question.interview_id);
              const student = interview ? profiles[interview.student_id] : null;
              const note = notes[interview?.id ?? ""] ?? interview?.admin_notes ?? "";
              return (
                <div key={question.id} className="rounded-2xl border border-border p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap gap-2"><Badge variant="outline">{question.category ?? "Other"}</Badge><Badge>{question.difficulty ?? "medium"}</Badge>{question.question_bank_id ? <Badge><CheckCircle2 /> Curated</Badge> : <Badge variant="outline">Needs curation</Badge>}</div>
                      <h3 className="mt-3 font-semibold leading-6">{question.question_text}</h3>
                      <p className="mt-2 text-xs text-muted-foreground">{student?.full_name ?? interview?.student_id ?? "Unknown leader"} · {interview?.company_name ?? "Company not specified"} · {interview?.job_title ?? "Role not specified"} · {interview?.interview_round ?? "Round not specified"}</p>
                      {interview?.student_notes && <p className="mt-3 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm">{interview.student_notes}</p>}
                    </div>
                    {!question.question_bank_id && <Button size="sm" disabled={busy === question.id} onClick={() => void promote(question)}><Upload /> Promote to question bank</Button>}
                  </div>
                  {interview && (
                    <div className="mt-4 border-t border-border pt-4">
                      <Textarea className="min-h-20" placeholder="Admin notes for this interview" value={note} onChange={(e) => setNotes((current) => ({ ...current, [interview.id]: e.target.value }))} />
                      <Button className="mt-2" size="sm" variant="outline" disabled={busy === interview.id} onClick={() => void saveInterviewNotes(interview)}>Save interview notes</Button>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredQuestions.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No Leader interview questions match the current filters.</p>}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
