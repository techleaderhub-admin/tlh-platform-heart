import { BookOpen, Plus, Search, Send, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { membershipLabel } from "@/lib/membership-access";

type Interview = Database["public"]["Tables"]["interviews"]["Row"];
type InterviewQuestion = Database["public"]["Tables"]["interview_questions"]["Row"];
type BankQuestion = Database["public"]["Tables"]["question_bank"]["Row"];

export function InterviewQuestionsPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [similarQuestions, setSimilarQuestions] = useState<Record<string, Array<{ id: string; question: string; category: string; difficulty: string | null; technology: string | null; similarity: number }>>>({});
  const [loadingSimilar, setLoadingSimilar] = useState<string | null>(null);

  const [selectedInterview, setSelectedInterview] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [historyCompany, setHistoryCompany] = useState("");
  const [historyRole, setHistoryRole] = useState("");
  const [historyRound, setHistoryRound] = useState("");
  const [historyDate, setHistoryDate] = useState("");
  const [historyCategory, setHistoryCategory] = useState("all");
  const [showInterviewForm, setShowInterviewForm] = useState(false);
  const [questionDrafts, setQuestionDrafts] = useState<Array<{ text: string; category: string; difficulty: string }>>([
    { text: "", category: "Android", difficulty: "medium" },
  ]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState({ text: "", category: "Android", difficulty: "medium" });
  const [message, setMessage] = useState<string | null>(null);
  const [membership, setMembership] = useState<Database["public"]["Enums"]["membership_level"]>("free");
  const [interviewForm, setInterviewForm] = useState({ company_name: "", job_title: "", interview_type: "technical", interview_round: "", interview_date: "" });

  const load = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) return;
    const [{ data: membershipData }, interviewResult, questionResult, bankResult] = await Promise.all([
      supabase.from("student_memberships").select("level,is_active").eq("student_id", userData.user.id).maybeSingle(),
      supabase.from("interviews").select("*").eq("student_id", userData.user.id).order("interview_date", { ascending: false }),
      supabase.from("interview_questions").select("*"),
      supabase.from("question_bank").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    ]);
    setMembership(membershipData?.is_active === false ? "free" : (membershipData?.level ?? "free"));
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

  const findSimilarQuestions = async (questionId: string) => {
    if (similarQuestions[questionId]) return;
    setLoadingSimilar(questionId);
    const { data, error } = await supabase.rpc("get_similar_question_bank", {
      p_question_id: questionId,
      p_limit: 5,
    });
    if (error) {
      setMessage("Similar questions could not be loaded. Please try again.");
    } else {
      setSimilarQuestions((current) => ({ ...current, [questionId]: data ?? [] }));
    }
    setLoadingSimilar(null);
  };

  const createInterview = async () => {
    if (!interviewForm.company_name.trim()) {
      setMessage("Company name is required.");
      return;
    }

    const validDrafts = questionDrafts.filter((item) => item.text.trim());
    if (validDrafts.length === 0) {
      setMessage("Add at least one interview question.");
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
      job_application_id: null,
      status: "submitted",
    }).select("*").single();

    if (error) {
      setMessage(error.message);
      return;
    }

    const { data: createdQuestions, error: questionError } = await supabase
      .from("interview_questions")
      .insert(validDrafts.map((item, index) => ({
        interview_id: data.id,
        question_text: item.text.trim(),
        category: item.category.trim() || "Uncategorized",
        difficulty: item.difficulty,
        question_order: index + 1,
      })))
      .select("*");

    if (questionError) {
      setInterviews((current) => [data, ...current]);
      setSelectedInterview(data.id);
      setMessage("Interview was created, but the questions could not be saved. Please add them below.");
      setShowInterviewForm(false);
      setQuestionDrafts([{ text: "", category: "Android", difficulty: "medium" }]);
      return;
    }

    setMessage((createdQuestions?.length ?? 0) + " question(s) recorded for this interview.");
    setInterviews((current) => [data, ...current]);
    setQuestions((current) => [...current, ...(createdQuestions ?? [])]);
    setSelectedInterview(data.id);
    setShowInterviewForm(false);
    setInterviewForm({ company_name: "", job_title: "", interview_type: "technical", interview_round: "", interview_date: "" });
    setQuestionDrafts([{ text: "", category: "Android", difficulty: "medium" }]);
  };

  const addQuestionField = () => {
    const lastDraft = questionDrafts[questionDrafts.length - 1];
    if (!lastDraft?.text.trim()) {
      setMessage("Enter the current question before adding another one.");
      return;
    }
    setQuestionDrafts((items) => [...items, { text: "", category: "Android", difficulty: "medium" }]);
  };

  const updateQuestionDraft = (index: number, key: "text" | "category" | "difficulty", value: string) => {
    setQuestionDrafts((items) => items.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  };

  const removeQuestionField = (index: number) => {
    setQuestionDrafts((items) => items.length === 1 ? [{ text: "", category: "Android", difficulty: "medium" }] : items.filter((_, itemIndex) => itemIndex !== index));
  };

  const saveQuestionDrafts = async () => {
    if (!selectedInterview) {
      setMessage("Select an interview first.");
      return;
    }
    const validDrafts = questionDrafts.filter((item) => item.text.trim());
    if (validDrafts.length === 0) {
      setMessage("Enter at least one interview question.");
      return;
    }

    const existingCount = questions.filter((item) => item.interview_id === selectedInterview).length;
    const payload = validDrafts.map((item, index) => ({
      interview_id: selectedInterview,
      question_text: item.text.trim(),
      category: item.category.trim() || "Uncategorized",
      difficulty: item.difficulty,
      question_order: existingCount + index + 1,
    }));

    const { data, error } = await supabase.from("interview_questions").insert(payload).select("*");
    if (error) {
      setMessage(error.message);
      return;
    }

    setQuestions((items) => [...items, ...(data ?? [])]);
    setQuestionDrafts([{ text: "", category: "Android", difficulty: "medium" }]);
    setMessage((data?.length ?? 0) + " question(s) recorded.");
  };

  const startEditingQuestion = (question: InterviewQuestion) => {
    setEditingQuestionId(question.id);
    setEditingQuestion({
      text: question.question_text,
      category: question.category ?? "Android",
      difficulty: question.difficulty ?? "medium",
    });
  };

  const saveEditedQuestion = async () => {
    if (!editingQuestionId || !editingQuestion.text.trim()) {
      setMessage("Question text is required.");
      return;
    }
    const { data, error } = await supabase.from("interview_questions")
      .update({
        question_text: editingQuestion.text.trim(),
        category: editingQuestion.category.trim() || "Uncategorized",
        difficulty: editingQuestion.difficulty,
      })
      .eq("id", editingQuestionId)
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      return;
    }
    setQuestions((items) => items.map((item) => item.id === data.id ? data : item));
    setEditingQuestionId(null);
    setMessage("Question updated.");
  };

  const historyCategories = useMemo(() => Array.from(new Set(questions.map((item) => item.category).filter((value): value is string => Boolean(value)))).sort(), [questions]);

  const filteredInterviews = useMemo(() => {
    const company = historyCompany.trim().toLowerCase();
    const role = historyRole.trim().toLowerCase();
    const round = historyRound.trim().toLowerCase();
    return interviews.filter((interview) => {
      if (company && !interview.company_name.toLowerCase().includes(company)) return false;
      if (role && !(interview.job_title ?? "").toLowerCase().includes(role)) return false;
      if (round && !(interview.interview_round ?? "").toLowerCase().includes(round)) return false;
      if (historyDate && interview.interview_date?.slice(0, 10) !== historyDate) return false;
      if (historyCategory !== "all" && !questions.some((item) => item.interview_id === interview.id && item.category === historyCategory)) return false;
      return true;
    });
  }, [interviews, questions, historyCompany, historyRole, historyRound, historyDate, historyCategory]);

  const questionRepeatCounts = useMemo(() => {
    const counts = new Map<string, number>();
    questions.forEach((item) => {
      const normalized = item.question_text.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
      if (normalized) counts.set(normalized, (counts.get(normalized) ?? 0) + 1);
    });
    return counts;
  }, [questions]);

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
      membershipLabel={membershipLabel(membership)}
    >
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
          <Card className="border-primary/20 bg-primary/[0.03]">
            <CardContent className="p-6">
              <Badge variant="outline" className="border-primary/30 text-primary">Leader interview recording</Badge>
              <h2 className="mt-3 font-heading text-2xl font-bold">Capture the real questions you faced.</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Create an interview experience, then add each question in order. Your records stay tied to your Leader account and are visible to admins for curation.</p>
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

              <div className="md:col-span-2 rounded-xl border border-dashed border-border p-4">
                <div className="mb-4">
                  <p className="font-semibold">Interview questions</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Add every question you remember from this interview. Enter a question first, then the “Add more question” button becomes available.
                  </p>
                </div>

                <div className="space-y-3">
                  {questionDrafts.map((draft, index) => (
                    <div key={index} className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Interview Question {index + 1}</p>
                        {questionDrafts.length > 1 ? (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestionField(index)}>
                            Remove
                          </Button>
                        ) : null}
                      </div>
                      <Textarea
                        className="min-h-24"
                        placeholder={index === 0 ? "Enter the first question you were asked" : "Enter the next question you were asked"}
                        value={draft.text}
                        onChange={(e) => updateQuestionDraft(index, "text", e.target.value)}
                      />
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Input
                          placeholder="Category, e.g. Coroutines"
                          value={draft.category}
                          onChange={(e) => updateQuestionDraft(index, "category", e.target.value)}
                        />
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={draft.difficulty}
                          onChange={(e) => updateQuestionDraft(index, "difficulty", e.target.value)}
                        >
                          <option value="easy">easy</option>
                          <option value="medium">medium</option>
                          <option value="hard">hard</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!questionDrafts[questionDrafts.length - 1]?.text.trim()}
                    onClick={addQuestionField}
                  >
                    <Plus /> Add more question
                  </Button>
                  <Button type="button" onClick={() => void createInterview()} disabled={!questionDrafts.some((item) => item.text.trim())}>
                    <Send /> Save interview & questions
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle>My Interview History</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">Filter your recorded interviews by company, date, category, role, and round.</p>
              </div>
              <Badge variant="outline">{filteredInterviews.length} matching</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
              <Input placeholder="Company" value={historyCompany} onChange={(e) => setHistoryCompany(e.target.value)} />
              <Input placeholder="Role" value={historyRole} onChange={(e) => setHistoryRole(e.target.value)} />
              <Input placeholder="Round" value={historyRound} onChange={(e) => setHistoryRound(e.target.value)} />
              <Input type="date" aria-label="Interview date" value={historyDate} onChange={(e) => setHistoryDate(e.target.value)} />
              <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={historyCategory} onChange={(e) => setHistoryCategory(e.target.value)}>
                <option value="all">All categories</option>
                {historyCategories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </div>
            {(historyCompany || historyRole || historyRound || historyDate || historyCategory !== "all") && (
              <Button variant="ghost" size="sm" onClick={() => {
                setHistoryCompany("");
                setHistoryRole("");
                setHistoryRound("");
                setHistoryDate("");
                setHistoryCategory("all");
              }}>Clear filters</Button>
            )}
            <div className="grid gap-3 md:grid-cols-2">
              {filteredInterviews.map((interview) => {
                const interviewQuestions = questions.filter((item) => item.interview_id === interview.id);
                return (
                  <button key={interview.id} type="button" onClick={() => setSelectedInterview(interview.id)} className={"rounded-xl border p-4 text-left transition-colors " + (selectedInterview === interview.id ? "border-primary bg-primary/[0.04]" : "border-border hover:bg-muted/40")}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{interview.company_name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{interview.job_title ?? "Role not specified"}</p>
                      </div>
                      <Badge variant="outline">{interview.interview_round ?? "Round not specified"}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{interview.interview_date ? new Date(interview.interview_date).toLocaleDateString() : "Date not specified"} · {interviewQuestions.length} questions</p>
                  </button>
                );
              })}
            </div>
            {filteredInterviews.length === 0 && <p className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">No interview experiences match the selected filters.</p>}
          </CardContent>
        </Card>

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
                  {editingQuestionId === question.id ? (
                    <div className="space-y-3">
                      <Textarea
                        className="min-h-24"
                        value={editingQuestion.text}
                        onChange={(e) => setEditingQuestion({ ...editingQuestion, text: e.target.value })}
                      />
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input
                          value={editingQuestion.category}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, category: e.target.value })}
                          placeholder="Category"
                        />
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={editingQuestion.difficulty}
                          onChange={(e) => setEditingQuestion({ ...editingQuestion, difficulty: e.target.value })}
                        >
                          <option value="easy">easy</option>
                          <option value="medium">medium</option>
                          <option value="hard">hard</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => void saveEditedQuestion()}><Send /> Save changes</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingQuestionId(null)}>Cancel</Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="font-semibold">{question.question_order}. {question.question_text}</p>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const normalized = question.question_text.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
                            const repeatCount = questionRepeatCounts.get(normalized) ?? 1;
                            return repeatCount > 1 ? <Badge variant="secondary">Repeated ×{repeatCount}</Badge> : null;
                          })()}
                          <Badge variant="outline">{question.difficulty ?? "medium"}</Badge>
                          <Button type="button" variant="ghost" size="sm" onClick={() => startEditingQuestion(question)}>Edit</Button>
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{question.category ?? "Uncategorized"}{question.question_bank_id ? " · Curated into question bank" : " · Pending admin curation"}</p>
                    </>
                  )}
                </div>
              ))}
              {selectedInterview && visibleQuestions.length === 0 && <p className="p-4 text-sm text-muted-foreground">No questions recorded for this interview yet.</p>}
              {selectedInterview && (
                <div className="mt-4 space-y-4 rounded-xl border border-dashed border-border p-4">
                  <div>
                    <p className="font-semibold">Record question set</p>
                    <p className="mt-1 text-xs text-muted-foreground">Add every question you remember from this interview. You can add multiple fields first, then save them together.</p>
                  </div>

                  {questionDrafts.map((draft, index) => (
                    <div key={index} className="rounded-xl border border-border bg-muted/20 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold">Question {index + 1}</p>
                        {questionDrafts.length > 1 && (
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeQuestionField(index)}>Remove</Button>
                        )}
                      </div>
                      <Textarea
                        className="min-h-24"
                        placeholder="Enter the interview question exactly as you remember it"
                        value={draft.text}
                        onChange={(e) => updateQuestionDraft(index, "text", e.target.value)}
                      />
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <Input
                          placeholder="Category, e.g. Coroutines"
                          value={draft.category}
                          onChange={(e) => updateQuestionDraft(index, "category", e.target.value)}
                        />
                        <select
                          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                          value={draft.difficulty}
                          onChange={(e) => updateQuestionDraft(index, "difficulty", e.target.value)}
                        >
                          <option value="easy">easy</option>
                          <option value="medium">medium</option>
                          <option value="hard">hard</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!questionDrafts[questionDrafts.length - 1]?.text.trim()}
                      onClick={addQuestionField}
                    >
                      <Plus /> Add more question
                    </Button>
                    <Button type="button" onClick={() => void saveQuestionDrafts()}><Send /> Save question set</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><BookOpen className="size-5 text-primary" /> Shared curated question bank</CardTitle><p className="text-sm text-muted-foreground">Questions approved by admin for study.</p></CardHeader>
          <CardContent className="space-y-3">
            {bank.map((item) => (
              <div key={item.id} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <p className="font-semibold">{item.question}</p>
                  <Badge>{item.difficulty ?? "medium"}</Badge>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{item.category}{item.technology ? " · " + item.technology : ""}</p>
                <Button className="mt-3" variant="outline" size="sm" onClick={() => void findSimilarQuestions(item.id)} disabled={loadingSimilar === item.id}>
                  <Sparkles /> {loadingSimilar === item.id ? "Finding similar questions…" : "Find similar questions"}
                </Button>
                {similarQuestions[item.id] && (
                  <div className="mt-4 space-y-2 rounded-lg bg-muted/30 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Similar interview questions</p>
                    {similarQuestions[item.id].length > 0 ? similarQuestions[item.id].map((similar) => (
                      <div key={similar.id} className="rounded-lg border border-border bg-background p-3">
                        <p className="text-sm font-medium">{similar.question}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {similar.category}{similar.technology ? " · " + similar.technology : ""}{similar.difficulty ? " · " + similar.difficulty : ""} · {(similar.similarity * 100).toFixed(0)}% text similarity
                        </p>
                      </div>
                    )) : <p className="text-sm text-muted-foreground">No related curated questions are available yet.</p>}
                  </div>
                )}
              </div>
            ))}
            {bank.length === 0 && <p className="p-4 text-sm text-muted-foreground">No curated questions have been published yet.</p>}
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
