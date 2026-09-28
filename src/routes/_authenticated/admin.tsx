import { createFileRoute } from "@tanstack/react-router";

import { MasterclassRegistrationsPage } from "@/components/admin/masterclass-registrations-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Masterclass Registrations | Tech Leader Hub" },
      {
        name: "description",
        content: "Secure Tech Leader Hub masterclass registration management.",
      },
      { property: "og:title", content: "Masterclass Registrations | Tech Leader Hub" },
      {
        property: "og:description",
        content: "Secure Tech Leader Hub masterclass registration management.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminDashboard,
});

function AdminDashboard() {
  return <MasterclassRegistrationsPage />;
}
