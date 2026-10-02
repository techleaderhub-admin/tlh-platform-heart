import { createFileRoute } from "@tanstack/react-router";

import { StudentDashboardPage } from "@/components/dashboard/student-dashboard-page";

export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: StudentDashboardIndexPage,
});

function StudentDashboardIndexPage() {
  const identity = Route.useRouteContext();
  return <StudentDashboardPage name={identity.profile.full_name} />;
}
