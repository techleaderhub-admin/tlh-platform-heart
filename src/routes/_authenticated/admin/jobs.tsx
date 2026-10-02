import { createFileRoute } from "@tanstack/react-router";

import { JobsAdminPage } from "@/components/admin/jobs-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Jobs Management | TLH Admin" },
      { name: "description", content: "Publish and maintain jobs in the TLH student job board." },
    ],
  }),
  component: JobsAdminPage,
});
