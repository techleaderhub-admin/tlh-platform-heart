import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  ClipboardCheck,
  Compass,
  FileQuestion,
  Fingerprint,
  Menu,
  Network,
  Route as RouteIcon,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { TLHLogo } from "@/components/brand/tlh-logo";

const stages = [
  { name: "Diagnose", detail: "Establish where you are and what is holding you back." },
  { name: "Position", detail: "Clarify your direction, value, and professional narrative." },
  { name: "Upgrade", detail: "Build the capabilities your target trajectory demands." },
  { name: "Prove", detail: "Turn knowledge into credible evidence of impact." },
  { name: "Prepare", detail: "Create a focused strategy for the opportunities ahead." },
  { name: "Activate", detail: "Move from planning into consistent, visible action." },
  { name: "Convert", detail: "Navigate selection processes with clarity and confidence." },
  { name: "Negotiate", detail: "Approach the offer conversation with preparation." },
  { name: "Advance", detail: "Keep growing toward greater scope and leadership." },
];

const capabilities = [
  { icon: UserRound, title: "Career Profile", description: "Bring your experience, strengths, goals, and direction into one structured view." },
  { icon: BarChart3, title: "Career Readiness", description: "Understand where you stand and identify the areas that need focused attention." },
  { icon: RouteIcon, title: "Career Roadmap", description: "Translate career goals into a sequenced plan with practical milestones." },
  { icon: BriefcaseBusiness, title: "Job & Interview Tracking", description: "Keep applications, interview activity, and next actions organized." },
  { icon: FileQuestion, title: "Interview Questions & Answers", description: "Prepare, record, and improve responses across interview topics." },
];

