import { createFileRoute } from "@tanstack/react-router";

import { CareerProfilePage } from "@/components/dashboard/career-profile-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard/profile")({
  beforeLoad: () => requireRole("student"),
  head: () => ({
    meta: [
      { title: "Career Profile | Tech Leader Hub" },
      { name: "description", content: "Build and maintain your Tech Leader Hub career profile." },
      { property: "og:title", content: "Career Profile | Tech Leader Hub" },
      { property: "og:description", content: "Build and maintain your Tech Leader Hub career profile." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: CareerProfile,
});

function CareerProfile() {
  return <CareerProfilePage />;
}
