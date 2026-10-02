import { createFileRoute } from "@tanstack/react-router";

import { InterviewQuestionsPage } from "@/components/dashboard/interview-questions-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard/interview-questions")({
  beforeLoad: () => requireRole("student"),
  head: () => ({
    meta: [
      { title: "Interview Question Bank | Tech Leader Hub" },
      { name: "description", content: "Study and submit real Android interview questions in the TLH question bank." },
    ],
  }),
  component: InterviewQuestionsPage,
});