const audiences = [
  { title: "Ambitious technologists", text: "For professionals who want a more intentional career, not a collection of disconnected tactics.", icon: TrendingUp },
  { title: "Career transitioners", text: "For people ready to reposition their experience and move toward stronger technology opportunities.", icon: Compass },
  { title: "Emerging leaders", text: "For builders preparing to expand their influence, ownership, and leadership capability.", icon: Network },
];

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <a href="#main-content" className="sr-only z-50 bg-accent px-4 py-3 text-accent-foreground focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>

      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Tech Leader Hub home">
            <TLHLogo className="hidden h-10 w-auto max-w-[180px] object-contain sm:block" />
            <TLHLogo variant="icon" className="size-10 object-contain sm:hidden" />
            <span className="font-heading text-base font-bold sm:text-lg">Tech Leader Hub</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main navigation">
            <Link to="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">About</Link>
            <Link to="/framework" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Framework</Link>
            <Link to="/programs" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Programs</Link>
            <Link to="/masterclass" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Masterclass</Link>
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
            <Button asChild><Link to="/masterclass">Get Started <ArrowRight /></Link></Button>
          </div>

          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-controls="mobile-menu" aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}>
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {menuOpen ? (
          <div id="mobile-menu" className="border-t border-border bg-background px-5 py-5 lg:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col" aria-label="Mobile navigation">
              {[["About", "/about"], ["Framework", "/framework"], ["Programs", "/programs"], ["Masterclass", "/masterclass"]].map(([label, href]) => (
                <Link key={href} to={href} onClick={closeMenu} className="border-b border-border/60 py-4 text-sm font-medium text-foreground">{label}</Link>
              ))}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Button asChild variant="outline"><Link to="/login" onClick={closeMenu}>Sign in</Link></Button>
                <Button asChild><Link to="/masterclass" onClick={closeMenu}>Get Started</Link></Button>
              </div>
            </nav>
          </div>
        ) : null}
      </header>

      <main id="main-content">
        <section className="relative flex min-h-[calc(100svh-2rem)] items-center border-b border-border pt-28">
          <div className="home-grid absolute inset-0 opacity-50" aria-hidden="true" />
          <div className="home-glow absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 pb-20 pt-12 sm:px-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:px-10 lg:pb-24 lg:pt-16">
            <div className="home-reveal">
              <div className="mb-7 inline-flex items-center gap-2 border border-accent/30 bg-accent/5 px-3 py-2 text-xs font-semibold uppercase text-accent">
                <Sparkles className="size-3.5" aria-hidden="true" />
                Career acceleration for technology professionals
              </div>
              <h1 className="max-w-4xl font-heading text-5xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl xl:text-8xl">
                Build your path to <span className="text-accent">technology leadership.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Tech Leader Hub brings career strategy, focused development, and practical execution into one clear progression—from where you are now to the leader you are ready to become.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="h-12 px-6"><Link to="/masterclass">Get Started <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline" className="h-12 px-6"><a href="#framework">Explore the framework <ChevronRight /></a></Button>
              </div>
              <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground">
                {['Structured progression', 'Practical direction', 'Leadership destination'].map((item) => (
                  <span key={item} className="flex items-center gap-2"><Check className="size-4 text-accent" aria-hidden="true" />{item}</span>
                ))}
              </div>
            </div>

            <div className="home-reveal home-delay relative mx-auto w-full max-w-lg lg:max-w-none" aria-label="The Tech Leader Hub career progression">
              <div className="relative border border-border bg-card/75 p-5 shadow-2xl backdrop-blur-sm sm:p-7">
                <div className="mb-8 flex items-center justify-between border-b border-border pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase text-accent">TLH progression</p>
                    <p className="mt-1 font-heading text-lg font-bold">Career → Leadership</p>
                  </div>
                  <Fingerprint className="size-8 text-primary" aria-hidden="true" />
                </div>
                <div className="space-y-3">
                  {[
                    ["01", "Clarity", "Know your present position"],
                    ["02", "Capability", "Build what comes next"],
                    ["03", "Credibility", "Prove your readiness"],
                    ["04", "Leadership", "Expand your scope"],
                  ].map(([number, title, text], index) => (
                    <div key={number} className="group flex items-center gap-4 border border-border/80 bg-background/70 p-4 transition-colors hover:border-accent/50">
                      <span className={`flex size-10 shrink-0 items-center justify-center rounded-md font-heading text-sm font-bold ${index === 3 ? "bg-primary text-primary-foreground" : "bg-secondary text-accent"}`}>{number}</span>
                      <div className="min-w-0 flex-1"><p className="font-heading font-bold">{title}</p><p className="mt-0.5 text-sm text-muted-foreground">{text}</p></div>
                      <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-accent" aria-hidden="true" />
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3 border-l-2 border-achievement bg-achievement/5 px-4 py-3">
                  <Target className="size-5 text-achievement" aria-hidden="true" />
                  <p className="text-sm text-muted-foreground">A deliberate system for the career you want to lead.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 border-b border-border py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-10">
            <div>
              <SectionLabel>What is Tech Leader Hub?</SectionLabel>
              <h2 className="mt-4 max-w-xl font-heading text-3xl font-bold sm:text-5xl">Career growth works better when every move connects.</h2>
            </div>
            <div className="space-y-6 text-base leading-8 text-muted-foreground sm:text-lg">
              <p>Tech Leader Hub is a career acceleration platform built to help technology professionals move with greater clarity, intention, and readiness.</p>
              <p>Instead of treating skills, positioning, interviews, and advancement as separate problems, TLH connects them into one structured path toward meaningful technology leadership.</p>
              <div className="grid grid-cols-2 gap-4 pt-3">
                <div className="border-t-2 border-primary pt-4"><p className="font-heading font-bold text-foreground">Career acceleration</p><p className="mt-1 text-sm">The product</p></div>
                <div className="border-t-2 border-accent pt-4"><p className="font-heading font-bold text-foreground">Tech leadership</p><p className="mt-1 text-sm">The destination</p></div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card/35 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading label="Who it is for" title="Built for people who want to move forward with purpose." description="TLH is for technology professionals who are ready to take ownership of what comes next." />
            <div className="mt-12 grid gap-px overflow-hidden border border-border bg-border md:grid-cols-3">
              {audiences.map(({ title, text, icon: Icon }, index) => (
                <article key={title} className="bg-background p-7 sm:p-9">
                  <div className="mb-10 flex items-center justify-between"><Icon className="size-6 text-accent" aria-hidden="true" /><span className="font-heading text-sm text-muted-foreground">0{index + 1}</span></div>
                  <h3 className="font-heading text-xl font-bold">{title}</h3>
                  <p className="mt-3 leading-7 text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="framework" className="scroll-mt-20 border-b border-border py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <SectionHeading label="The TLH framework" title="Nine stages. One connected progression." description="A structured journey from understanding your position to advancing as a technology leader." />
            <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stages.map((stage, index) => (
                <li key={stage.name} className="group relative min-h-52 overflow-hidden border border-border bg-card/60 p-6 transition-colors hover:border-primary/70">
                  <span className="absolute right-4 top-1 font-heading text-7xl font-extrabold text-border/50 transition-colors group-hover:text-primary/15" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                  <div className="relative flex h-full flex-col justify-end">
                    <div className="mb-5 h-1 w-9 bg-primary transition-all group-hover:w-16 group-hover:bg-accent" />
                    <h3 className="font-heading text-xl font-bold">{stage.name}</h3>
                    <p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">{stage.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="platform" className="scroll-mt-20 border-b border-border bg-card/35 py-20 sm:py-28">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
              <SectionHeading label="Platform capabilities" title="One workspace for the work behind career progress." description="The secure TLH platform foundation is available. The career tools below are planned and will be introduced in future phases." />
              <div className="flex shrink-0 items-center gap-2 border border-border px-3 py-2 text-xs font-semibold uppercase text-muted-foreground"><span className="size-2 rounded-full bg-achievement" /> Career tools coming soon</div>
            </div>
            <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              {capabilities.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className={`border border-border bg-background p-6 ${index < 2 ? "lg:col-span-3" : "lg:col-span-2"}`}>
                  <div className="flex items-start justify-between gap-4"><span className="flex size-11 items-center justify-center rounded-md bg-secondary text-accent"><Icon className="size-5" aria-hidden="true" /></span><span className="border border-achievement/40 bg-achievement/5 px-2 py-1 text-xs font-semibold text-achievement">Coming soon</span></div>
                  <h3 className="mt-8 font-heading text-xl font-bold">{title}</h3>
                  <p className="mt-3 max-w-lg leading-7 text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="why-tlh" className="scroll-mt-20 border-b border-border py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-10">
            <div>
              <SectionLabel>Why TLH</SectionLabel>
              <h2 className="mt-4 font-heading text-3xl font-bold sm:text-5xl">More than the next role.</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">TLH is designed around the whole progression: becoming clearer, more capable, more credible, and ready for greater responsibility.</p>
            </div>
            <div className="divide-y divide-border border-y border-border">
              {[
                ["Direction before activity", "Start with the destination and make each action serve it."],
                ["Evidence over intention", "Turn learning and experience into visible proof of readiness."],
                ["Leadership as a trajectory", "Prepare not only to secure opportunities, but to grow into greater scope."],
              ].map(([title, text], index) => (
                <div key={title} className="grid gap-3 py-7 sm:grid-cols-[3rem_1fr] sm:gap-5">
                  <span className="font-heading text-sm font-bold text-accent">0{index + 1}</span>
                  <div><h3 className="font-heading text-xl font-bold">{title}</h3><p className="mt-2 leading-7 text-muted-foreground">{text}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20 sm:py-28">
          <div className="home-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-5 text-center sm:px-8">
            <ShieldCheck className="mx-auto size-9 text-accent" aria-hidden="true" />
            <h2 className="mt-6 font-heading text-4xl font-extrabold sm:text-6xl">Your next chapter should be built on purpose.</h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Start with Tech Leader Hub and take a more structured path toward your technology career and leadership goals.</p>
            <Button asChild size="lg" className="mt-9 h-12 px-7"><Link to="/masterclass">Get Started <ArrowRight /></Link></Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-10">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <Link to="/" className="flex items-center gap-3"><TLHLogo className="h-9 w-auto max-w-[170px] object-contain" /></Link>
            <nav className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground" aria-label="Footer navigation"><Link to="/about" className="hover:text-foreground">About</Link><Link to="/framework" className="hover:text-foreground">Framework</Link><Link to="/programs" className="hover:text-foreground">Programs</Link><Link to="/masterclass" className="hover:text-foreground">Masterclass</Link><Link to="/contact" className="hover:text-foreground">Contact</Link><Link to="/privacy" className="hover:text-foreground">Privacy</Link><Link to="/terms" className="hover:text-foreground">Terms</Link><Link to="/login" className="hover:text-foreground">Sign in</Link></nav>
          </div>
          <div className="mt-8 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><p>© {new Date().getFullYear()} Tech Leader Hub.</p><p>Career acceleration. Technology leadership.</p></div>
        </div>
      </footer>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-sm font-bold uppercase text-accent">{children}</p>;
}

function SectionHeading({ label, title, description }: { label: string; title: string; description: string }) {
  return <div className="max-w-3xl"><SectionLabel>{label}</SectionLabel><h2 className="mt-4 font-heading text-3xl font-bold sm:text-5xl">{title}</h2><p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">{description}</p></div>;
}