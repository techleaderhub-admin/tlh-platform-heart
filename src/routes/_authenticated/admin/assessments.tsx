import { createFileRoute } from "@tanstack/react-router";

import { CareerAssessmentsAdminPage } from "@/components/admin/career-assessments-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/assessments")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Career Assessments | TLH Admin" },
      { name: "description", content: "Review student career assessments and track skill gaps." },
    ],
  }),
  component: CareerAssessmentsAdminPage,
});
