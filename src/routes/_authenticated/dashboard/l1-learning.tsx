import { createFileRoute } from "@tanstack/react-router";

import { L1LearningPage } from "@/components/dashboard/l1-learning-page";
import { requireMembership } from "@/lib/membership-access";

export const Route = createFileRoute("/_authenticated/dashboard/l1-learning")({
  beforeLoad: () => requireMembership("l1", "Silver Learning"),
  head: () => ({
    meta: [
      { title: "L1 Silver Learning | Tech Leader Hub" },
      { name: "description", content: "Complete the Tech Leader Hub L1 Silver course, lessons and assignments." },
    ],
  }),
  component: L1LearningPage,
});
