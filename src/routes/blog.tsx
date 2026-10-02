import { createFileRoute } from "@tanstack/react-router";
import { BlogIndexPage } from "@/components/blog/blog-index-page";
import { SITE_URL } from "@/components/home/home-content";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "TLH Blog | Tech Leader Hub" },
      { name: "description", content: "Android career, architecture, interview, system design and technical leadership insights from Tech Leader Hub." },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "TLH Blog | Tech Leader Hub" },
      { property: "og:description", content: "Practical ideas for Android engineers building toward technical leadership." },
      { property: "og:url", content: SITE_URL + "/blog" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/blog" }],
  }),
  component: BlogIndexPage,
});
