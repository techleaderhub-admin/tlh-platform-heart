import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardCheck, RefreshCw, Save } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

type Category = "Architecture" | "Kotlin & Concurrency" | "Mobile System Design" | "Leadership";
type AssessmentQuestion = { id: string; category: Category; question: string };
type SkillGap = { id: string; domain: string; score: number | null; status: string; recommendation: string | null; last_assessed_at: string };
const QUESTIONS: AssessmentQuestion[] = [
  { id: "architecture-1", category: "Architecture", question: "I can explain and defend the architecture of a production Android application, including trade-offs." },
  { id: "architecture-2", category: "Architecture", question: "I can identify boundaries between UI, domain and data responsibilities and explain why they exist." },
  { id: "architecture-3", category: "Architecture", question: "I can diagnose architectural coupling and propose a migration path without rewriting the entire application." },
  { id: "kotlin-1", category: "Kotlin & Concurrency", question: "I can reason about structured concurrency, coroutine scopes, cancellation and exception propagation." },
  { id: "kotlin-2", category: "Kotlin & Concurrency", question: "I can choose between Flow, StateFlow, SharedFlow and other Kotlin concurrency primitives for a real product requirement." },
  { id: "kotlin-3", category: "Kotlin & Concurrency", question: "I can investigate concurrency bugs such as races, leaked work, blocked threads or incorrect lifecycle handling." },
  { id: "system-1", category: "Mobile System Design", question: "I can design a mobile system end-to-end and explain API, caching, storage, networking and failure trade-offs." },
  { id: "system-2", category: "Mobile System Design", question: "I can estimate scale and reason about latency, reliability, offline behaviour and data consistency." },
  { id: "system-3", category: "Mobile System Design", question: "I can communicate an HLD/LLD design clearly and adapt it when interview constraints change." },
  { id: "leadership-1", category: "Leadership", question: "I can lead technical decisions across engineers and communicate trade-offs to product and engineering stakeholders." },
  { id: "leadership-2", category: "Leadership", question: "I can mentor engineers, review designs and raise engineering standards without becoming a delivery bottleneck." },
  { id: "leadership-3", category: "Leadership", question: "I can turn ambiguous product or engineering problems into an executable technical plan with measurable outcomes." },
];
const SCALE = [{ value: 1, label: "Not yet" }, { value: 2, label: "Developing" }, { value: 3, label: "Working level" }, { value: 4, label: "Strong" }, { value: 5, label: "Confident" }];
const CATEGORY_ORDER: Category[] = ["Architecture", "Kotlin & Concurrency", "Mobile System Design", "Leadership"];

function categoryScore(category: Category, answers: Record<string, number>) {
  const items = QUESTIONS.filter((question) => question.category === category);
  const total = items.reduce((sum, question) => sum + (answers[question.id] ?? 0), 0);
  return items.length ? Math.round((total / (items.length * 5)) * 100) : 0;
}
function assessmentSummary(answers: Record<string, number>) {
  const scores = CATEGORY_ORDER.map((category) => ({ category, score: categoryScore(category, answers) }));
  const strengths = scores.filter((item) => item.score >= 70).map((item) => item.category);
  const gaps = scores.filter((item) => item.score < 60).map((item) => item.category);
  const recommendations = CATEGORY_ORDER.map((category) => {
    const score = categoryScore(category, answers);
    if (score < 60) return "Prioritize a focused " + category + " practice cycle and review measurable examples from production work.";
    if (score < 80) return "Strengthen " + category + " with deeper design exercises, implementation practice and interview-style explanation.";
    return "Maintain " + category + " through advanced design reviews, mentoring and increasingly complex production problems.";
  });
  return { scores, strengths, gaps, recommendations };
}

