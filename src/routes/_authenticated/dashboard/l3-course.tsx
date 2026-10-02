import { createFileRoute } from "@tanstack/react-router";
import { L3CoursePage } from "@/components/dashboard/l3-course-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard/l3-course")({
  beforeLoad: () => requireRole("student"),
  head: () => ({ meta: [
    { title: "L3 Career Track | Tech Leader Hub" },
    { name: "description", content: "Access your published TLH L3 career-track course structure." },
  ]}),
  component: L3CoursePage,
});
