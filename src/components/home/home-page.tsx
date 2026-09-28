import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock3,
  Code2,
  Layers3,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  X,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TLHLogo } from "@/components/brand/tlh-logo";

const framework = [
  ["01", "Diagnose", "Understand exactly what is keeping your career stuck."],
  ["02", "Position", "Define the role, level and opportunity you are actually targeting."],
  ["03", "Upgrade", "Close the technical gaps that senior interviews expose."],
  ["04", "Prove", "Turn your experience into evidence recruiters can understand."],
  ["05", "Prepare", "Build interview readiness across Android, Kotlin, HLD and LLD."],
  ["06", "Activate", "Start executing a focused job-switch strategy."],
  ["07", "Convert", "Handle interviews with stronger technical and communication depth."],
  ["08", "Negotiate", "Approach compensation conversations with preparation."],
  ["09", "Advance", "Build toward greater scope, ownership and leadership."],
];

const audience = [
  {
    icon: Clock3,
    title: "“I keep delaying my switch.”",
    text: "You have been thinking about changing companies for months. You know you need to move, but preparation never seems to become a consistent system.",
  },
  {
    icon: Target,
    title: "“I interview, but I don't convert.”",
    text: "You have real production experience, yet interviews expose gaps in architecture, system design, Kotlin depth or the way you communicate your decisions.",
  },
  {
    icon: TrendingUp,
    title: "“My experience is growing. My career isn't.”",
    text: "Your years of experience keep increasing, while salary, role scope or the quality of opportunities do not move at the same pace.",
  },
];

const takeaways = [
  ["01", "Why experienced Android developers get stuck", "See the gap between doing Android work every day and being ready for the level the market expects next."],
  ["02", "The Senior → Lead → Architect capability map", "Understand which technical depth, system thinking and ownership signals matter as your responsibility grows."],
  ["03", "The interview readiness system", "Learn how to prepare Android, Kotlin, architecture, HLD, LLD and problem-solving as one connected system."],
  ["04", "The career positioning framework", "Turn your existing experience into a sharper professional story instead of starting from zero again."],
];

