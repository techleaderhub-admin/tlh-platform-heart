import { createFileRoute } from "@tanstack/react-router";

import { ApplicationsAdminPage } from "@/components/admin/applications-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/applications")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Application Oversight | TLH Admin" },
      { name: "description", content: "Review and manage Leader job applications." },
    ],
  }),
  component: ApplicationsAdminPage,
});
