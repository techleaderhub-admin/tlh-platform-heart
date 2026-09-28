import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/home/home-page";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tech Leader Hub | Build Your Path to Technology Leadership" },
      { name: "description", content: "A structured career acceleration platform for technology professionals progressing toward meaningful technology leadership." },
      { property: "og:title", content: "Tech Leader Hub | Build Your Path to Technology Leadership" },
      { property: "og:description", content: "A structured career acceleration platform for technology professionals progressing toward meaningful technology leadership." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
