import { createFileRoute } from "@tanstack/react-router";

import { StudentsPage } from "@/components/admin/students-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/students")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({ meta: [{ title: "Leaders | Tech Leader Hub" }] }),
  component: StudentsPage,
});
