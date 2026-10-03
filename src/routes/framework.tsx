import { createFileRoute } from "@tanstack/react-router";
import { PublicPageShell } from "@/components/public-site/public-page-shell";

const stages = [
  ["01","Diagnose","Understand your current position, gaps, strengths, and constraints."],
  ["02","Position","Clarify your direction, value, target role, and professional narrative."],
  ["03","Upgrade","Build the capabilities your target trajectory requires."],
  ["04","Prove","Create credible evidence of skills, impact, and readiness."],
  ["05","Prepare","Build a focused strategy for the opportunities ahead."],
  ["06","Activate","Move from planning into consistent, visible action."],
  ["07","Convert","Navigate selection processes with structured preparation."],
  ["08","Negotiate","Approach offer conversations with preparation and clarity."],
  ["09","Advance","Continue growing toward greater scope, influence, and leadership."],
];

export const Route = createFileRoute("/framework")({
  head: () => ({ meta: [
    { title: "TLH Framework | 9-Stage Career Acceleration Framework" },
    { name: "description", content: "Explore the nine-stage Tech Leader Hub career acceleration framework: Diagnose, Position, Upgrade, Prove, Prepare, Activate, Convert, Negotiate, Advance." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Tech Leader Hub" },
    { property: "og:url", content: "https://techleaderhub.com/framework" },
    { property: "og:title", content: "TLH Framework | 9-Stage Career Acceleration Framework" },
    { property: "og:description", content: "Explore the nine-stage Tech Leader Hub career acceleration framework: Diagnose, Position, Upgrade, Prove, Prepare, Activate, Convert, Negotiate, Advance." },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "TLH Framework | 9-Stage Career Acceleration Framework" },
    { name: "twitter:description", content: "Explore the nine-stage Tech Leader Hub career acceleration framework: Diagnose, Position, Upgrade, Prove, Prepare, Activate, Convert, Negotiate, Advance." },
  ], links: [{ rel: "canonical", href: "https://techleaderhub.com/framework" }] }),
  component: FrameworkPage,
});

function FrameworkPage() {
  return <PublicPageShell eyebrow="The TLH Framework" title="Nine stages. One connected progression." description="A structured journey from understanding your present position to advancing with greater scope and leadership.">
    <section className="py-16 sm:py-20"><div className="mx-auto grid max-w-5xl gap-4 px-5 sm:px-8 md:grid-cols-2 lg:grid-cols-3 lg:px-10">
      {stages.map(([number,name,detail]) => <article key={number} className="border border-border bg-card/50 p-6"><span className="font-heading text-sm font-bold text-accent">{number}</span><h2 className="mt-8 font-heading text-xl font-bold">{name}</h2><p className="mt-3 leading-7 text-muted-foreground">{detail}</p></article>)}
    </div></section>
  </PublicPageShell>;
}
