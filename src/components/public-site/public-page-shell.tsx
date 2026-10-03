import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TLHLogo } from "@/components/brand/tlh-logo";

export function PublicPageShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Tech Leader Hub",
            url: "https://techleaderhub.com",
            email: "techleaderhub@gmail.com",
          }),
        }}
      />
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <TLHLogo className="hidden h-10 w-auto max-w-[180px] object-contain sm:block" />
            <TLHLogo variant="icon" className="size-10 object-contain sm:hidden" />
            <span className="font-heading text-base font-bold sm:text-lg">Tech Leader Hub</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground">About</Link>
            <Link to="/framework" className="text-sm text-muted-foreground hover:text-foreground">Framework</Link>
            <Link to="/programs" className="text-sm text-muted-foreground hover:text-foreground">Programs</Link>
            <Link to="/blog" className="text-sm text-muted-foreground hover:text-foreground">Blog</Link>
            <Link to="/masterclass" className="text-sm text-muted-foreground hover:text-foreground">Masterclass</Link>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost"><Link to="/login">Sign in</Link></Button>
            <Button asChild><Link to="/masterclass">Get Started <ArrowRight /></Link></Button>
          </div>
        </div>
      </header>
      <main>
        <section className="relative overflow-hidden border-b border-border py-20 sm:py-28">
          <div className="home-grid absolute inset-0 opacity-40" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
            <p className="text-sm font-bold uppercase tracking-wide text-accent">{eyebrow}</p>
            <h1 className="mt-4 max-w-4xl font-heading text-4xl font-extrabold leading-tight sm:text-6xl">{title}</h1>
            <p className="mt-6 max-w-3xl text-lg leading-8 text-muted-foreground sm:text-xl">{description}</p>
          </div>
        </section>
        {children}
      </main>
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-10">
          <Link to="/" className="flex items-center gap-3"><TLHLogo className="h-9 w-auto max-w-[170px] object-contain" /></Link>
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <Link to="/about">About</Link><Link to="/framework">Framework</Link><Link to="/programs">Programs</Link><Link to="/blog">Blog</Link><Link to="/masterclass">Masterclass</Link><Link to="/contact">Contact</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function ContentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-border py-16 sm:py-20">
      <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
        <h2 className="font-heading text-2xl font-bold sm:text-3xl">{title}</h2>
        <div className="mt-5 space-y-5 text-base leading-8 text-muted-foreground sm:text-lg">{children}</div>
      </div>
    </section>
  );
}
