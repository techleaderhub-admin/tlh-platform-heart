import { createFileRoute } from "@tanstack/react-router";

import { InterviewQuestionsAdminPage } from "@/components/admin/interview-questions-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/interview-questions")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Interview Question Bank | TLH Admin" },
      { name: "description", content: "Review, curate and publish TLH interview questions." },
    ],
  }),
  component: InterviewQuestionsAdminPage,
});
