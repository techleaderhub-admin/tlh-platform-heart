import { createFileRoute } from "@tanstack/react-router";
import { CareerOsPage } from "@/components/dashboard/career-os-page";
import { requireMembership } from "@/lib/membership-access";

export const Route = createFileRoute("/_authenticated/dashboard/career-os")({
  beforeLoad: () => requireMembership("l3", "Career OS"),
  head: () => ({ meta: [
    { title: "Career OS | Tech Leader Hub" },
    { name: "description", content: "Your personalized Tech Leader Hub career roadmap and skill-gap workspace." },
  ]}),
  component: CareerOs,
});
function CareerOs(){ return <CareerOsPage />; }
