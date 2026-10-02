import { CheckCircle2, ChevronLeft, ChevronRight, CircleHelp, RotateCcw, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Question = Database["public"]["Functions"]["get_l2_assessment_questions"]["Returns"][number];
type Attempt = Database["public"]["Tables"]["l2_assessment_attempts"]["Row"];
type Answer = Database["public"]["Tables"]["l2_assessment_answers"]["Row"];

const options = ["a", "b", "c", "d"] as const;
type Option = (typeof options)[number];

const optionText = (question: Question, option: Option) => question[`option_${option}`];

export function L2KnowledgeCheckPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, Option>>({});
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [result, setResult] = useState<Attempt | null>(null);
  const [categoryResults, setCategoryResults] = useState<{ category: string; score: number; correct_answers: number; total_questions: number }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [savingAnswer, setSavingAnswer] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  const load = async () => {
    setLoading(true);
    setError(null);

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) {
      setError("Your session could not be loaded. Please sign in again.");
      setLoading(false);
      return;
    }

    const [questionResult, attemptResult] = await Promise.all([
      supabase.rpc("get_l2_assessment_questions").order("sort_order", { ascending: true }),
      supabase.from("l2_assessment_attempts").select("*").eq("student_id", userData.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (questionResult.error || attemptResult.error) {
      setError("We could not load the L2 knowledge check.");
      setLoading(false);
      return;
    }

    const qs = questionResult.data ?? [];
    const latest = attemptResult.data;
    setQuestions(qs);

    if (latest?.status === "submitted") {
      setResult(latest);
      setAttempt(null);
      const categoryResult = await supabase.rpc("get_l2_assessment_category_results", { p_attempt_id: latest.id });
      setCategoryResults(categoryResult.error ? [] : (categoryResult.data ?? []));
    } else if (latest?.status === "in_progress") {
      setAttempt(latest);
      const { data: answerRows, error: answerError } = await supabase
        .from("l2_assessment_answers")
        .select("*")
        .eq("attempt_id", latest.id);

      if (answerError) {
        setError("Your saved answers could not be loaded.");
      } else {
        setAnswers(Object.fromEntries((answerRows ?? []).flatMap((row: Answer) =>
          row.selected_option && options.includes(row.selected_option as Option)
            ? [[row.question_id, row.selected_option as Option]]
            : []
        )));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const start = async () => {
    setStarting(true);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Your session expired. Please sign in again.");
      setStarting(false);
      return;
    }

    const { data, error: createError } = await supabase
      .from("l2_assessment_attempts")
      .insert({ student_id: userData.user.id, status: "in_progress" })
      .select("*")
      .single();

    if (createError) {
      setError(createError.message.includes("row-level") ? "The L2 knowledge check is available to L1+ memberships only." : createError.message);
    } else {
      setAttempt(data);
      setResult(null);
      setCategoryResults([]);
      setAnswers({});
      setCurrentIndex(0);
    }
    setStarting(false);
  };

  const selectAnswer = async (value: Option) => {
    if (!attempt || !currentQuestion) return;
    setAnswers((current) => ({ ...current, [currentQuestion.id]: value }));
    setSavingAnswer(true);
    setError(null);

    const { error: saveError } = await supabase
      .from("l2_assessment_answers")
      .upsert(
        { attempt_id: attempt.id, question_id: currentQuestion.id, selected_option: value },
        { onConflict: "attempt_id,question_id" },
      );

    if (saveError) setError("Your answer could not be saved. Please try again.");
    setSavingAnswer(false);
  };

  const submit = async () => {
    if (!attempt) return;
    setSubmitting(true);
    setError(null);

    const { data, error: submitError } = await supabase.rpc("submit_l2_assessment", { p_attempt_id: attempt.id });
    if (submitError) {
      setError(submitError.message);
    } else {
      setResult(data);
      setAttempt(null);
      const categoryResult = await supabase.rpc("get_l2_assessment_category_results", { p_attempt_id: data.id });
      setCategoryResults(categoryResult.error ? [] : (categoryResult.data ?? []));
    }
    setSubmitting(false);
  };

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((q) => counts.set(q.category, (counts.get(q.category) ?? 0) + 1));
    return Array.from(counts.entries());
  }, [questions]);

  const categoryStatus = (score: number) => {
    if (score < 60) return { label: "Needs review", className: "text-destructive" };
    if (score < 80) return { label: "Developing", className: "text-primary" };
    return { label: "Strong", className: "text-primary" };
  };

  const weakestCategory = categoryResults[0];
  const nextGuidance = result
    ? result.passed
      ? "Review the categories marked Needs review or Developing, then continue with your L2 learning plan."
      : "Focus on the categories marked Needs review first, revisit the related L2 lessons, then retake the knowledge check."
    : "";

  if (loading) {
    return <StudentShell title="L2 Knowledge Check" subtitle="Loading your assessment…" membershipLabel="L2 Advanced Membership"><Card><CardContent className="p-6 text-sm text-muted-foreground">Loading questions and saved progress…</CardContent></Card></StudentShell>;
  }

  return (
    <StudentShell
      title="L2 Knowledge Check"
      subtitle="A 20-question advanced Android engineering check across Kotlin, Coroutines, Flow, architecture, performance, networking, databases, modularization, testing and production Android."
      membershipLabel="L2 Advanced Membership"
    >
      <div className="space-y-6">
        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card>}

        {questions.length === 0 ? (
          <Card><CardContent className="p-8 text-center"><CircleHelp className="mx-auto size-10 text-muted-foreground" /><h2 className="mt-4 font-heading text-xl font-semibold">Assessment is not published yet</h2><p className="mt-2 text-sm text-muted-foreground">An admin needs to publish the L2 question set before you can start.</p></CardContent></Card>
        ) : result ? (
          <Card className="overflow-hidden border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-7 sm:p-10">
              <Badge variant="outline" className="border-primary/30 text-primary">Assessment submitted</Badge>
              <h2 className="mt-4 font-heading text-3xl font-bold">Your L1 result</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border bg-background p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Score</p><p className="mt-2 text-3xl font-bold">{result.score ?? 0}%</p></div>
                <div className="rounded-xl border bg-background p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Questions</p><p className="mt-2 text-3xl font-bold">{result.total_questions ?? questions.length}</p></div>
                <div className="rounded-xl border bg-background p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">40% checkpoint</p><p className="mt-2 text-xl font-bold">{result.passed ? "Reached" : "Not reached"}</p></div>
              </div>
              <p className="mt-6 max-w-2xl text-sm leading-6 text-muted-foreground">
                This result is a readiness signal for the TLH journey. It does not automatically change your membership level.
              </p>

              {categoryResults.length > 0 && (
                <div className="mt-7">
                  <div>
                    <p className="font-semibold">Category breakdown</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Use this to decide which L2 topics need more practice before your next attempt.
                    </p>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {categoryResults.map((item) => {
                      const status = categoryStatus(item.score);
                      return (
                        <div key={item.category} className="rounded-xl border bg-background p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">{item.category}</p>
                              <p className={"mt-1 text-xs font-medium " + status.className}>{status.label}</p>
                            </div>
                            <span className="font-heading text-xl font-bold">{item.score}%</span>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {item.correct_answers} / {item.total_questions} correct
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-xl border border-primary/20 bg-primary/[0.04] p-4">
                    <p className="text-sm font-semibold">Next step</p>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{nextGuidance}</p>
                    {weakestCategory && (
                      <Badge variant="outline" className="mt-3 border-primary/30 text-primary">
                        Start with: {weakestCategory.category}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => { setResult(null); setCategoryResults([]); setAnswers({}); setCurrentIndex(0); void start(); }} disabled={starting}>
                  <RotateCcw />
                  Retake assessment
                </Button>
                <Button variant="outline" asChild><a href="/dashboard">Back to dashboard</a></Button>
              </div>
            </CardContent>
          </Card>
        ) : !attempt ? (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
            <Card><CardHeader><CardTitle>Before you start</CardTitle></CardHeader><CardContent className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p>This is the L2 Advanced Android knowledge check. It is designed to verify advanced Android engineering readiness before the L3 career track.</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>20 multiple-choice questions</li>
                <li>Advanced Kotlin, Coroutines, Flow, architecture, performance, networking, databases, modularization, testing and production Android</li>
                <li>40% is the defined checkpoint</li>
                <li>Your answers are saved as you move through the assessment</li>
                
              </ul>
              <Button onClick={() => void start()} disabled={starting}><ShieldCheck />{starting ? "Starting…" : "Start L2 knowledge check"}</Button>
            </CardContent></Card>
            <Card><CardHeader><CardTitle>Question coverage</CardTitle></CardHeader><CardContent className="space-y-3">{categoryCounts.map(([category, count]) => <div key={category} className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">{category}</span><Badge variant="outline">{count}</Badge></div>)}</CardContent></Card>
          </div>
        ) : currentQuestion ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div><Badge variant="outline">Question {currentIndex + 1} of {questions.length}</Badge><p className="mt-2 text-xs text-muted-foreground">{currentQuestion.category}</p></div>
                <span className="text-sm text-muted-foreground">{answeredCount}/{questions.length} answered</span>
              </div>
              <Progress value={progress} className="mt-4" />
            </CardHeader>
            <CardContent>
              <h2 className="text-xl font-semibold leading-8 sm:text-2xl">{currentQuestion.question_text}</h2>
              <div className="mt-6 grid gap-3">
                {options.map((option) => {
                  const selected = answers[currentQuestion.id] === option;
                  return <button key={option} type="button" onClick={() => void selectAnswer(option)} className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition ${selected ? "border-primary bg-primary/[0.06]" : "border-border hover:border-primary/40"}`}>
                    <span className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold uppercase ${selected ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{option}</span>
                    <span className="text-sm leading-6">{optionText(currentQuestion, option)}</span>
                  </button>;
                })}
              </div>
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                <Button variant="outline" onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))} disabled={currentIndex === 0}><ChevronLeft />Previous</Button>
                <span className="text-xs text-muted-foreground">{savingAnswer ? "Saving answer…" : "Answer is saved automatically."}</span>
                {currentIndex < questions.length - 1 ? (
                  <Button onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))} disabled={!answers[currentQuestion.id]}>Next<ChevronRight /></Button>
                ) : (
                  <Button onClick={() => void submit()} disabled={submitting || !answers[currentQuestion.id] || answeredCount !== questions.length}>{submitting ? "Submitting…" : "Submit assessment"}<CheckCircle2 /></Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </StudentShell>
  );
}
