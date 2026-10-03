import { createFileRoute } from "@tanstack/react-router";
import { CareerAssessmentPage } from "@/components/dashboard/career-assessment-page";
import { requireMembership } from "@/lib/membership-access";

export const Route = createFileRoute("/_authenticated/dashboard/assessment")({
  beforeLoad: () => requireMembership("l1", "Career Assessment"),
  head: () => ({ meta: [{ title: "Career Assessment | Tech Leader Hub" }, { name: "description", content: "Assess your Android career readiness across architecture, Kotlin, system design and leadership." }] }),
  component: CareerAssessment,
});

function CareerAssessment() { return <CareerAssessmentPage />; }
