import { createFileRoute } from "@tanstack/react-router";

import { FoundationResourcesAdminPage } from "@/components/admin/foundation-resources-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/foundation")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({
    meta: [
      { title: "Foundation Reading | TLH Admin" },
      { name: "description", content: "Manage TLH Free/L0 foundation reading resources." },
    ],
  }),
  component: FoundationResourcesAdminPage,
});
