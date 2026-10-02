import { createFileRoute } from "@tanstack/react-router";
import { BlogAdminPage } from "@/components/admin/blog-admin-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/admin/blog")({
  beforeLoad: () => requireRole("admin"),
  head: () => ({ meta: [
    { title: "Blog & SEO | Tech Leader Hub" },
    { name: "description", content: "Admin blog publishing and SEO workspace." },
  ]}),
  component: BlogAdminPage,
});
