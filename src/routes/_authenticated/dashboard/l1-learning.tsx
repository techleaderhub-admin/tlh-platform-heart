import { createFileRoute } from "@tanstack/react-router";

import { L1LearningPage } from "@/components/dashboard/l1-learning-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard/l1-learning")({
  beforeLoad: () => requireRole("student"),
  head: () => ({
    meta: [
      { title: "L1 Silver Learning | Tech Leader Hub" },
      { name: "description", content: "Complete the Tech Leader Hub L1 Silver course, lessons and assignments." },
    ],
  }),
  component: L1LearningPage,
});
