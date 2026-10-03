import { BookOpen, CheckCircle2, Layers3, Plus, Save, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["l1_courses"]["Row"];
type Module = Database["public"]["Tables"]["l1_course_modules"]["Row"];
type Lesson = Database["public"]["Tables"]["l1_course_lessons"]["Row"];
type Assignment = Database["public"]["Tables"]["l1_assignments"]["Row"];
type Submission = Database["public"]["Tables"]["l1_assignment_submissions"]["Row"];
type LessonProgress = Database["public"]["Tables"]["student_lesson_progress"]["Row"];
type Membership = Database["public"]["Tables"]["student_memberships"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function L1LearningAdminPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedModule, setSelectedModule] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({});

  const [courseForm, setCourseForm] = useState({ title: "", description: "", sort_order: "1" });
  const [moduleForm, setModuleForm] = useState({ title: "", description: "", sort_order: "1" });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    description: "",
    video_url: "",
    resource_url: "",
    duration_minutes: "",
    sort_order: "1",
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    description: "",
    instructions: "",
    sort_order: "1",
  });

  const load = async () => {
    setLoading(true);
    setError(null);
    const [
      courseResult,
      moduleResult,
      lessonResult,
      assignmentResult,
      submissionResult,
      profileResult,
      progressResult,
      membershipResult,
    ] = await Promise.all([
      supabase.from("l1_courses").select("*").order("sort_order"),
      supabase.from("l1_course_modules").select("*").order("sort_order"),
      supabase.from("l1_course_lessons").select("*").order("sort_order"),
      supabase.from("l1_assignments").select("*").order("sort_order"),
      supabase
        .from("l1_assignment_submissions")
        .select("*")
        .order("updated_at", { ascending: false }),
      supabase.from("profiles").select("*"),
      supabase.from("student_lesson_progress").select("*"),
      supabase.from("student_memberships").select("*"),
    ]);
    if (
      courseResult.error ||
      moduleResult.error ||
      lessonResult.error ||
      assignmentResult.error ||
      submissionResult.error ||
      profileResult.error ||
      progressResult.error ||
      membershipResult.error
    ) {
      setError("Some L1 learning administration data could not be loaded.");
    } else {
      setCourses(courseResult.data ?? []);
      setModules(moduleResult.data ?? []);
      setLessons(lessonResult.data ?? []);
      setAssignments(assignmentResult.data ?? []);
      setSubmissions(submissionResult.data ?? []);
      setProfiles(
        Object.fromEntries((profileResult.data ?? []).map((profile) => [profile.id, profile])),
      );
      setLessonProgress(progressResult.data ?? []);
      setMemberships(membershipResult.data ?? []);
      if (!selectedCourse && courseResult.data?.[0]) setSelectedCourse(courseResult.data[0].id);
      if (!selectedModule && moduleResult.data?.[0]) setSelectedModule(moduleResult.data[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const visibleModules = useMemo(
    () => modules.filter((item) => item.course_id === selectedCourse),
    [modules, selectedCourse],
  );
  const visibleLessons = useMemo(
    () => lessons.filter((item) => item.module_id === selectedModule),
    [lessons, selectedModule],
  );
  const visibleAssignments = useMemo(
    () => assignments.filter((item) => item.module_id === selectedModule),
    [assignments, selectedModule],
  );
  const activeL1Students = memberships.filter(
    (membership) => membership.is_active && membership.level === "l1",
  );
  const totalPublishedLessons = lessons.filter((lesson) => lesson.is_active).length;
  const requiredPublishedAssignments = assignments.filter(
    (assignment) => assignment.is_active && assignment.is_required,
  ).length;

  const createCourse = async () => {
    if (!courseForm.title.trim()) return;
    setBusy("course");
    const { data: userData } = await supabase.auth.getUser();
    const { data, error: saveError } = await supabase
      .from("l1_courses")
      .insert({
        title: courseForm.title.trim(),
        description: courseForm.description.trim() || null,
        sort_order: Number(courseForm.sort_order) || 1,
        created_by: userData.user?.id ?? null,
        is_active: false,
      })
      .select("*")
      .single();
    if (saveError) setError(saveError.message);
    else {
      setCourses((current) => [...current, data].sort((a, b) => a.sort_order - b.sort_order));
      setSelectedCourse(data.id);
      setCourseForm({ title: "", description: "", sort_order: String(courses.length + 1) });
    }
    setBusy(null);
  };

  const createModule = async () => {
    if (!selectedCourse || !moduleForm.title.trim()) return;
    setBusy("module");
    const { data, error: saveError } = await supabase
      .from("l1_course_modules")
      .insert({
        course_id: selectedCourse,
        title: moduleForm.title.trim(),
        description: moduleForm.description.trim() || null,
        sort_order: Number(moduleForm.sort_order) || 1,
        is_active: true,
      })
      .select("*")
      .single();
    if (saveError) setError(saveError.message);
    else {
      setModules((current) => [...current, data].sort((a, b) => a.sort_order - b.sort_order));
      setSelectedModule(data.id);
      setModuleForm({ title: "", description: "", sort_order: String(visibleModules.length + 1) });
    }
    setBusy(null);
  };

  const createLesson = async () => {
    if (!selectedModule || !lessonForm.title.trim()) return;
    setBusy("lesson");
    const { data, error: saveError } = await supabase
      .from("l1_course_lessons")
      .insert({
        module_id: selectedModule,
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim() || null,
        lesson_type: "video",
        video_url: lessonForm.video_url.trim() || null,
        resource_url: lessonForm.resource_url.trim() || null,
        duration_minutes: lessonForm.duration_minutes ? Number(lessonForm.duration_minutes) : null,
        sort_order: Number(lessonForm.sort_order) || 1,
        is_active: false,
      })
      .select("*")
      .single();
    if (saveError) setError(saveError.message);
    else {
      setLessons((current) => [...current, data].sort((a, b) => a.sort_order - b.sort_order));
      setLessonForm({
        title: "",
        description: "",
        video_url: "",
        resource_url: "",
        duration_minutes: "",
        sort_order: String(visibleLessons.length + 1),
      });
    }
    setBusy(null);
  };

  const createAssignment = async () => {
    if (!selectedModule || !assignmentForm.title.trim()) return;
    setBusy("assignment");
    const { data: userData } = await supabase.auth.getUser();
    const { data, error: saveError } = await supabase
      .from("l1_assignments")
      .insert({
        module_id: selectedModule,
        title: assignmentForm.title.trim(),
        description: assignmentForm.description.trim() || null,
        instructions: assignmentForm.instructions.trim() || null,
        sort_order: Number(assignmentForm.sort_order) || 1,
        is_active: false,
        is_required: true,
        created_by: userData.user?.id ?? null,
      })
      .select("*")
      .single();
    if (saveError) setError(saveError.message);
    else {
      setAssignments((current) => [...current, data].sort((a, b) => a.sort_order - b.sort_order));
      setAssignmentForm({
        title: "",
        description: "",
        instructions: "",
        sort_order: String(visibleAssignments.length + 1),
      });
    }
    setBusy(null);
  };

  const toggle = async (
    table: "l1_courses" | "l1_course_lessons" | "l1_course_modules" | "l1_assignments",
    id: string,
    value: boolean,
  ) => {
    setBusy(id);
    const { error: updateError } = await supabase
      .from(table)
      .update({ is_active: value })
      .eq("id", id);
    if (updateError) setError(updateError.message);
    else await load();
    setBusy(null);
  };

  const reviewSubmission = async (submission: Submission, status: Submission["status"], feedback: string) => {
    setBusy(submission.id);
    // reviewer_id is stamped by the database (stamp_submission_reviewer) from the signed-in admin.
    const { error: updateError } = await supabase
      .from("l1_assignment_submissions")
      .update({
        status,
        reviewed_at:
          status === "reviewed" || status === "needs_revision" ? new Date().toISOString() : null,
        feedback: feedback.trim() || null,
      })
      .eq("id", submission.id);
    if (updateError) setError(updateError.message);
    else await load();
    setBusy(null);
  };

  return (
    <AdminShell
      title="L1 Silver Learning"
      subtitle="Build and publish the L1 course structure, lessons and assignments, then review Leader submissions from one admin workspace."
    >
      <div className="space-y-6">
        {error && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        )}

        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Courses</p>
                <p className="mt-1 text-2xl font-bold">{courses.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Lessons</p>
                <p className="mt-1 text-2xl font-bold">{lessons.length}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  Submissions
                </p>
                <p className="mt-1 text-2xl font-bold">{submissions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading L1 learning administration…
            </CardContent>
          </Card>
        ) : (
          <>
            <section className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="size-5 text-primary" /> Create course
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Input
                    placeholder="Course title"
                    value={courseForm.title}
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Course description"
                    value={courseForm.description}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Sort order"
                    value={courseForm.sort_order}
                    onChange={(e) => setCourseForm({ ...courseForm, sort_order: e.target.value })}
                  />
                  <Button disabled={busy === "course"} onClick={() => void createCourse()}>
                    <Plus /> Add course
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Courses & publishing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {courses.map((course) => (
                    <div
                      key={course.id}
                      className={
                        "rounded-xl border p-4 " +
                        (selectedCourse === course.id
                          ? "border-primary bg-primary/[0.04]"
                          : "border-border")
                      }
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{course.title}</p>
                          <p className="text-xs text-muted-foreground">Order {course.sort_order}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedCourse(course.id)}
                          >
                            Manage
                          </Button>
                          <Button
                            size="sm"
                            variant={course.is_active ? "secondary" : "default"}
                            disabled={busy === course.id}
                            onClick={() => void toggle("l1_courses", course.id, !course.is_active)}
                          >
                            {course.is_active ? "Published" : "Publish"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {courses.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Create the first L1 course above. No content is invented or published
                      automatically.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers3 className="size-5 text-primary" /> Module
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    <option value="">Select course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Module title"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Module description"
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  />
                  <Input
                    type="number"
                    placeholder="Sort order"
                    value={moduleForm.sort_order}
                    onChange={(e) => setModuleForm({ ...moduleForm, sort_order: e.target.value })}
                  />
                  <Button
                    disabled={!selectedCourse || busy === "module"}
                    onClick={() => void createModule()}
                  >
                    <Plus /> Add module
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Modules in selected course</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {visibleModules.map((module) => (
                    <div
                      key={module.id}
                      className={
                        "rounded-xl border p-4 " +
                        (selectedModule === module.id
                          ? "border-primary bg-primary/[0.04]"
                          : "border-border")
                      }
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{module.title}</p>
                          <p className="text-xs text-muted-foreground">Order {module.sort_order}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedModule(module.id)}
                          >
                            Manage
                          </Button>
                          <Button
                            size="sm"
                            variant={module.is_active ? "secondary" : "default"}
                            disabled={busy === module.id}
                            onClick={() =>
                              void toggle("l1_course_modules", module.id, !module.is_active)
                            }
                          >
                            {module.is_active ? "Live" : "Activate"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {visibleModules.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add a module to start building the course.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="size-5 text-primary" /> Add lesson
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                  >
                    <option value="">Select module</option>
                    {modules
                      .filter((m) => m.course_id === selectedCourse)
                      .map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                  </select>
                  <Input
                    placeholder="Lesson title"
                    value={lessonForm.title}
                    onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  />
                  <Textarea
                    placeholder="Lesson description"
                    value={lessonForm.description}
                    onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })}
                  />
                  <Input
                    placeholder="Video embed URL (optional)"
                    value={lessonForm.video_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
                  />
                  <Input
                    placeholder="Resource URL (optional)"
                    value={lessonForm.resource_url}
                    onChange={(e) => setLessonForm({ ...lessonForm, resource_url: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      type="number"
                      placeholder="Minutes"
                      value={lessonForm.duration_minutes}
                      onChange={(e) =>
                        setLessonForm({ ...lessonForm, duration_minutes: e.target.value })
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Sort order"
                      value={lessonForm.sort_order}
                      onChange={(e) => setLessonForm({ ...lessonForm, sort_order: e.target.value })}
                    />
                  </div>
                  <Button
                    disabled={!selectedModule || busy === "lesson"}
                    onClick={() => void createLesson()}
                  >
                    <Plus /> Add lesson
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Lessons in selected module</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {visibleLessons.map((lesson) => (
                    <div key={lesson.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.video_url ? "Video URL added" : "No video URL"} · order{" "}
                            {lesson.sort_order}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={lesson.is_active ? "secondary" : "default"}
                          disabled={busy === lesson.id}
                          onClick={() =>
                            void toggle("l1_course_lessons", lesson.id, !lesson.is_active)
                          }
                        >
                          {lesson.is_active ? "Published" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {visibleLessons.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add lessons here. They stay unpublished until you explicitly publish them.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Add assignment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <select
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={selectedModule}
                    onChange={(e) => setSelectedModule(e.target.value)}
                  >
                    <option value="">Select module</option>
                    {modules
                      .filter((m) => m.course_id === selectedCourse)
                      .map((module) => (
                        <option key={module.id} value={module.id}>
                          {module.title}
                        </option>
                      ))}
                  </select>
                  <Input
                    placeholder="Assignment title"
                    value={assignmentForm.title}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, title: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Short description"
                    value={assignmentForm.description}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, description: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Assignment instructions"
                    value={assignmentForm.instructions}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, instructions: e.target.value })
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Sort order"
                    value={assignmentForm.sort_order}
                    onChange={(e) =>
                      setAssignmentForm({ ...assignmentForm, sort_order: e.target.value })
                    }
                  />
                  <Button
                    disabled={!selectedModule || busy === "assignment"}
                    onClick={() => void createAssignment()}
                  >
                    <Plus /> Add assignment
                  </Button>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Assignments in selected module</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {visibleAssignments.map((assignment) => (
                    <div key={assignment.id} className="rounded-xl border border-border p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">{assignment.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Required · order {assignment.sort_order}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant={assignment.is_active ? "secondary" : "default"}
                          disabled={busy === assignment.id}
                          onClick={() =>
                            void toggle("l1_assignments", assignment.id, !assignment.is_active)
                          }
                        >
                          {assignment.is_active ? "Published" : "Publish"}
                        </Button>
                      </div>
                    </div>
                  ))}
                  {visibleAssignments.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Add assignments to make practical work part of L1 completion.
                    </p>
                  )}
                </CardContent>
              </Card>
            </section>

            <Card>
              <CardHeader>
                <CardTitle>L1 Leader progress</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Lesson completion for active L1 Leaders, plus required assignment submission
                  counts.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {activeL1Students.map((membership) => {
                  const profile = profiles[membership.student_id];
                  const completed = lessonProgress.filter(
                    (item) =>
                      item.student_id === membership.student_id &&
                      item.status === "completed" &&
                      lessons.some((lesson) => lesson.id === item.lesson_id && lesson.is_active),
                  ).length;
                  const submitted = submissions.filter(
                    (item) =>
                      item.student_id === membership.student_id &&
                      assignments.some(
                        (assignment) =>
                          assignment.id === item.assignment_id &&
                          assignment.is_active &&
                          assignment.is_required,
                      ),
                  ).length;
                  const units = totalPublishedLessons + requiredPublishedAssignments;
                  const percent = units ? Math.round(((completed + submitted) / units) * 100) : 0;
                  return (
                    <div
                      key={membership.student_id}
                      className="rounded-xl border border-border p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold">
                            {profile?.full_name ?? membership.student_id}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {completed}/{totalPublishedLessons} lessons · {submitted}/
                            {requiredPublishedAssignments} required assignments
                          </p>
                        </div>
                        <Badge>{percent}%</Badge>
                      </div>
                    </div>
                  );
                })}
                {activeL1Students.length === 0 && (
                  <p className="text-sm text-muted-foreground">No active L1 Leaders yet.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Leader assignment submissions</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Central review queue for every L1 Leader assignment submission.
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {submissions.map((submission) => {
                  const assignment = assignments.find(
                    (item) => item.id === submission.assignment_id,
                  );
                  const student = profiles[submission.student_id];
                  return (
                    <div key={submission.id} className="rounded-xl border border-border p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold">{assignment?.title ?? "Assignment"}</p>
                          <p className="text-xs text-muted-foreground">
                            {student?.full_name ?? submission.student_id} ·{" "}
                            {new Date(submission.submitted_at).toLocaleString()}
                          </p>
                        </div>
                        <Badge variant={submission.status === "reviewed" ? "default" : "outline"}>
                          {submission.status}
                        </Badge>
                      </div>
                      {submission.submission_text && (
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6">
                          {submission.submission_text}
                        </p>
                      )}
                      {submission.submission_url && (
                        <p className="mt-2 break-all text-sm text-primary">
                          {submission.submission_url}
                        </p>
                      )}
                      <Textarea
                        className="mt-4 min-h-24"
                        placeholder="Write feedback for the Leader…"
                        value={feedbackDrafts[submission.id] ?? submission.feedback ?? ""}
                        onChange={(event) =>
                          setFeedbackDrafts((current) => ({
                            ...current,
                            [submission.id]: event.target.value,
                          }))
                        }
                        disabled={busy === submission.id}
                      />
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === submission.id}
                          onClick={() => void reviewSubmission(submission, "under_review", feedbackDrafts[submission.id] ?? submission.feedback ?? "")}
                        >
                          <Save /> Mark under review
                        </Button>
                        <Button
                          size="sm"
                          disabled={busy === submission.id}
                          onClick={() => void reviewSubmission(submission, "reviewed", feedbackDrafts[submission.id] ?? submission.feedback ?? "")}
                        >
                          <CheckCircle2 /> Mark reviewed
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={busy === submission.id}
                          onClick={() => void reviewSubmission(submission, "needs_revision", feedbackDrafts[submission.id] ?? submission.feedback ?? "")}
                        >
                          Needs revision
                        </Button>
                      </div>
                    </div>
                  );
                })}
                {submissions.length === 0 && (
                  <p className="text-sm text-muted-foreground">No Leader submissions yet.</p>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardContent className="p-5 text-sm text-muted-foreground">
            Publishing is explicit: creating a course, lesson or assignment never makes it visible
            to Leaders automatically. This keeps unfinished content private until you publish it.
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
