import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/components/home/home-page";
import { LINKS, SITE_URL, faqs } from "@/components/home/home-content";

const TITLE = "Tech Leader Hub | Android Career Acceleration & Interview Coaching";
const DESCRIPTION =
  "Tech Leader Hub helps experienced Android developers overcome career stagnation, prepare for architecture and system-design interviews, and move toward stronger product-company roles with Nikhil Rai.";
const OG_IMAGE = `${SITE_URL}/og-home.jpg`;

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Tech Leader Hub",
      alternateName: "TLH",
      url: `${SITE_URL}/`,
      logo: `${SITE_URL}/tlh-icon.png`,
      slogan: "Learn. Grow. Lead.",
      description:
        "Career acceleration for experienced Android developers moving into product-company roles and technical leadership.",
      founder: { "@id": `${SITE_URL}/#nikhil-rai` },
      sameAs: [LINKS.instagram, LINKS.facebook, LINKS.linkedin, LINKS.youtube],
    },
    {
      "@type": "Organization",
      "@id": "https://www.droidskool.com/#organization",
      name: "Droid Skool",
      url: "https://www.droidskool.com/",
      founder: { "@id": `${SITE_URL}/#nikhil-rai` },
    },
    {
      "@type": "Person",
      "@id": `${SITE_URL}/#nikhil-rai`,
      name: "Nikhil Rai",
      jobTitle: "Founder, Droid Skool and Tech Leader Hub",
      description:
        "Android architect and career coach with more than 13 years of experience at companies including Ola, PayU and Gameskraft. Founder of Droid Skool and Tech Leader Hub.",
      worksFor: [
        { "@id": `${SITE_URL}/#organization` },
        { "@id": "https://www.droidskool.com/#organization" },
      ],
      knowsAbout: [
        "Android development",
        "Kotlin",
        "Mobile system design",
        "Android architecture",
        "Technical interviews",
        "Career coaching",
      ],
      image: `${SITE_URL}/images/nikhil/nikhil-rai-standing-1200.webp`,
      sameAs: [LINKS.nikhilLinkedIn, LINKS.youtube, LINKS.droidSkool],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: "Tech Leader Hub",
      publisher: { "@id": `${SITE_URL}/#organization` },
      inLanguage: "en-IN",
    },
    {
      "@type": "FAQPage",
      "@id": `${SITE_URL}/#faq`,
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
  ],
};

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#07111f" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Tech Leader Hub" },
      { property: "og:locale", content: "en_IN" },
      { property: "og:url", content: `${SITE_URL}/` },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:alt", content: "Tech Leader Hub" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      { "script:ld+json": structuredData },
    ],
    links: [
      { rel: "canonical", href: `${SITE_URL}/` },
    ],
  }),
  component: HomePage,
});
