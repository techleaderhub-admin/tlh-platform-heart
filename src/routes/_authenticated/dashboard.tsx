import { createFileRoute } from "@tanstack/react-router";

import { ProtectedPlaceholder } from "@/components/auth/protected-placeholder";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  beforeLoad: () => requireRole("student"),
  head: () => ({
    meta: [
      { title: "Student Dashboard | Tech Leader Hub" },
      { name: "description", content: "Your secure Tech Leader Hub student workspace." },
      { property: "og:title", content: "Student Dashboard | Tech Leader Hub" },
      { property: "og:description", content: "Your secure Tech Leader Hub student workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentDashboard,
});

function StudentDashboard() {
  const identity = Route.useRouteContext();
  return <ProtectedPlaceholder area="Student Dashboard" name={identity.profile.full_name} />;
}
