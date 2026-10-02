import { createFileRoute } from "@tanstack/react-router";
import { AssessmentAdminPage } from "@/components/admin/assessment-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/assessment-admin")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({ meta: [
    { title: "Assessment Admin | TLH Admin" },
    { name: "description", content: "Manage L1 and L2 assessment question banks and monitor attempts." },
  ]}),
  component: AssessmentAdminPage,
});
