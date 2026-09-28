import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPageShell, ContentSection } from "@/components/public-site/public-page-shell";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact Tech Leader Hub" },
    { name: "description", content: "Contact Tech Leader Hub about career acceleration, masterclasses, programs, and the TLH platform." },
  ]}),
  component: ContactPage,
});

function ContactPage() {
  return <PublicPageShell eyebrow="Contact" title="Let's talk about your next career move." description="For masterclass registration, program questions, partnerships, or platform support, use the available TLH channels.">
    <ContentSection title="Masterclass and program enquiries"><p>The fastest way to begin is through the free TLH masterclass. It introduces the framework and gives you a starting point for your career journey.</p><Button asChild><Link to="/masterclass">Join the Masterclass <ArrowRight /></Link></Button></ContentSection>
    <ContentSection title="Email"><div className="flex items-center gap-3 border border-border bg-card/50 p-5"><Mail className="text-accent" /><span className="font-medium text-foreground">techleaderhub@gmail.com</span></div></ContentSection>
  </PublicPageShell>;
}
