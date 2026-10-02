import { createFileRoute } from "@tanstack/react-router";

import { JobsPage } from "@/components/dashboard/jobs-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard/jobs")({
  beforeLoad: () => requireRole("student"),
  head: () => ({
    meta: [
      { title: "Jobs | Tech Leader Hub" },
      { name: "description", content: "Browse TLH job opportunities and track your applications." },
    ],
  }),
  component: JobsPage,
});
