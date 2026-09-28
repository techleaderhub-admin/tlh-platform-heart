import { createFileRoute } from "@tanstack/react-router";
import { MasterclassPage } from "@/components/masterclass/masterclass-page";

export const Route = createFileRoute("/masterclass")({
  head: () => ({
    meta: [
      { title: "Free 90-Minute Masterclass | Tech Leader Hub" },
      { name: "description", content: "Join the free 90-minute Tech Leader Hub masterclass for Android developers focused on product-company careers, interviews, positioning, and career growth." },
      { property: "og:title", content: "Free 90-Minute Masterclass | Tech Leader Hub" },
      { property: "og:description", content: "A practical masterclass for Android developers focused on product-company careers, interviews, positioning, and career growth." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MasterclassPage,
});
