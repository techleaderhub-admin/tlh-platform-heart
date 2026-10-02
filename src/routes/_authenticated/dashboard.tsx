import { createFileRoute } from "@tanstack/react-router";

import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: () => requireRole("student"),
  head: () => ({
    meta: [
      { title: "Leader Dashboard | Tech Leader Hub" },
      { name: "description", content: "Your secure Tech Leader Hub Leader workspace." },
      { property: "og:title", content: "Leader Dashboard | Tech Leader Hub" },
      { property: "og:description", content: "Your secure Tech Leader Hub Leader workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});
