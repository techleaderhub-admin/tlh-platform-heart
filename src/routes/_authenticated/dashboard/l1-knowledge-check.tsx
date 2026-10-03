import { createFileRoute } from "@tanstack/react-router";

import { L1KnowledgeCheckPage } from "@/components/dashboard/l1-knowledge-check-page";
import { requireMembership } from "@/lib/membership-access";

export const Route = createFileRoute("/_authenticated/dashboard/l1-knowledge-check")({
  beforeLoad: () => requireMembership("l1", "Silver Knowledge Check"),
  head: () => ({
    meta: [
      { title: "L1 Knowledge Check | Tech Leader Hub" },
      { name: "description", content: "Complete the Tech Leader Hub L1 Silver Android knowledge check." },
    ],
  }),
  component: L1KnowledgeCheckPage,
});
