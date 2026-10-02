import { ArrowRight, CheckCircle2, ExternalLink, PlayCircle, RefreshCw, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["l1_courses"]["Row"];
type Module = Database["public"]["Tables"]["l1_course_modules"]["Row"];
type Lesson = Database["public"]["Tables"]["l1_course_lessons"]["Row"];
type Assignment = Database["public"]["Tables"]["l1_assignments"]["Row"];
type LessonProgress = Database["public"]["Tables"]["student_lesson_progress"]["Row"];
type Submission = Database["public"]["Tables"]["l1_assignment_submissions"]["Row"];

const submissionLabel: Record<Submission["status"], string> = {
  submitted: "Submitted",
  under_review: "Under review",
  reviewed: "Reviewed",
  needs_revision: "Needs revision",
};

export function L1LearningPage() {
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<Record<string, LessonProgress>>({});
  const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
  const [openLesson, setOpenLesson] = useState<string | null>(null);
  const [assignmentDrafts, setAssignmentDrafts] = useState<Record<string, { text: string; url: string }>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    const { data: userData, error: authError } = await supabase.auth.getUser();
    if (authError || !userData.user) {
      setError("Your session could not be loaded. Please sign in again.");
      setLoading(false);
      return;
    }

    const [courseResult, progressResult, submissionsResult] = await Promise.all([
      supabase.from("l1_courses").select("*").eq("is_active", true).order("sort_order").limit(1).maybeSingle(),
      supabase.from("student_lesson_progress").select("*").eq("student_id", userData.user.id),
      supabase.from("l1_assignment_submissions").select("*").eq("student_id", userData.user.id),
    ]);

    if (courseResult.error || progressResult.error || submissionsResult.error) {
      setError("We could not load your L1 learning data. Please refresh.");
      setLoading(false);
      return;
    }

    const activeCourse = courseResult.data;
    setCourse(activeCourse);
    setProgress(Object.fromEntries((progressResult.data ?? []).map((row) => [row.lesson_id, row])));
    setSubmissions(Object.fromEntries((submissionsResult.data ?? []).map((row) => [row.assignment_id, row])));

    if (!activeCourse) {
      setModules([]);
      setLessons([]);
      setAssignments([]);
      setLoading(false);
      return;
    }

    const moduleResult = await supabase
      .from("l1_course_modules")
      .select("*")
      .eq("course_id", activeCourse.id)
      .eq("is_active", true)
      .order("sort_order");
    if (moduleResult.error) {
      setError("The L1 course structure could not be loaded.");
      setLoading(false);
      return;
    }
    const moduleRows = moduleResult.data ?? [];
    setModules(moduleRows);

    const moduleIds = moduleRows.map((row) => row.id);
    if (moduleIds.length === 0) {
      setLessons([]);
      setAssignments([]);
      setLoading(false);
      return;
    }

    const [lessonResult, assignmentResult] = await Promise.all([
      supabase.from("l1_course_lessons").select("*").in("module_id", moduleIds).eq("is_active", true).order("sort_order"),
      supabase.from("l1_assignments").select("*").in("module_id", moduleIds).eq("is_active", true).order("sort_order"),
    ]);

    if (lessonResult.error || assignmentResult.error) {
      setError("Some L1 learning content could not be loaded.");
    } else {
      setLessons(lessonResult.data ?? []);
      setAssignments(assignmentResult.data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const lessonsByModule = useMemo(
    () => Object.fromEntries(modules.map((module) => [module.id, lessons.filter((lesson) => lesson.module_id === module.id)])),
    [lessons, modules],
  );
  const assignmentsByModule = useMemo(
    () => Object.fromEntries(modules.map((module) => [module.id, assignments.filter((assignment) => assignment.module_id === module.id)])),
    [assignments, modules],
  );

  const completedLessons = lessons.filter((lesson) => progress[lesson.id]?.status === "completed").length;
  const requiredAssignments = assignments.filter((assignment) => assignment.is_required);
  const completedAssignments = requiredAssignments.filter((assignment) => Boolean(submissions[assignment.id])).length;
  const totalUnits = lessons.length + requiredAssignments.length;
  const completedUnits = completedLessons + completedAssignments;
  const completion = totalUnits ? Math.round((completedUnits / totalUnits) * 100) : 0;

  const markLesson = async (lesson: Lesson, status: LessonProgress["status"]) => {
    setBusy(lesson.id);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Your session expired. Please sign in again.");
      setBusy(null);
      return;
    }
    const existing = progress[lesson.id];
    const now = new Date().toISOString();
    const payload = {
      student_id: userData.user.id,
      lesson_id: lesson.id,
      status,
      started_at: existing?.started_at ?? now,
      completed_at: status === "completed" ? now : null,
    };
    const { data, error: saveError } = await supabase
      .from("student_lesson_progress")
      .upsert(payload, { onConflict: "student_id,lesson_id" })
      .select("*")
      .single();
    if (saveError) setError("Lesson progress could not be saved. Please try again.");
    else setProgress((current) => ({ ...current, [lesson.id]: data }));
    setBusy(null);
  };

  const submitAssignment = async (assignment: Assignment) => {
    setBusy(assignment.id);
    setError(null);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setError("Your session expired. Please sign in again.");
      setBusy(null);
      return;
    }
    const draft = assignmentDrafts[assignment.id] ?? { text: "", url: "" };
    if (!draft.text.trim() && !draft.url.trim()) {
      setError("Add your assignment response or a submission link before submitting.");
      setBusy(null);
      return;
    }
    const existing = submissions[assignment.id];
    const { data, error: saveError } = await supabase
      .from("l1_assignment_submissions")
      .upsert(
        {
          assignment_id: assignment.id,
          student_id: userData.user.id,
          submission_text: draft.text.trim() || null,
          submission_url: draft.url.trim() || null,
          status: "submitted",
          reviewer_id: existing?.reviewer_id ?? null,
          feedback: null,
          score: null,
          submitted_at: new Date().toISOString(),
          reviewed_at: null,
        },
        { onConflict: "assignment_id,student_id" },
      )
      .select("*")
      .single();
    if (saveError) setError("Your assignment could not be submitted. Please try again.");
    else setSubmissions((current) => ({ ...current, [assignment.id]: data }));
    setBusy(null);
  };

  return (
    <StudentShell
      title="L1 Silver Learning"
      subtitle="Complete the video lessons, mark each lesson done, submit the assignments, and keep your learning progress visible in one place."
      membershipLabel="L1 Silver Membership"
    >
      <div className="space-y-6">
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="flex items-center justify-between gap-4 p-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}><RefreshCw className={loading ? "animate-spin" : ""} /> Refresh</Button>
            </CardContent>
          </Card>
        )}

        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div className="max-w-3xl">
                <Badge variant="outline" className="border-primary/30 text-primary">L1 Silver · Learning System</Badge>
                <h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">{course?.title ?? "L1 course is being prepared"}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{course?.description ?? "Your L1 course content will appear here after the admin publishes the course."}</p>
              </div>
              <div className="min-w-44 rounded-2xl border border-border bg-background px-5 py-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Overall completion</p>
                <p className="mt-1 text-2xl font-bold text-primary">{completion}%</p>
                <p className="mt-1 text-xs text-muted-foreground">{completedUnits} / {totalUnits || 0} learning units</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card><CardContent className="p-8 text-center text-muted-foreground">Loading your L1 learning system…</CardContent></Card>
        ) : !course ? (
          <Card><CardContent className="p-8 text-center"><p className="font-semibold">No L1 course is published yet.</p><p className="mt-2 text-sm text-muted-foreground">Your learning page is ready. An admin needs to publish the first course and lessons.</p></CardContent></Card>
        ) : (
          <div className="space-y-4">
            {modules.map((module, moduleIndex) => (
              <Card key={module.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Badge variant="secondary">Module {moduleIndex + 1}</Badge>
                      <CardTitle className="mt-2">{module.title}</CardTitle>
                      {module.description && <p className="mt-1 text-sm text-muted-foreground">{module.description}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {(lessonsByModule[module.id] ?? []).filter((lesson) => progress[lesson.id]?.status === "completed").length}/{(lessonsByModule[module.id] ?? []).length} lessons
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(lessonsByModule[module.id] ?? []).map((lesson, lessonIndex) => {
                    const lessonProgress = progress[lesson.id]?.status ?? "not_started";
                    const expanded = openLesson === lesson.id;
                    return (
                      <div key={lesson.id} className="rounded-xl border border-border">
                        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                          <div className="flex min-w-0 items-center gap-3">
                            {lessonProgress === "completed" ? <CheckCircle2 className="size-5 shrink-0 text-primary" /> : <PlayCircle className="size-5 shrink-0 text-muted-foreground" />}
                            <div className="min-w-0">
                              <p className="text-sm font-semibold">{lessonIndex + 1}. {lesson.title}</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                {lesson.lesson_type === "video" ? "Video lesson" : "Reading lesson"}{lesson.duration_minutes ? " · " + lesson.duration_minutes + " min" : ""}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => setOpenLesson(expanded ? null : lesson.id)}>
                              {expanded ? "Close" : "Open lesson"}
                              <ArrowRight />
                            </Button>
                            <Button size="sm" variant={lessonProgress === "completed" ? "secondary" : "default"} disabled={busy === lesson.id} onClick={() => void markLesson(lesson, lessonProgress === "completed" ? "in_progress" : "completed")}>
                              {lessonProgress === "completed" ? "Completed" : "Mark complete"}
                            </Button>
                          </div>
                        </div>
                        {expanded && (
                          <div className="border-t border-border p-4">
                            {lesson.description && <p className="text-sm leading-6 text-muted-foreground">{lesson.description}</p>}
                            {lesson.video_url && (
                              <div className="mt-4 overflow-hidden rounded-xl border border-border bg-black/5">
                                <div className="aspect-video">
                                  <iframe src={lesson.video_url} title={lesson.title} className="size-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                                </div>
                              </div>
                            )}
                            {lesson.resource_url && (
                              <Button className="mt-4" variant="outline" asChild><a href={lesson.resource_url} target="_blank" rel="noreferrer">Open lesson resource <ExternalLink /></a></Button>
                            )}
                            {!lesson.video_url && !lesson.resource_url && <p className="mt-4 text-sm text-muted-foreground">This lesson has no published media yet.</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {(assignmentsByModule[module.id] ?? []).length > 0 && (
                    <div className="mt-5 space-y-3 border-t border-border pt-5">
                      <div>
                        <p className="font-semibold">Assignments</p>
                        <p className="text-xs text-muted-foreground">Submit your work here. Admin review status will appear after submission.</p>
                      </div>
                      {(assignmentsByModule[module.id] ?? []).map((assignment) => {
                        const submission = submissions[assignment.id];
                        const draft = assignmentDrafts[assignment.id] ?? { text: submission?.submission_text ?? "", url: submission?.submission_url ?? "" };
                        return (
                          <div key={assignment.id} className="rounded-xl border border-border p-4">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold">{assignment.title}</p>
                                {assignment.description && <p className="mt-1 text-sm text-muted-foreground">{assignment.description}</p>}
                                {assignment.instructions && <p className="mt-2 whitespace-pre-wrap text-sm leading-6">{assignment.instructions}</p>}
                              </div>
                              {assignment.is_required && <Badge>Required</Badge>}
                            </div>
                            <Textarea className="mt-4 min-h-28" placeholder="Write your assignment response…" value={draft.text} onChange={(e) => setAssignmentDrafts((current) => ({ ...current, [assignment.id]: { ...draft, text: e.target.value } }))} />
                            <Input className="mt-3" placeholder="Optional submission URL" value={draft.url} onChange={(e) => setAssignmentDrafts((current) => ({ ...current, [assignment.id]: { ...draft, url: e.target.value } }))} />
                            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                              <div className="text-xs text-muted-foreground">
                                {submission ? <span>Status: <strong>{submissionLabel[submission.status]}</strong>{submission.score != null ? " · Score " + submission.score : ""}</span> : "Not submitted yet"}
                                {submission?.feedback && <p className="mt-1">Feedback: {submission.feedback}</p>}
                              </div>
                              <Button disabled={busy === assignment.id} onClick={() => void submitAssignment(assignment)}><Send /> Submit assignment</Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card>
          <CardContent className="p-5">
            <p className="text-sm font-semibold">L1 completion rule</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Completion is tracked from published lessons plus required assignment submissions. This learning progress does not automatically change your membership level.
            </p>
          </CardContent>
        </Card>
      </div>
    </StudentShell>
  );
}
