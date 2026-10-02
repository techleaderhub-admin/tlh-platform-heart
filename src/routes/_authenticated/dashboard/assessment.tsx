import { createFileRoute } from "@tanstack/react-router";
import { CareerAssessmentPage } from "@/components/dashboard/career-assessment-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard/assessment")({
  beforeLoad: () => requireRole("student"),
  head: () => ({ meta: [{ title: "Career Assessment | Tech Leader Hub" }, { name: "description", content: "Assess your Android career readiness across architecture, Kotlin, system design and leadership." }] }),
  component: CareerAssessment,
});

function CareerAssessment() { return <CareerAssessmentPage />; }
