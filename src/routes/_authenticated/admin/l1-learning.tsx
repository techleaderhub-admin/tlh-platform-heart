import { createFileRoute } from "@tanstack/react-router";

import { L1LearningAdminPage } from "@/components/admin/l1-learning-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/l1-learning")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "L1 Learning | TLH Admin" },
      { name: "description", content: "Manage TLH L1 Silver courses, lessons, assignments and submissions." },
    ],
  }),
  component: L1LearningAdminPage,
});
