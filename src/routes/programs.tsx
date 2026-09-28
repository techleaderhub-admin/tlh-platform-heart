import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPageShell, ContentSection } from "@/components/public-site/public-page-shell";

export const Route = createFileRoute("/programs")({
  head: () => ({ meta: [
    { title: "TLH Programs | Tech Leader Hub" },
    { name: "description", content: "Explore the Tech Leader Hub career acceleration journey and upcoming programs for technology professionals." },
  ]}),
  component: ProgramsPage,
});

function ProgramsPage() {
  return <PublicPageShell eyebrow="Programs" title="A progression built around your career stage." description="TLH programs will connect diagnosis, capability building, proof, interview readiness, opportunity conversion, and continued advancement.">
    <ContentSection title="Career Readiness"><p>Start by understanding your current position and the areas that matter most for your target trajectory.</p></ContentSection>
    <ContentSection title="Android Career Acceleration"><p>A focused path for experienced Android engineers who want stronger technical depth, interview readiness, positioning, and career momentum.</p></ContentSection>
    <ContentSection title="Future leadership paths"><p>The TLH roadmap expands beyond Android toward software engineering, staff and architect progression, and engineering leadership.</p></ContentSection>
    <section className="py-16 text-center sm:py-20"><h2 className="font-heading text-3xl font-bold">Start with the free masterclass.</h2><p className="mx-auto mt-4 max-w-2xl text-muted-foreground">Get an introduction to the TLH approach and the career progression behind it.</p><Button asChild size="lg" className="mt-7"><Link to="/masterclass">Join the Masterclass <ArrowRight /></Link></Button></section>
  </PublicPageShell>;
}
