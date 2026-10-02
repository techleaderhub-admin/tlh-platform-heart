import { createFileRoute } from "@tanstack/react-router";
import { L3CourseAdminPage } from "@/components/admin/l3-course-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/l3-course")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({ meta: [
    { title: "L3 Career Track | TLH Admin" },
    { name: "description", content: "Build and publish the TLH L3 program, courses, modules and lessons." },
  ]}),
  component: L3CourseAdminPage,
});