const faqs = [
  ["Is this really free?", "Yes. The masterclass is a free 90-minute live session. There is no requirement to purchase anything to attend."],
  ["Who is this masterclass for?", "It is designed primarily for experienced Android developers who feel stuck, are considering a switch, are interviewing without enough conversions, or want to move toward Senior, Lead or Architect-level opportunities."],
  ["Is this another Android coding course?", "No. The focus is career acceleration: technical depth, architecture thinking, interview readiness, positioning and execution. It is not a beginner syntax course."],
  ["What will I get from the session?", "You will get a clearer view of the capability gaps to work on, a connected career framework and practical next steps for your current career stage."],
  ["What if I cannot attend live?", "Register first so your details are captured. The live session schedule and next-step information can then be shared with you."],
];

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only z-50 bg-accent px-4 py-3 text-accent-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            onClick={closeMenu}
            className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Tech Leader Hub home"
          >
            <TLHLogo className="hidden h-10 w-auto max-w-[190px] object-contain sm:block" />
            <TLHLogo variant="icon" className="size-10 object-contain sm:hidden" />
          </Link>

          <nav className="hidden items-center gap-8 lg:flex" aria-label="Main navigation">
            <a href="#why" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Why this class</a>
            <a href="#inside" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Inside</a>
            <a href="#framework" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Framework</a>
            <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
            <Button asChild size="sm" className="rounded-full px-5">
              <Link to="/masterclass">Reserve My Free Seat <ArrowRight /></Link>
            </Button>
          </nav>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {menuOpen ? (
          <div id="mobile-menu" className="border-t border-border bg-background/95 px-5 py-5 backdrop-blur-2xl lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col" aria-label="Mobile navigation">
              {[
                ["Why this class", "#why"],
                ["Inside", "#inside"],
                ["Framework", "#framework"],
                ["FAQ", "#faq"],
              ].map(([label, href]) => (
                <a
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className="border-b border-border/60 py-4 text-sm font-medium"
                >
                  {label}
                </a>
              ))}
              <Button asChild className="mt-5 h-12 rounded-full">
                <Link to="/masterclass" onClick={closeMenu}>Reserve My Free Seat <ArrowRight /></Link>
              </Button>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="main-content">
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border pt-28 sm:pt-32">
          <div className="hero-grid absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="absolute left-1/2 top-24 size-[420px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl sm:size-[650px]" aria-hidden="true" />
          <div className="relative mx-auto grid min-h-[calc(100svh-7rem)] max-w-7xl items-center gap-14 px-5 pb-20 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:pb-24">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.14em] text-accent">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Free live masterclass · Sunday · 11:00 AM IST
              </div>

              <p className="mt-7 text-sm font-semibold text-muted-foreground sm:text-base">
                For experienced Android developers who know they are capable of more.
              </p>

              <h1 className="mt-4 font-heading text-[clamp(2.7rem,6vw,5.7rem)] font-extrabold leading-[0.98] tracking-[-0.045em]">
                You don't need
                <span className="block text-muted-foreground">another Android course.</span>
                <span className="mt-1 block text-accent">You need a career system.</span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Learn how experienced Android developers can break out of career stagnation, build senior-level technical depth, prepare for architecture interviews and move toward stronger product-company opportunities.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-13 rounded-full px-7 text-base shadow-lg shadow-primary/20">
                  <Link to="/masterclass">Reserve My Free Seat <ArrowRight /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-13 rounded-full px-7 text-base">
                  <a href="#inside">See what's inside <ChevronDown /></a>
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-2"><Check className="size-4 text-accent" /> 90 minutes</span>
                <span className="flex items-center gap-2"><Check className="size-4 text-accent" /> Live on Zoom</span>
                <span className="flex items-center gap-2"><Check className="size-4 text-accent" /> 100% free</span>
              </div>
            </div>

            {/* Custom CSS visual: career architecture console */}
            <div className="relative mx-auto w-full max-w-xl">
              <div className="hero-orbit absolute -inset-8 rounded-full border border-accent/10" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[28px] border border-border bg-card/75 p-4 shadow-2xl backdrop-blur-xl sm:p-5">
                <div className="rounded-[22px] border border-border bg-background/90 p-5 sm:p-6">
                  <div className="flex items-center justify-between border-b border-border pb-5">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Android career OS</p>
                      <p className="mt-1 font-heading text-lg font-bold">Next-level readiness</p>
                    </div>
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Code2 className="size-5" />
                    </div>
                  </div>

                  <div className="mt-6 grid gap-3">
                    {[
                      ["Technical Depth", "Kotlin · Android · Architecture", "84%"],
                      ["System Design", "HLD · LLD · Trade-offs", "68%"],
                      ["Interview Readiness", "Stories · Communication · Practice", "56%"],
                    ].map(([label, detail, value], index) => (
                      <div key={label} className="rounded-2xl border border-border bg-card p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-heading text-sm font-bold">{label}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                          </div>
                          <span className="text-xs font-bold text-accent">{value}</span>
                        </div>
                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-accent" style={{ width: value }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4">
                      <Network className="size-5 text-accent" />
                      <p className="mt-5 text-xs text-muted-foreground">Current</p>
                      <p className="mt-1 font-heading font-bold">Stuck / unsure</p>
                    </div>
                    <div className="rounded-2xl border border-achievement/25 bg-achievement/5 p-4">
                      <Zap className="size-5 text-achievement" />
                      <p className="mt-5 text-xs text-muted-foreground">Target</p>
                      <p className="mt-1 font-heading font-bold">Ready / intentional</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-border bg-card px-4 py-3 shadow-xl sm:block">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">The shift</p>
                <p className="mt-1 font-heading text-sm font-bold">From experience → evidence</p>
              </div>
            </div>
          </div>
        </section>

        {/* PAIN / IDENTIFICATION */}
        <section id="why" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">This is probably you</p>
              <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
                Your problem may not be your experience.
                <span className="block text-muted-foreground">It may be what your experience is not yet proving.</span>
              </h2>
            </div>

            <div className="mt-12 grid gap-4 lg:grid-cols-3">
              {audience.map(({ icon: Icon, title, text }, index) => (
                <article key={title} className="group rounded-[24px] border border-border bg-card/50 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-accent">
                      <Icon className="size-5" />
                    </span>
                    <span className="font-heading text-xs font-bold text-muted-foreground">0{index + 1}</span>
                  </div>
                  <h3 className="mt-9 font-heading text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-[24px] border border-accent/20 bg-accent/5 p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-heading text-lg font-bold">If you recognised yourself in even one of these, start here.</p>
                  <p className="mt-1 text-sm text-muted-foreground">The masterclass is built around the next career move—not another pile of tutorials.</p>
                </div>
                <Button asChild className="shrink-0 rounded-full">
                  <Link to="/masterclass">Save My Free Seat <ArrowRight /></Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* OUTCOMES */}
        <section id="inside" className="scroll-mt-24 border-b border-border bg-card/30 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-12 lg:grid-cols-[.75fr_1.25fr] lg:gap-20">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Inside the masterclass</p>
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
                  90 minutes to see your career differently.
                </h2>
                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                  This is a strategic session for developers who have already put in the years and now want a clearer way to turn that experience into the next level of opportunity.
                </p>
                <Button asChild size="lg" className="mt-8 rounded-full">
                  <Link to="/masterclass">Reserve My Free Seat <ArrowRight /></Link>
                </Button>
              </div>

              <div className="divide-y divide-border border-y border-border">
                {takeaways.map(([number, title, text]) => (
                  <div key={number} className="grid gap-5 py-7 sm:grid-cols-[48px_1fr] sm:py-9">
                    <span className="font-heading text-sm font-bold text-accent">{number}</span>
                    <div>
                      <h3 className="font-heading text-xl font-bold">{title}</h3>
                      <p className="mt-2 max-w-2xl leading-7 text-muted-foreground">{text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* VISUAL FRAMEWORK */}
        <section id="framework" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">The TLH career framework</p>
                <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
                  Stop preparing randomly. Start progressing deliberately.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                The same connected philosophy powers the Tech Leader Hub platform.
              </p>
            </div>

            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {framework.map(([number, title, text], index) => (
                <article
                  key={number}
                  className="group relative min-h-48 overflow-hidden rounded-[22px] border border-border bg-card/40 p-6 transition-all duration-500 hover:-translate-y-1 hover:border-primary/50 hover:bg-card"
                >
                  <span className="absolute -right-2 -top-5 font-heading text-8xl font-extrabold tracking-[-0.06em] text-border/50 transition-colors group-hover:text-primary/10">
                    {number}
                  </span>
                  <div className="relative flex h-full flex-col justify-end">
                    <div className={`mb-5 h-1 w-8 transition-all duration-500 group-hover:w-14 ${index > 6 ? "bg-achievement" : "bg-primary"}`} />
                    <h3 className="font-heading text-xl font-bold">{title}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* MENTOR */}
        <section className="border-b border-border bg-card/30 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-20 lg:px-10">
            <div className="relative mx-auto w-full max-w-md">
              <div className="absolute -inset-5 rounded-[32px] border border-accent/10" />
              <div className="relative rounded-[28px] border border-border bg-background p-7 shadow-xl sm:p-9">
                <div className="flex items-center gap-4">
                  <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Users className="size-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Your mentor</p>
                    <p className="mt-1 font-heading text-lg font-bold">Nikhil Rai</p>
                  </div>
                </div>
                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-border p-4">
                    <p className="font-heading text-2xl font-extrabold">12+</p>
                    <p className="mt-1 text-xs text-muted-foreground">years in Android / tech</p>
                  </div>
                  <div className="rounded-2xl border border-border p-4">
                    <p className="font-heading text-2xl font-extrabold">3</p>
                    <p className="mt-1 text-xs text-muted-foreground">major product / tech environments</p>
                  </div>
                </div>
                <div className="mt-3 rounded-2xl border border-border bg-card p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">Experience across</p>
                  <p className="mt-2 text-sm font-semibold">Ola · PayU · GamesKraft · Synchronoss · startups</p>
                </div>
              </div>
            </div>

            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Learn from the other side of the interview table</p>
              <h2 className="mt-4 font-heading text-3xl font-bold tracking-tight sm:text-5xl">
                Your years of Android experience deserve a stronger career narrative.
              </h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Nikhil Rai has worked across Android engineering and product environments including Ola, PayU, GamesKraft and Synchronoss. The focus of this masterclass is practical: connect technical depth, architecture thinking, interview preparation and career direction.
              </p>
              <div className="mt-7 space-y-3">
                {[
                  "No beginner-level syntax marathon.",
                  "No random collection of interview questions.",
                  "No promise of an overnight career transformation.",
                  "A structured way to understand what to work on next.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Button asChild size="lg" className="mt-9 rounded-full">
                <Link to="/masterclass">Join the Free Masterclass <ArrowRight /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* BONUSES / VALUE */}
        <section className="border-b border-border py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="rounded-[30px] border border-accent/20 bg-gradient-to-br from-accent/10 via-background to-achievement/5 p-7 sm:p-10 lg:p-14">
              <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center lg:gap-20">
                <div>
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                    <Layers3 className="size-6" />
                  </div>
                  <p className="mt-7 text-sm font-bold uppercase tracking-[0.16em] text-accent">Your free session pack</p>
                  <h2 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">Come for the class. Leave with a clearer next move.</h2>
                  <p className="mt-4 leading-7 text-muted-foreground">The goal is not to give you more content to collect. It is to give you a framework you can use to decide what deserves your attention next.</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    "Android career roadmap",
                    "Career-readiness thinking framework",
                    "Interview preparation direction",
                    "Technical depth checklist",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-border bg-background/70 p-5">
                      <Check className="size-5 shrink-0 text-accent" />
                      <span className="text-sm font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 border-b border-border py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-5 sm:px-8">
            <div className="text-center">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">Questions</p>
              <h2 className="mt-4 font-heading text-3xl font-bold sm:text-5xl">You probably have a few.</h2>
            </div>

            <div className="mt-12 divide-y divide-border border-y border-border">
              {faqs.map(([question, answer], index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={question}>
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="flex w-full items-center justify-between gap-6 py-6 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="font-heading text-base font-bold sm:text-lg">{question}</span>
                      <ChevronDown className={`size-5 shrink-0 transition-transform ${isOpen ? "rotate-180 text-accent" : "text-muted-foreground"}`} />
                    </button>
                    {isOpen ? <p className="max-w-3xl pb-6 pr-10 text-sm leading-7 text-muted-foreground">{answer}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="relative overflow-hidden py-24 sm:py-32">
          <div className="hero-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
            <ShieldCheck className="mx-auto size-9 text-accent" aria-hidden="true" />
            <p className="mt-6 text-sm font-bold uppercase tracking-[0.16em] text-accent">Your next move starts here</p>
            <h2 className="mt-4 font-heading text-4xl font-extrabold tracking-tight sm:text-6xl">
              Stop asking,
              <span className="block text-muted-foreground">“When should I start?”</span>
              <span className="block text-accent">Start with a clear plan.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Join the next free 90-minute live masterclass and understand what to work on next in your Android career.
            </p>
            <Button asChild size="lg" className="mt-9 h-14 rounded-full px-8 text-base shadow-xl shadow-primary/20">
              <Link to="/masterclass">Reserve My Free Seat <ArrowRight /></Link>
            </Button>
            <p className="mt-4 text-xs text-muted-foreground">Sunday · 11:00 AM IST · Live on Zoom · No credit card required</p>
          </div>
        </section>
      </main>

      {/* Mobile conversion bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 p-3 backdrop-blur-xl lg:hidden">
        <Button asChild className="h-12 w-full rounded-full shadow-lg">
          <Link to="/masterclass">Reserve My Free Seat <ArrowRight /></Link>
        </Button>
      </div>

      <footer className="border-t border-border bg-card/40 pb-20 lg:pb-0">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" aria-label="Tech Leader Hub home">
              <TLHLogo className="h-9 w-auto max-w-[175px] object-contain" />
            </Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground" aria-label="Footer navigation">
              <Link to="/about" className="hover:text-foreground">About</Link>
              <Link to="/framework" className="hover:text-foreground">Framework</Link>
              <Link to="/programs" className="hover:text-foreground">Programs</Link>
              <Link to="/masterclass" className="hover:text-foreground">Masterclass</Link>
              <Link to="/contact" className="hover:text-foreground">Contact</Link>
              <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
              <Link to="/terms" className="hover:text-foreground">Terms</Link>
            </nav>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Tech Leader Hub.</p>
            <p>Career acceleration for technology professionals.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
