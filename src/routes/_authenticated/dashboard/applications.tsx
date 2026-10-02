import { createFileRoute } from "@tanstack/react-router";

import { ApplicationsPage } from "@/components/dashboard/applications-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard/applications")({
  beforeLoad: () => requireRole("student"),
  head: () => ({
    meta: [
      { title: "My Applications | Tech Leader Hub" },
      { name: "description", content: "Track saved jobs, application status and preparation notes." },
    ],
  }),
  component: ApplicationsPage,
});