export function CareerAssessmentPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [membershipLabel, setMembershipLabel] = useState("Free Membership");
  const [previousAssessment, setPreviousAssessment] = useState<{ id: string; score: number | null; created_at: string } | null>(null);
  const [skillGaps, setSkillGaps] = useState<SkillGap[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) { setError("Your session could not be loaded. Please sign in again."); setLoading(false); return; }
    const [{ data: membership }, { data: latest, error: assessmentError }, { data: gaps, error: gapsError }] = await Promise.all([
      supabase.from("student_memberships").select("level, is_active").eq("student_id", userData.user.id).maybeSingle(),
      supabase.from("career_assessments").select("id, score, created_at").eq("student_id", userData.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("career_skill_gaps").select("id, domain, score, status, recommendation, last_assessed_at").eq("student_id", userData.user.id).order("domain"),
    ]);
    if (membership?.is_active !== false && membership?.level) setMembershipLabel(membership.level === "free" ? "Free Membership" : membership.level.toUpperCase() + " Membership");
    if (assessmentError || gapsError) setError("We could not load your previous assessment data. You can still complete a new assessment.");
    setPreviousAssessment(latest ?? null);
    setSkillGaps(gaps ?? []);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const answered = Object.keys(answers).length;
  const completion = Math.round((answered / QUESTIONS.length) * 100);
  const summary = useMemo(() => assessmentSummary(answers), [answers]);
  const liveScore = answered === QUESTIONS.length ? Math.round(summary.scores.reduce((sum, item) => sum + item.score, 0) / CATEGORY_ORDER.length) : null;
  const setAnswer = (questionId: string, value: number) => { setSaved(false); setAnswers((current) => ({ ...current, [questionId]: value })); };

  const saveAssessment = async () => {
    if (answered !== QUESTIONS.length) { setError("Please answer every question before saving your assessment."); return; }
    setSaving(true); setSaved(false); setError(null);
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) { setError("Your session has expired. Please sign in again."); setSaving(false); return; }
    const result = assessmentSummary(answers);
    const { data: assessment, error: saveError } = await supabase.from("career_assessments").insert({
      student_id: userData.user.id,
      assessment_type: "tlh-career-readiness-v1",
      score: liveScore,
      strengths: { categories: result.strengths, scores: Object.fromEntries(result.scores.map((item) => [item.category, item.score])) },
      gaps: { categories: result.gaps, scores: Object.fromEntries(result.scores.map((item) => [item.category, item.score])) },
      recommendations: { items: result.recommendations, answers },
    }).select("id, score, created_at").single();

    if (saveError || !assessment) {
      setError("Could not save your assessment. " + (saveError?.message ?? "Unknown error"));
    } else {
      const gapRows = result.scores.map((item) => ({
        student_id: userData.user.id,
        assessment_id: assessment.id,
        domain: item.category,
        score: item.score,
        status: item.score < 60 ? "open" : item.score < 80 ? "developing" : "strength",
        recommendation: result.recommendations[CATEGORY_ORDER.indexOf(item.category)],
        last_assessed_at: assessment.created_at,
      }));
      const { error: gapError } = await supabase.from("career_skill_gaps").upsert(gapRows, { onConflict: "student_id,domain" });
      if (gapError) {
        setError("Assessment saved, but the skill-gap snapshot could not be updated. " + gapError.message);
      } else {
        await load();
      }
      setSaved(true);
      setPreviousAssessment(assessment);
    }
    setSaving(false);
  };

  return (
    <StudentShell title="Career Assessment" subtitle="Measure your current readiness across Android architecture, Kotlin concurrency, mobile system design and technical leadership." membershipLabel={membershipLabel}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="ghost" asChild><Link to="/dashboard"><ArrowLeft />Back to dashboard</Link></Button>
          <Button variant="outline" onClick={() => void load()} disabled={loading || saving}><RefreshCw className={loading ? "animate-spin" : ""} />Refresh</Button>
        </div>
        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm font-medium text-destructive">{error}</CardContent></Card>}
        <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-6"><div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between"><div><div className="flex items-center gap-2"><ClipboardCheck className="size-5 text-primary" /><p className="font-semibold">TLH Career Readiness Assessment v1</p></div><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Rate yourself honestly from 1 to 5. This is a baseline diagnostic, not a hiring score. Your result is saved to your private career workspace.</p></div><div className="min-w-[180px] rounded-xl border border-border bg-background p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Completion</p><p className="mt-1 text-2xl font-bold">{completion}%</p><Progress value={completion} className="mt-2 h-2" /></div></div></CardContent></Card>
        {CATEGORY_ORDER.map((category) => <Card key={category}><CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>{category}</CardTitle><Badge variant="outline">{categoryScore(category, answers)}%</Badge></div></CardHeader><CardContent className="space-y-6">{QUESTIONS.filter((question) => question.category === category).map((question, index) => <div key={question.id} className="rounded-xl border border-border p-4"><p className="font-medium leading-6">{index + 1}. {question.question}</p><div className="mt-4 grid gap-2 sm:grid-cols-5">{SCALE.map((option) => { const selected = answers[question.id] === option.value; return <button type="button" key={option.value} onClick={() => setAnswer(question.id, option.value)} className={"rounded-lg border px-3 py-3 text-left transition " + (selected ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40")}><span className="block text-lg font-bold">{option.value}</span><span className="text-xs text-muted-foreground">{option.label}</span></button>; })}</div></div>)}</CardContent></Card>)}
        <Card><CardHeader><CardTitle>Assessment snapshot</CardTitle></CardHeader><CardContent className="space-y-5"><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{summary.scores.map((item) => <div key={item.category} className="rounded-xl border border-border p-4"><p className="text-xs text-muted-foreground">{item.category}</p><p className="mt-1 text-2xl font-bold">{item.score}%</p><Progress value={item.score} className="mt-2 h-2" /></div>)}</div>{liveScore !== null && <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Overall baseline</p><p className="mt-1 text-3xl font-bold text-primary">{liveScore}%</p><p className="mt-2 text-sm text-muted-foreground">Use the category breakdown to identify where your next learning and interview practice can begin.</p></div>}{previousAssessment && <p className="text-sm text-muted-foreground">Previous saved assessment: {previousAssessment.score ?? 0}% · {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(previousAssessment.created_at))}</p>}<div className="flex flex-wrap items-center gap-3"><Button onClick={() => void saveAssessment()} disabled={saving || answered !== QUESTIONS.length}><Save />{saving ? "Saving..." : "Save assessment"}</Button>{saved && <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="size-4" />Assessment saved</span>}<span className="text-xs text-muted-foreground">Answered {answered} of {QUESTIONS.length}</span></div></CardContent></Card>
      </div>
    </StudentShell>
  );
}
