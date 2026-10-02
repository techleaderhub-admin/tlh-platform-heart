import { createFileRoute } from "@tanstack/react-router";

import { FoundationReadingPage } from "@/components/dashboard/foundation-reading-page";
import { requireRole } from "@/lib/route-auth";

export const Route = createFileRoute("/_authenticated/dashboard/foundation")({
  beforeLoad: () => requireRole("student"),
  head: () => ({
    meta: [
      { title: "Foundation Reading | Tech Leader Hub" },
      { name: "description", content: "Complete your Tech Leader Hub Free/L0 foundation reading journey." },
      { property: "og:title", content: "Foundation Reading | Tech Leader Hub" },
      { property: "og:description", content: "Complete your Tech Leader Hub foundation reading journey." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: FoundationReading,
});

function FoundationReading() {
  return <FoundationReadingPage />;
}
