import { createFileRoute } from "@tanstack/react-router";

import { MasterclassPage } from "@/components/masterclass/masterclass-page";
import { SITE_URL } from "@/components/home/home-content";

const TITLE = "Free Masterclass: Senior Android Engineers to Tech Leaders | Tech Leader Hub";
const DESCRIPTION =
  "Free live masterclass with Nikhil Kumar Rai. The Clean Architecture, System Design (HLD/LLD) and AI-augmented roadmap experienced Android developers use to move from service companies to tier-1 product roles.";
const URL = `${SITE_URL}/masterclass`;
const OG_IMAGE = `${SITE_URL}/og-home.jpg`;

export const Route = createFileRoute("/masterclass")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#0a0b0e" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Tech Leader Hub" },
      { property: "og:url", content: URL },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: URL }],
  }),
  component: MasterclassPage,
});
