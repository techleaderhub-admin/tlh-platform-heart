import { createFileRoute } from "@tanstack/react-router";

import { AdminOverviewPage } from "@/components/admin/admin-overview-page";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminOverviewPage,
});
