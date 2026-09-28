import { createFileRoute } from "@tanstack/react-router";

import { AdminOverviewPage } from "@/components/admin/admin-overview-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Admin Overview | Tech Leader Hub" },
      { name: "description", content: "Tech Leader Hub administration workspace." },
    ],
  }),
  component: AdminOverviewPage,
});
