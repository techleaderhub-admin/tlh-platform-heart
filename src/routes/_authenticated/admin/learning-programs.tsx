import { createFileRoute } from "@tanstack/react-router";

import { LearningProgramAdminPage } from "@/components/admin/learning-program-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/learning-programs")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Learning & Programs | TLH Admin" },
      { name: "description", content: "Central TLH learning and program administration for Foundation, L1 and L3." },
    ],
  }),
  component: LearningProgramAdminPage,
});
