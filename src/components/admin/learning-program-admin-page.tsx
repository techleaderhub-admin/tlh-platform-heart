import { BookOpen, FileText, GraduationCap, Layers3, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type CountState = {
  foundation: number;
  l1Courses: number;
  l1Lessons: number;
  l1Assignments: number;
  l3Programs: number;
  l3Courses: number;
  l3Lessons: number;
  l3Assignments: number;
};

export function LearningProgramAdminPage() {
  const [counts, setCounts] = useState<CountState>({
    foundation: 0, l1Courses: 0, l1Lessons: 0, l1Assignments: 0,
    l3Programs: 0, l3Courses: 0, l3Lessons: 0, l3Assignments: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [foundation, l1Courses, l1Lessons, l1Assignments, l3Programs, l3Courses, l3Lessons, l3Assignments] = await Promise.all([
        supabase.from("foundation_resources").select("id", { count: "exact", head: true }),
        supabase.from("l1_courses").select("id", { count: "exact", head: true }),
        supabase.from("l1_course_lessons").select("id", { count: "exact", head: true }),
        supabase.from("l1_assignments").select("id", { count: "exact", head: true }),
        supabase.from("l3_programs").select("id", { count: "exact", head: true }),
        supabase.from("l3_courses").select("id", { count: "exact", head: true }),
        supabase.from("l3_course_lessons").select("id", { count: "exact", head: true }),
        supabase.from("l3_assignments").select("id", { count: "exact", head: true }),
      ]);
      const results = [foundation, l1Courses, l1Lessons, l1Assignments, l3Programs, l3Courses, l3Lessons, l3Assignments];
      const failed = results.some((result) => result.error);
      if (failed) {
        setError("Some learning/program counts could not be loaded.");
      } else {
        setCounts({
          foundation: foundation.count ?? 0,
          l1Courses: l1Courses.count ?? 0,
          l1Lessons: l1Lessons.count ?? 0,
          l1Assignments: l1Assignments.count ?? 0,
          l3Programs: l3Programs.count ?? 0,
          l3Courses: l3Courses.count ?? 0,
          l3Lessons: l3Lessons.count ?? 0,
          l3Assignments: l3Assignments.count ?? 0,
        });
      }
      setLoading(false);
    };
    void load();
  }, []);

  const areas = [
    {
      title: "Free / L0 Foundation",
      description: "Publish and control the assigned foundation reading/resources used by the entry journey.",
      icon: FileText,
      href: "/admin/foundation" as const,
      stats: `${counts.foundation} resources`,
      action: "Manage foundation",
    },
    {
      title: "L1 Silver Learning",
      description: "Build courses, modules, lessons and assignments, publish learning content, and review submissions.",
      icon: GraduationCap,
      href: "/admin/l1-learning" as const,
      stats: `${counts.l1Courses} courses · ${counts.l1Lessons} lessons · ${counts.l1Assignments} assignments`,
      action: "Manage L1",
    },
    {
      title: "L3 Career Track",
      description: "Build programs, courses, modules, lessons and assignments, then review Leader work.",
      icon: Layers3,
      href: "/admin/l3-course" as const,
      stats: `${counts.l3Programs} programs · ${counts.l3Courses} courses · ${counts.l3Lessons} lessons · ${counts.l3Assignments} assignments`,
      action: "Manage L3",
    },
  ];

  return (
    <AdminShell
      title="Learning & Programs"
      subtitle="Central administration for the TLH learning journey across Foundation, L1 Silver and the L3 Career Track."
    >
      <div className="space-y-6">
        {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card>}

        <Card className="border-primary/20 bg-primary/[0.03]">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <BookOpen className="mt-1 size-6 text-primary" />
              <div>
                <p className="font-semibold">One place to manage the learning journey</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Choose the membership stage you want to manage. Existing detailed admin workspaces remain the source of truth for publishing and Leader-submission operations.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid gap-4 lg:grid-cols-3">
          {areas.map(({ title, description, icon: Icon, href, stats, action }) => (
            <Card key={title} className="flex h-full flex-col">
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{title}</CardTitle>
                  <Badge variant="outline">{loading ? "Loading…" : stats}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="flex-1 text-sm leading-6 text-muted-foreground">{description}</p>
                <Button className="mt-5 w-full" asChild>
                  <Link to={href}>{action}<ArrowRight /></Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <Card>
          <CardHeader><CardTitle>V1 learning hierarchy</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <div className="rounded-xl border p-4"><p className="font-semibold">Foundation</p><p className="mt-1 text-muted-foreground">Assigned resource → reading progress → completion</p></div>
              <div className="rounded-xl border p-4"><p className="font-semibold">L1</p><p className="mt-1 text-muted-foreground">Course → module → lesson → assignment → submission</p></div>
              <div className="rounded-xl border p-4"><p className="font-semibold">L3</p><p className="mt-1 text-muted-foreground">Program → course → module → lesson → assignment</p></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
