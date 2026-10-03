import { createFileRoute } from "@tanstack/react-router";

import { L2KnowledgeCheckPage } from "@/components/dashboard/l2-knowledge-check-page";
import { requireMembership } from "@/lib/membership-access";

export const Route = createFileRoute("/_authenticated/dashboard/l2-knowledge-check")({
  beforeLoad: () => requireMembership("l2", "Gold Knowledge Check"),
  head: () => ({
    meta: [
      { title: "L2 Knowledge Check | Tech Leader Hub" },
      { name: "description", content: "Complete the Tech Leader Hub L2 advanced Android knowledge check." },
    ],
  }),
  component: L2KnowledgeCheckPage,
});
