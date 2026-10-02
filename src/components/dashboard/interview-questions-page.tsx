import { CheckCircle2, Plus, Search, Send, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Question = Database["public"]["Tables"]["interview_questions"]["Row"];

const topics = ["Kotlin", "Android", "Jetpack", "Architecture", "Coroutines", "System Design", "Coding", "Testing", "Performance", "Other"];

export function InterviewQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myQuestions, setMyQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState("");
  const [topic, setTopic] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    question_text: "",
    topic: "Android",
    question_type: "technical" as Question["question_type"],
    difficulty: "medium" as Question["difficulty"],
    company_name: "",
    role_title: "",
    interview_round: "",
    interview_stage: "technical" as NonNullable<Question["interview_stage"]>,
    candidate_experience_years: "",
    asked_at: "",
    submission_notes: "",
  });

  const load = async () => {
    setLoading(true);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage("Please sign in again.");
      setLoading(false);
      return;
    }
    const [publicResult, mineResult] = await Promise.all([
      supabase.from("interview_questions").select("*").eq("status", "approved").eq("is_public", true).order("created_at", { ascending: false }),
      supabase.from("interview_questions").select("*").eq("submitted_by", userData.user.id).order("created_at", { ascending: false }),
    ]);
    if (publicResult.error || mineResult.error) {
      setMessage("Interview questions could not be loaded. Please refresh.");
    } else {
      setQuestions(publicResult.data ?? []);
      setMyQuestions(mineResult.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filteredQuestions = useMemo(() => {
    const q = search.trim().toLowerCase();
    return questions.filter((item) => {
      const matchesTopic = topic === "all" || item.topic === topic;
      const matchesSearch = !q || [item.question_text, item.company_name, item.role_title, item.interview_round, item.topic].some((value) => value?.toLowerCase().includes(q));
      return matchesTopic && matchesSearch;
    });
  }, [questions, search, topic]);

  const submitQuestion = async () => {
    if (!form.question_text.trim() || !form.topic.trim()) {
      setMessage("Question and topic are required.");
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setMessage("Your session expired. Please sign in again.");
      setSubmitting(false);
      return;
    }
    const { error } = await supabase.from("interview_questions").insert({
      question_text: form.question_text.trim(),
      topic: form.topic.trim(),
      question_type: form.question_type,
      difficulty: form.difficulty,
      company_name: form.company_name.trim() || null,
      role_title: form.role_title.trim() || null,
      interview_round: form.interview_round.trim() || null,
      interview_stage: form.interview_stage,
      candidate_experience_years: form.candidate_experience_years ? Number(form.candidate_experience_years) : null,
      asked_at: form.asked_at || null,
      source_type: "student",
      submitted_by: userData.user.id,
      submission_notes: form.submission_notes.trim() || null,
      status: "pending",
      is_public: false,
    });
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Submitted. Your question is now waiting for admin review.");
      setForm({ question_text: "", topic: "Android", question_type: "technical", difficulty: "medium", company_name: "", role_title: "", interview_round: "", interview_stage: "technical", candidate_experience_years: "", asked_at: "", submission_notes: "" });
      setShowForm(false);
      await load();
    }
    setSubmitting(false);
  };

  return (
    <StudentShell
      title="Interview Question Bank"
      subtitle="Study approved questions from real interview experiences and submit the questions you personally faced so TLH can build a stronger shared bank."
      membershipLabel="Interview workspace"
    >
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <section className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6">
              <Badge variant="outline" className="border-primary/30 text-primary">Real interview experience</Badge>
              <h2 className="mt-3 font-heading text-2xl font-bold">Build the bank from what candidates actually faced.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Your submission stays private while it is pending. Admin reviews it before it can become part of the shared question bank.</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2"><ShieldCheck className="size-5 text-primary" /><p className="font-semibold">Review workflow</p></div>
              <p className="mt-2 text-sm text-muted-foreground">Pending → Admin review → Approved and published when suitable.</p>
              <Button className="mt-4" onClick={() => setShowForm((value) => !value)}><Plus /> Submit a question</Button>
            </CardContent>
          </Card>
        </section>

        {showForm && (
          <Card>
            <CardHeader><CardTitle>Submit an interview question</CardTitle></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="md:col-span-2"><Textarea className="min-h-28" placeholder="What exactly were you asked?" value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })} /></div>
              <Input placeholder="Topic, e.g. Coroutines" value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.question_type} onChange={(e) => setForm({ ...form, question_type: e.target.value as Question["question_type"] })}>
                {["technical","coding","system_design","behavioral","debugging","architecture","other"].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value as Question["difficulty"] })}>
                {["easy","medium","hard"].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <Input placeholder="Company (optional)" value={form.company_name} onChange={(e) => setForm({ ...form, company_name: e.target.value })} />
              <Input placeholder="Role (optional)" value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} />
              <Input placeholder="Interview round (e.g. Android LLD)" value={form.interview_round} onChange={(e) => setForm({ ...form, interview_round: e.target.value })} />
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={form.interview_stage} onChange={(e) => setForm({ ...form, interview_stage: e.target.value as NonNullable<Question["interview_stage"]> })}>
                {["phone","online_assessment","technical","system_design","managerial","hr","onsite","other"].map((value) => <option key={value} value={value}>{value}</option>)}
              </select>
              <Input type="number" min="0" step="0.5" placeholder="Your experience in years" value={form.candidate_experience_years} onChange={(e) => setForm({ ...form, candidate_experience_years: e.target.value })} />
              <Input type="date" value={form.asked_at} onChange={(e) => setForm({ ...form, asked_at: e.target.value })} />
              <div className="md:col-span-2"><Textarea placeholder="Anything useful about the context, expected answer or your experience (optional)" value={form.submission_notes} onChange={(e) => setForm({ ...form, submission_notes: e.target.value })} /></div>
              <div className="md:col-span-2 flex justify-end"><Button disabled={submitting} onClick={() => void submitQuestion()}><Send /> Submit for review</Button></div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><CardTitle>Approved question bank</CardTitle><p className="mt-1 text-sm text-muted-foreground">{filteredQuestions.length} published questions</p></div>
              <div className="flex flex-wrap gap-2">
                <div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="pl-9" placeholder="Search questions" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={topic} onChange={(e) => setTopic(e.target.value)}><option value="all">All topics</option>{topics.map((value) => <option key={value}>{value}</option>)}</select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="p-6 text-center text-sm text-muted-foreground">Loading interview questions…</p> : filteredQuestions.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold leading-6">{item.question_text}</p>
                  <Badge>{item.difficulty}</Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>{item.topic}</span>{item.company_name && <span>· {item.company_name}</span>}{item.role_title && <span>· {item.role_title}</span>}{item.interview_round && <span>· {item.interview_round}</span>}
                </div>
              </div>
            ))}
            {!loading && filteredQuestions.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">No approved questions match your filters yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>My submissions</CardTitle><p className="text-sm text-muted-foreground">Your questions remain visible to you while they move through review.</p></CardHeader>
          <CardContent className="space-y-3">
            {myQuestions.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">{item.question_text}</p><Badge variant={item.status === "approved" ? "default" : "outline"}>{item.status}</Badge></div>
                <p className="mt-2 text-xs text-muted-foreground">{item.topic} · {item.difficulty}{item.admin_notes ? " · Admin note available" : ""}</p>
              </div>
            ))}
            {myQuestions.length === 0 && <p className="p-4 text-sm text-muted-foreground">You have not submitted an interview question yet.</p>}
          </CardContent>
        </Card>

        <Card><CardContent className="flex items-center gap-3 p-5 text-sm text-muted-foreground"><CheckCircle2 className="size-5 shrink-0 text-primary" /> Only approved public questions enter the shared student bank. Membership is not changed by a submission.</CardContent></Card>
      </div>
    </StudentShell>
  );
}
