import { createFileRoute } from "@tanstack/react-router";

import { MembershipLockedPage } from "@/components/dashboard/membership-locked-page";

export const Route = createFileRoute("/_authenticated/dashboard/access-denied")({
  validateSearch: (search: Record<string, unknown>) => ({
    feature: typeof search.feature === "string" ? search.feature : "This workspace",
    required: typeof search.required === "string" ? search.required : "the required",
  }),
  head: () => ({
    meta: [
      { title: "Membership Required | Tech Leader Hub" },
      { name: "description", content: "This Tech Leader Hub workspace requires a higher membership." },
    ],
  }),
  component: AccessDeniedPage,
});

function AccessDeniedPage() {
  const { feature, required } = Route.useSearch();
  return <MembershipLockedPage feature={feature} required={required} />;
}
