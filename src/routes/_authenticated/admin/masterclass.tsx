import { createFileRoute } from "@tanstack/react-router";

import { MasterclassRegistrationsPage } from "@/components/admin/masterclass-registrations-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/masterclass")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({ meta: [{ title: "Masterclass Registrations | Tech Leader Hub" }] }),
  component: () => <MasterclassRegistrationsPage />,
});
