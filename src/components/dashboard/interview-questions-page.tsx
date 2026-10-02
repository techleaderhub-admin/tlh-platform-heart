import { BookOpen, Plus, Search, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type InterviewQuestion = Database["public"]["Tables"]["interview_questions"]["Row"];
type BankQuestion = Database["public"]["Tables"]["question_bank"]["Row"];

export function InterviewQuestionsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [questionDraft, setQuestionDraft] = useState("");
  const [questionCategory, setQuestionCategory] = useState("Android");
  const [questionDifficulty, setQuestionDifficulty] = useState("medium");
  const [message, setMessage] = useState<string | null>(null);
  const [interviewForm, setInterviewForm] = useState({ company_name: "", job_title: "", interview_type: "technical", interview_round: "", interview_date: "", student_notes: "" });

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const [interviewResult, questionResult, bankResult] = await Promise.all([
      supabase.from("interviews").select("*").eq("student_id", userData.user.id).order("interview_date", { ascending: false }),
      supabase.from("interview_questions").select("*"),
      supabase.from("question_bank").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    ]);
    if (interviewResult.error || questionResult.error || bankResult.error) {
      setMessage("Interview data could not be loaded. Please refresh.");
      return;
    }
    setInterviews(interviewResult.data ?? []);
    setQuestions(questionResult.data ?? []);
    setBank(bankResult.data ?? []);
    if (!selectedInterview && interviewResult.data?.[0]) setSelectedInterview(interviewResult.data[0].id);
  };

  useEffect(() => { void load(); }, []);

  const createInterview = async () => {
    if (!interviewForm.company_name.trim()) {
      setMessage("Company name is required.");
      return;
    }
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const { data, error } = await supabase.from("interviews").insert({
      student_id: userData.user.id,
      company_name: interviewForm.company_name.trim(),
      job_title: interviewForm.job_title.trim() || null,
      interview_type: interviewForm.interview_type,
      interview_round: interviewForm.interview_round.trim() || null,
      interview_date: interviewForm.interview_date ? new Date(interviewForm.interview_date).toISOString() : null,
      student_notes: interviewForm.student_notes.trim() || null,
      status: "submitted",
    }).select("*").single();
    if (error) setMessage(error.message);
    else {
      setMessage("Interview experience created. Add the questions you were asked.");
      setInterviews((current) => [data, ...current]);
      setSelectedInterview(data.id);
      setShowInterviewForm(false);
      setInterviewForm({ company_name: "", job_title: "", interview_type: "technical", interview_round: "", interview_date: "", student_notes: "" });
    }
  };

  const addQuestion = async () => {
    if (!selectedInterview || !questionDraft.trim()) {
      setMessage("Select an interview and enter the question.");
      return;
    }
    const current = questions.filter((item) => item.interview_id === selectedInterview);
    const { data, error } = await supabase.from("interview_questions").insert({
      interview_id: selectedInterview,
      question_text: questionDraft.trim(),
      category: questionCategory,
      difficulty: questionDifficulty,
      question_order: current.length + 1,
    }).select("*").single();
    if (error) setMessage(error.message);
    else {
      setQuestions((items) => [...items, data]);
      setQuestionDraft("");
      setMessage("Question recorded.");
    }
  };

  const visibleQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      if (selectedInterview && item.interview_id !== selectedInterview) return false;
      return !q || [item.question_text, item.category].some((value) => value?.toLowerCase().includes(q));
    });
  }, [questions, search, selectedInterview]);

  return (
    <StudentShell
      title="Interview Experience & Question Bank"
      subtitle="Record the questions you actually faced. TLH keeps your interview experience connected to the central question bank so admins can review and curate it."
      membershipLabel="Interview workspace"
    >
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6">
              <Badge variant="outline" className="border-primary/30 text-primary">Student interview recording</Badge>
              <h2 className="mt-3 font-heading text-2xl font-bold">Capture the real questions you faced.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Create an interview experience, then add each question in order. Your records stay tied to your student account and are visible to admins for curation.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <Button onClick={() => setShowInterviewForm((value) => !value)}><Plus /> Record an interview</Button>
              <p className="mt-3 text-xs text-muted-foreground">{interviews.length} interview experiences recorded.</p>
            </CardContent>
          </Card>
        </section>

        {showInterviewForm && (
          <Card>
            <CardHeader><CardTitle>New interview experience</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Company *" value={interviewForm.company_name} onChange={(e) => setInterviewForm({ ...interviewForm, company_name: e.target.value })} />
              <Input placeholder="Job title" value={interviewForm.job_title} onChange={(e) => setInterviewForm({ ...interviewForm, job_title: e.target.value })} />
              <Input placeholder="Interview type" value={interviewForm.interview_type} onChange={(e) => setInterviewForm({ ...interviewForm, interview_type: e.target.value })} />
              <Input placeholder="Round" value={interviewForm.interview_round} onChange={(e) => setInterviewForm({ ...interviewForm, interview_round: e.target.value })} />
              <Input type="date" value={interviewForm.interview_date} onChange={(e) => setInterviewForm({ ...interviewForm, interview_date: e.target.value })} />
              <Textarea placeholder="Notes about the interview (optional)" value={interviewForm.student_notes} onChange={(e) => setInterviewForm({ ...interviewForm, student_notes: e.target.value })} />
              <div className="md:col-span-2 flex justify-end"><Button onClick={() => void createInterview()}><Send /> Save interview</Button></div>
            </CardContent>
          </Card>
        )}

        <section className="grid gap-4 lg:grid-cols-[280px_1fr]">
          <Card>
            <CardHeader><CardTitle className="text-base">My interviews</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {interviews.map((interview) => (
                <button key={interview.id} type="button" onClick={() => setSelectedInterview(interview.id)} className={"w-full rounded-xl border p-3 text-left " + (selectedInterview === interview.id ? "border-primary bg-primary/[0.04]" : "border-border")}>
                  <p className="font-semibold">{interview.company_name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{interview.job_title ?? "Role not specified"} · {interview.interview_round ?? "Round not specified"}</p>
                </button>
              ))}
              {interviews.length === 0 && <p className="text-sm text-muted-foreground">Record your first interview to start adding questions.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><CardTitle className="text-base">Questions from this interview</CardTitle><p className="mt-1 text-sm text-muted-foreground">Add questions in the order you remember them.</p></div>
                <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {visibleQuestions.map((question) => (
                <div key={question.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3"><p className="font-semibold">{question.question_order}. {question.question_text}</p><Badge variant="outline">{question.difficulty ?? "medium"}</Badge></div>
                  <p className="mt-2 text-xs text-muted-foreground">{question.category ?? "Uncategorized"}{question.question_bank_id ? " · Curated into question bank" : " · Pending admin curation"}</p>
                </div>
              ))}
              {selectedInterview && visibleQuestions.length === 0 && <p className="p-4 text-sm text-muted-foreground">No questions recorded for this interview yet.</p>}
              {selectedInterview && (
                <div className="mt-4 rounded-xl border border-dashed border-border p-4">
                  <Textarea className="min-h-24" placeholder="What were you asked?" value={questionDraft} onChange={(e) => setQuestionDraft(e.target.value)} />
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Input placeholder="Category, e.g. Coroutines" value={questionCategory} onChange={(e) => setQuestionCategory(e.target.value)} />
                    <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={questionDifficulty} onChange={(e) => setQuestionDifficulty(e.target.value)}><option value="easy">easy</option><option value="medium">medium</option><option value="hard">hard</option></select>
                  </div>
                  <Button className="mt-3" onClick={() => void addQuestion()}><Plus /> Add question</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="size-5 text-primary" /> Shared curated question bank</CardTitle><p className="text-sm text-muted-foreground">Questions approved by admin for study.</p></CardHeader>
          <CardContent className="space-y-3">
            {bank.map((item) => <div key={item.id} className="rounded-xl border border-border p-4"><div className="flex flex-wrap items-start justify-between gap-3"><p className="font-semibold">{item.question}</p><Badge>{item.difficulty ?? "medium"}</Badge></div><p className="mt-2 text-xs text-muted-foreground">{item.category}{item.technology ? " · " + item.technology : ""}</p></div>)}
            {bank.length === 0 && <p className="p-4 text-sm text-muted-foreground">No curated questions have been published yet.</p>}
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
