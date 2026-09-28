import { createFileRoute } from "@tanstack/react-router";

import { ProtectedPlaceholder } from "@/components/auth/protected-placeholder";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Admin Dashboard | Tech Leader Hub" },
      { name: "description", content: "The secure Tech Leader Hub administration workspace." },
      { property: "og:title", content: "Admin Dashboard | Tech Leader Hub" },
      { property: "og:description", content: "The secure Tech Leader Hub administration workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const identity = Route.useRouteContext();
  return <ProtectedPlaceholder area="Admin Dashboard" name={identity.profile.full_name} />;
}
