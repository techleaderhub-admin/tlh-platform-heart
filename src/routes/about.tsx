import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell, ContentSection } from "@/components/public-site/public-page-shell";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [
    { title: "About Tech Leader Hub | Career Acceleration" },
    { name: "description", content: "Learn what Tech Leader Hub is and how its career acceleration approach connects direction, capability, credibility, and leadership." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Tech Leader Hub" },
    { property: "og:url", content: "https://techleaderhub.com/about" },
    { property: "og:title", content: "About Tech Leader Hub | Career Acceleration" },
    { property: "og:description", content: "Learn what Tech Leader Hub is and how its career acceleration approach connects direction, capability, credibility, and leadership." },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "About Tech Leader Hub | Career Acceleration" },
    { name: "twitter:description", content: "Learn what Tech Leader Hub is and how its career acceleration approach connects direction, capability, credibility, and leadership." },
  ], links: [{ rel: "canonical", href: "https://techleaderhub.com/about" }] }),
  component: AboutPage,
});

function AboutPage() {
  return <PublicPageShell eyebrow="About TLH" title="Career growth works better when every move connects." description="Tech Leader Hub is a career acceleration platform designed to help technology professionals move with greater clarity, capability, credibility, and direction.">
    <ContentSection title="What is Tech Leader Hub?"><p>TLH brings career strategy, focused development, practical execution, and leadership progression into one connected journey.</p><p>The platform is designed around a simple idea: career growth becomes more intentional when you understand where you are, define where you want to go, build the capabilities required, and create evidence that supports your next move.</p></ContentSection>
    <ContentSection title="Our destination"><p>Android is an entry point for the ecosystem, while the longer-term destination is broader technology leadership.</p><p>TLH is being built to support professionals as their scope grows—from stronger technical execution to senior, staff, architect, and leadership responsibilities.</p></ContentSection>
    <ContentSection title="How we work"><div className="grid gap-4 sm:grid-cols-2"><div className="border border-border bg-card/50 p-6"><h3 className="font-heading font-bold text-foreground">Structured</h3><p className="mt-2">A connected progression instead of disconnected career tactics.</p></div><div className="border border-border bg-card/50 p-6"><h3 className="font-heading font-bold text-foreground">Practical</h3><p className="mt-2">Focus on actions, evidence, preparation, and execution.</p></div></div></ContentSection>
  </PublicPageShell>;
}
