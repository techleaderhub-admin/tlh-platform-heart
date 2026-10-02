import { createFileRoute } from "@tanstack/react-router";
import { CareerOsAdminPage } from "@/components/admin/career-os-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/career-os")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({ meta: [
    { title: "Career OS | Admin | Tech Leader Hub" },
    { name: "description", content: "Central Tech Leader Hub Career OS and roadmap administration." },
  ]}),
  component: CareerOsAdmin,
});
function CareerOsAdmin(){ return <CareerOsAdminPage />; }
