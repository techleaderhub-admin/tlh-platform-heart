import { createFileRoute } from "@tanstack/react-router";

import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Admin Workspace | Tech Leader Hub" },
      { name: "description", content: "Tech Leader Hub administration workspace." },
    ],
  }),
});
