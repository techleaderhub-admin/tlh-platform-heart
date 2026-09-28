import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/get-started")({
  head: () => ({
    meta: [
      { title: "Get Started | Tech Leader Hub" },
      { name: "description", content: "Get started with Tech Leader Hub. The full landing experience is coming soon." },
      { property: "og:title", content: "Get Started | Tech Leader Hub" },
      { property: "og:description", content: "Get started with Tech Leader Hub. The full landing experience is coming soon." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GetStartedPage,
});

function GetStartedPage() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-background px-5 py-20 text-foreground">
      <div className="home-grid absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto w-full max-w-2xl border border-border bg-card/80 p-7 shadow-2xl backdrop-blur-sm sm:p-12">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="size-4" /> Back to home</Link>
        <span className="mt-12 flex size-12 items-center justify-center rounded-md bg-secondary text-accent"><Compass className="size-6" /></span>
        <p className="mt-8 text-sm font-bold uppercase text-accent">Get started</p>
        <h1 className="mt-3 font-heading text-4xl font-extrabold sm:text-5xl">Your next step is coming soon.</h1>
        <p className="mt-5 text-lg leading-8 text-muted-foreground">The dedicated Tech Leader Hub get-started experience will be built in an upcoming phase. Existing members can continue to sign in securely.</p>
        <Button asChild className="mt-8"><Link to="/login">Member sign in <ArrowRight /></Link></Button>
      </div>
    </main>
  );
}