import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  Facebook,
  Instagram,
  Linkedin,
  Menu,
  Minus,
  Play,
  X,
  Youtube,
} from "lucide-react";

import {
  LINKS,
  authorityPillars,
  droidSkoolPath,
  faqs,
  fitFor,
  fitNotFor,
  recognition,
  steps,
  stories,
} from "@/components/home/home-content";

const NAV = [
  { label: "Is it for you", href: "#recognition" },
  { label: "How it works", href: "#approach" },
  { label: "Nikhil", href: "#nikhil" },
  { label: "Stories", href: "#stories" },
  { label: "FAQ", href: "#faq" },
];

// Hero portrait uses the exact uploaded charcoal arms-crossed asset.
const REMOTE_PORTRAITS = {
  hero: "/images/nikhil/nikhil-rai-arms-crossed-charcoal-1200.webp",
  story: "/images/nikhil/nikhil-rai-standing-1200.webp",
} as const;

const SOCIALS = [
  { label: "Instagram", href: LINKS.instagram, Icon: Instagram },
  { label: "Facebook", href: LINKS.facebook, Icon: Facebook },
  { label: "YouTube", href: LINKS.youtube, Icon: Youtube },
  { label: "LinkedIn", href: LINKS.linkedin, Icon: Linkedin },
];

/* ---------- Small building blocks ---------- */

function PrimaryCta({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link to="/masterclass" onClick={onClick} className={`tlh-btn tlh-btn-primary ${className}`}>
      {children}
    </Link>
  );
}

function Portrait({
  base,
  alt,
  className = "",
  priority = false,
}: {
  base: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <img
      src={base}
      sizes="(min-width: 1024px) 40vw, 80vw"
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}

/** The brand ring: the blue-to-gold circle from the TLH phoenix mark. The page's one signature element. */
function BrandRing({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 600 600" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="tlh-ring-gradient" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#3B8BFF" />
          <stop offset="55%" stopColor="#9FC3FF" />
          <stop offset="100%" stopColor="#F2B544" />
        </linearGradient>
      </defs>
      <circle
        cx="300"
        cy="300"
        r="286"
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="1"
      />
      <circle
        cx="300"
        cy="300"
        r="262"
        fill="none"
        stroke="url(#tlh-ring-gradient)"
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        className="tlh-ring-draw"
        transform="rotate(-90 300 300)"
      />
    </svg>
  );
}

/* ---------- Page ---------- */

export function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMobileBar, setShowMobileBar] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  // Show the mobile "join" bar only once the hero's own button has scrolled away.
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => entry && setShowMobileBar(!entry.isIntersecting),
      {
        rootMargin: "-40% 0px 0px 0px",
      },
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="tlh-home min-h-screen overflow-x-clip">
      <a href="#main-content" className="tlh-skip">
        Skip to content
      </a>

      {/* ---------- Header ---------- */}
      <header className="tlh-header fixed inset-x-0 top-0 z-50">
        <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-5 sm:px-8">
          <Link
            to="/"
            onClick={closeMenu}
            className="flex items-center gap-2.5 rounded-md"
            aria-label="Tech Leader Hub home"
          >
            <img src="/tlh-icon.png" alt="" width={30} height={30} className="size-[30px]" />
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
              Tech Leader Hub
            </span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="tlh-nav-link">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/login" className="tlh-nav-link hidden px-2 sm:inline-block">
              Sign in
            </Link>
            <PrimaryCta className="tlh-btn-sm hidden sm:inline-flex">
              Join free masterclass
            </PrimaryCta>
            <button
              type="button"
              className="tlh-icon-btn lg:hidden"
              onClick={() => setMenuOpen((open) => !open)}
              aria-expanded={menuOpen}
              aria-controls="tlh-mobile-menu"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {menuOpen ? (
          <nav id="tlh-mobile-menu" className="tlh-mobile-menu lg:hidden" aria-label="Mobile">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <Link to="/login" onClick={closeMenu}>
              Sign in
            </Link>
            <PrimaryCta onClick={closeMenu} className="mt-5 w-full">
              Join the free masterclass
            </PrimaryCta>
          </nav>
        ) : null}
      </header>

      <main id="main-content">
        {/* ---------- Hero ---------- */}
        <section
          ref={heroRef}
          className="tlh-night relative overflow-hidden pt-14"
          aria-labelledby="hero-title"
        >
          <div className="tlh-hero-light absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-[1200px] items-center gap-6 px-5 sm:px-8 lg:min-h-[min(860px,calc(100svh-56px))] lg:grid-cols-[1.05fr_.95fr] lg:gap-4">
            <div className="self-center pt-16 pb-8 sm:pt-20 lg:py-24">
              <p className="text-[17px] font-medium text-[var(--gold)]">
                For experienced Android developers
              </p>
              <h1 id="hero-title" className="tlh-display mt-4 text-white">
                You've been planning your next move for months. Let's finally make it.
              </h1>
              <p className="mt-6 max-w-[34rem] text-[19px] leading-[1.55] text-[var(--on-night-muted)] sm:text-[21px]">
                Tech Leader Hub helps experienced Android developers break out of career stagnation,
                crack product-company interviews and grow into tech leaders.
              </p>
              <div className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-7">
                <PrimaryCta>Join the free masterclass</PrimaryCta>
                <a
                  href={LINKS.journeyVideo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tlh-text-link-light"
                >
                  <Play className="size-4 fill-current" aria-hidden="true" />
                  Watch Nikhil's story
                </a>
              </div>
              <p className="mt-10 max-w-[30rem] text-[15px] leading-6 text-[var(--on-night-faint)]">
                Led by Nikhil Rai, former Ola Maps architect with 13+ years building Android at Ola,
                PayU and Gameskraft.
              </p>
            </div>

            <div className="relative mx-auto flex w-full max-w-[600px] items-center justify-center self-center lg:-mr-8">
              <BrandRing className="absolute left-1/2 top-1/2 w-[116%] max-w-none -translate-x-1/2 -translate-y-1/2" />
              <div
                className="tlh-portrait-glow absolute left-1/2 top-1/2 size-[82%] -translate-x-1/2 -translate-y-1/2"
                aria-hidden="true"
              />
              <Portrait
                base={REMOTE_PORTRAITS.hero}
                alt="Nikhil Rai, founder of Tech Leader Hub"
                priority
                className="tlh-portrait-in relative z-10 mx-auto block w-[108%] max-w-none"
              />
              <div className="tlh-glass absolute bottom-10 left-0 z-20 sm:bottom-12 sm:-left-4">
                <p className="text-[15px] font-semibold text-white">Nikhil Rai</p>
                <p className="text-[13px] text-[var(--on-night-muted)]">Founder, Tech Leader Hub</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Recognition ---------- */}
        <section
          id="recognition"
          className="tlh-section bg-white"
          aria-labelledby="recognition-title"
        >
          <div className="tlh-container">
            <h2 id="recognition-title" className="tlh-h2 text-[var(--ink)]">
              Does this sound like you?
            </h2>
            <div className="mt-12 border-t border-[var(--line)] sm:mt-16">
              {recognition.map((item) => (
                <div
                  key={item.quote}
                  className="grid gap-3 border-b border-[var(--line)] py-8 sm:py-10 md:grid-cols-[1.15fr_.85fr] md:gap-12"
                >
                  <p className="text-[24px] font-semibold leading-[1.25] tracking-[-0.02em] text-[var(--ink)] sm:text-[30px]">
                    “{item.quote}”
                  </p>
                  <p className="text-[17px] leading-[1.6] text-[var(--slate)] md:pt-1.5">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-12 text-[21px] font-medium leading-[1.45] text-[var(--ink)] sm:text-[24px]">
              None of these is a talent problem. Each one is a system problem.
            </p>
          </div>
        </section>

        {/* ---------- Droid Skool / TLH path ---------- */}
        <section
          className="tlh-section bg-white"
          aria-labelledby="droid-skool-path-title"
        >
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
            <div className="mx-auto max-w-[760px] text-center">
              <p className="text-[14px] font-semibold text-[var(--blue)]">
                {droidSkoolPath.eyebrow}
              </p>
              <h2 id="droid-skool-path-title" className="tlh-h2 mt-3 text-[var(--ink)]">
                {droidSkoolPath.title}
              </h2>
              <p className="mt-5 text-[18px] leading-[1.65] text-[var(--slate)]">
                {droidSkoolPath.description}
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-2">
              <article className="relative overflow-hidden rounded-[30px] border border-[var(--blue)]/20 bg-[linear-gradient(145deg,rgba(11,99,229,0.08),rgba(242,181,68,0.10))] p-7 sm:p-9">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex rounded-full border border-[var(--blue)]/20 bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-[var(--blue)]">
                    For beginners, freshers & early-career Android developers
                  </span>
                  <span className="text-[12px] font-semibold text-[var(--blue)]">Start here</span>
                </div>
                <h3 className="mt-6 text-[28px] font-semibold tracking-[-0.025em] text-[var(--ink)]">
                  Droid Skool — Learn, Build & Get Job-Ready
                </h3>
                <p className="mt-1 text-[17px] font-medium text-[var(--slate)]">
                  {droidSkoolPath.droidSkool.subtitle}
                </p>
                <ul className="mt-6 space-y-4">
                  {droidSkoolPath.droidSkool.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[16px] leading-[1.55] text-[var(--ink)]">
                      <Check className="mt-1 size-[18px] shrink-0 text-[var(--blue)]" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <a
                  href={LINKS.droidSkool}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tlh-btn tlh-btn-primary mt-8 inline-flex"
                >
                  Join Droid Skool
                </a>
              </article>

              <article className="rounded-[30px] border border-[var(--line)] bg-[var(--mist)] p-7 sm:p-9">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex rounded-full border border-[var(--line)] bg-white/80 px-3 py-1.5 text-[12px] font-semibold text-[var(--slate)]">
                      For experienced Android engineers
                  </span>
                  <span className="text-[12px] font-semibold text-[var(--slate)]">Next level</span>
                </div>
                <h3 className="mt-6 text-[28px] font-semibold tracking-[-0.025em] text-[var(--ink)]">
                  Tech Leader Hub — Accelerate Your Career
                </h3>
                <p className="mt-1 text-[17px] font-medium text-[var(--slate)]">
                  {droidSkoolPath.techLeaderHub.subtitle}
                </p>
                <ul className="mt-6 space-y-4">
                  {droidSkoolPath.techLeaderHub.points.map((point) => (
                    <li key={point} className="flex gap-3 text-[16px] leading-[1.55] text-[var(--ink)]">
                      <Check className="mt-1 size-[18px] shrink-0 text-[var(--blue)]" aria-hidden="true" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Link to="/masterclass" className="tlh-btn tlh-btn-secondary mt-8 inline-flex">
                  Join the free masterclass
                </Link>
              </article>
            </div>
          </div>
        </section>

        {/* ---------- The truth ---------- */}
        <section className="tlh-section bg-[var(--mist)]" aria-labelledby="truth-title">
          <div className="mx-auto max-w-[900px] px-5 text-center sm:px-8">
            <h2 id="truth-title" className="tlh-statement text-[var(--ink)]">
              You don't need another course. You need a system.
            </h2>
            <p className="mx-auto mt-7 max-w-[40rem] text-[19px] leading-[1.6] text-[var(--slate)] sm:text-[21px]">
              Too many experienced developers walk into 2026 interviews with 2021 preparation. More
              tutorials won't change that. Knowing exactly what product companies test, and
              preparing for it on purpose, will.
            </p>
          </div>
        </section>

        {/* ---------- How it works ---------- */}
        <section id="approach" className="tlh-section bg-white" aria-labelledby="approach-title">
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
            <div className="max-w-[40rem]">
              <h2 id="approach-title" className="tlh-h2 text-[var(--ink)]">
                How Tech Leader Hub works
              </h2>
              <p className="mt-5 text-[19px] leading-[1.6] text-[var(--slate)]">
                Three stages, built around your next career move rather than a syllabus.
              </p>
            </div>

            <ol className="tlh-steps mt-14 grid gap-10 sm:mt-20 md:grid-cols-3 md:gap-8">
              {steps.map((step, index) => (
                <li key={step.title} className="relative md:pt-12">
                  <span className="tlh-step-dot" aria-hidden="true">
                    {index + 1}
                  </span>
                  <h3 className="mt-5 text-[24px] font-semibold tracking-[-0.015em] text-[var(--ink)] md:mt-0">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[22rem] text-[17px] leading-[1.6] text-[var(--slate)]">
                    {step.text}
                  </p>
                </li>
              ))}
            </ol>

            <div className="mt-16 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <PrimaryCta>Join the free masterclass</PrimaryCta>
              <p className="text-[15px] text-[var(--slate)]">
                See the full approach live, and ask Nikhil your questions.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- Nikhil ---------- */}
        <section
          id="nikhil"
          className="tlh-night tlh-section relative overflow-hidden"
          aria-labelledby="nikhil-title"
        >
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            {/* Authority intro spans the full canvas so the section reads as one deliberate story. */}
            <div className="mx-auto max-w-[850px] text-center">
              <p className="text-[14px] font-semibold text-[var(--gold)]">
                Real-world Android expertise
              </p>
              <h2 id="nikhil-title" className="tlh-h2 mt-3 text-white">
                Where production experience becomes career advantage.
              </h2>
              <p className="mx-auto mt-5 max-w-[800px] text-[18px] leading-[1.65] text-[var(--on-night-muted)] sm:text-[19px]">
                Nikhil Rai is the Founder of Droid Skool and Tech Leader Hub. His experience spans
                product companies, high-scale Android systems, architecture, technical leadership
                and developer mentorship — giving Tech Leader Hub a foundation built from real
                engineering work, not theory alone.
              </p>
              <p className="mx-auto mt-4 max-w-[720px] text-[16px] font-medium leading-[1.6] text-[var(--gold)] sm:text-[17px]">
                From a difficult start in Bangalore to architecting Ola Maps — the system is built on lived engineering experience.
              </p>
            </div>

            <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[.78fr_1.22fr] lg:gap-10">
              {/* Founder profile + proof */}
              <div className="flex h-full flex-col">
                <div className="relative mx-auto w-full max-w-[430px] lg:mx-0">
                  <div
                    className="tlh-portrait-glow absolute inset-x-[10%] top-[8%] aspect-square"
                    aria-hidden="true"
                  />
                  <Portrait
                    base={REMOTE_PORTRAITS.story}
                    alt="Nikhil Rai, Founder of Droid Skool and Tech Leader Hub"
                    className="relative mx-auto block w-full"
                  />
                  <div className="tlh-glass absolute bottom-5 left-4 right-4 sm:bottom-7 sm:left-6 sm:right-auto">
                    <p className="text-[15px] font-semibold text-white">Nikhil Rai</p>
                    <p className="text-[13px] text-[var(--on-night-muted)]">
                      Founder, Droid Skool & Tech Leader Hub
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {[
                    { value: "13+", label: "Years in Android" },
                    { value: "4", label: "Companies across career" },
                    { value: "Ola", label: "Maps & architecture" },
                    { value: "GamesKraft", label: "Technical leadership" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-[18px] border border-white/10 bg-white/[0.035] px-4 py-4"
                    >
                      <p className="text-[20px] font-semibold tracking-[-0.02em] text-white">
                        {stat.value}
                      </p>
                      <p className="mt-1 text-[12px] leading-5 text-[var(--on-night-faint)]">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Authority pillars */}
              <div className="flex flex-col">
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  {authorityPillars.map((item, index) => (
                    <article
                      key={item.title}
                      className="group rounded-[22px] border border-white/10 bg-white/[0.035] p-5 sm:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.055]"
                    >
                      <div className="flex items-start gap-3.5">
                        <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/35 bg-[var(--gold)]/10 text-[13px] font-semibold text-[var(--gold)]">
                          0{index + 1}
                        </span>
                        <div>
                          <h3 className="text-[18px] font-semibold text-white">{item.title}</h3>
                          <p className="mt-2 text-[15px] leading-[1.6] text-[var(--on-night-muted)]">
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className="mt-4 rounded-[22px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
                  <p className="text-[12px] font-semibold text-[var(--gold)]">
                    Engineering career across
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Ola", "Gameskraft", "PayU", "Synchronoss"].map((company) => (
                      <span
                        key={company}
                        className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[12px] font-medium text-[var(--on-night-muted)]"
                      >
                        {company}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {[
                      "Android Architecture",
                      "Production Engineering",
                      "Technical Leadership",
                      "Interview Strategy",
                      "Career Positioning",
                    ].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-[12px] font-medium text-[var(--on-night-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-4 max-w-[42rem] text-[15px] leading-[1.6] text-[var(--on-night-faint)]">
                    The goal is not more content. It is to make your experience legible to the market,
                    your engineering depth visible in interviews, and your next career move intentional.
                  </p>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
                  <a
                    href={LINKS.journeyVideo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tlh-text-link-light"
                  >
                    <Play className="size-4 fill-current" aria-hidden="true" />
                    Watch Nikhil's journey
                  </a>
                  <a
                    href={LINKS.nikhilLinkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tlh-text-link-light"
                  >
                    <Linkedin className="size-4" aria-hidden="true" />
                    Connect on LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Stories ---------- */}
        <section id="stories" className="tlh-section bg-white" aria-labelledby="stories-title">
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
            <h2 id="stories-title" className="tlh-h2 max-w-[36rem] text-[var(--ink)]">
              Developers who've worked with Nikhil
            </h2>
            <p className="mt-4 text-[17px] text-[var(--slate)]">
              Shared by Droid Skool mentees, in their own words.
            </p>

            <div className="mt-14 grid gap-12 lg:grid-cols-[1.25fr_1fr] lg:gap-16">
              <figure className="lg:pr-4">
                <blockquote className="text-[24px] font-medium leading-[1.4] tracking-[-0.015em] text-[var(--ink)] sm:text-[28px]">
                  “{stories[0].quote}”
                </blockquote>
                <StoryAuthor story={stories[0]} large />
              </figure>

              <div className="grid gap-10 border-t border-[var(--line)] pt-10 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                {stories.slice(1).map((story) => (
                  <figure key={story.name}>
                    <blockquote className="text-[17px] leading-[1.65] text-[var(--ink)]">
                      “{story.quote}”
                    </blockquote>
                    <StoryAuthor story={story} />
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Fit ---------- */}
        <section id="fit" className="tlh-section bg-[var(--mist)]" aria-labelledby="fit-title">
          <div className="mx-auto max-w-[1100px] px-5 sm:px-8">
            <div className="max-w-[720px]">
              <h2 id="fit-title" className="tlh-h2 text-[var(--ink)]">
                Is Tech Leader Hub right for you?
              </h2>
              <p className="mt-4 text-[18px] leading-[1.6] text-[var(--slate)]">
                The right platform depends on where you are in your Android career.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              <div className="rounded-[28px] bg-white p-8 sm:p-10">
                <h3 className="text-[21px] font-semibold text-[var(--ink)]">It's for you if</h3>
                <ul className="mt-6 space-y-5">
                  {fitFor.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3.5 text-[17px] leading-[1.55] text-[var(--ink)]"
                    >
                      <Check
                        className="mt-1 size-[18px] shrink-0 text-[var(--blue)]"
                        aria-hidden="true"
                      />
                      {line}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-[28px] border border-[var(--line)] bg-white/60 p-8 sm:p-10">
                <h3 className="text-[21px] font-semibold text-[var(--ink)]">It's not for you if</h3>
                <ul className="mt-6">
                  {fitNotFor.map((line) => (
                    <li
                      key={line}
                      className="flex gap-3.5 text-[17px] leading-[1.55] text-[var(--slate)]"
                    >
                      <Minus
                        className="mt-1 size-[18px] shrink-0 text-[var(--slate)]"
                        aria-hidden="true"
                      />
                      {line}
                    </li>
                  ))}
                </ul>

                <p className="mt-7 text-[15px] leading-[1.6] text-[var(--slate)]">
                  Start with Droid Skool, build your Android foundation and become job-ready before
                  stepping into a senior-career acceleration platform.
                </p>

                <a
                  href={LINKS.droidSkool}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tlh-text-link mt-5"
                >
                  Join Droid Skool
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="faq" className="tlh-section bg-white" aria-labelledby="faq-title">
          <div className="mx-auto max-w-[820px] px-5 sm:px-8">
            <h2 id="faq-title" className="tlh-h2 text-[var(--ink)]">
              Questions developers ask
            </h2>
            <div className="mt-12 border-t border-[var(--line)]">
              {faqs.map((faq, index) => (
                <details
                  key={faq.id}
                  id={faq.id}
                  className="tlh-faq group border-b border-[var(--line)]"
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6">
                    <h3 className="text-[19px] font-semibold leading-[1.35] tracking-[-0.01em] text-[var(--ink)]">
                      {faq.question}
                    </h3>
                    <ChevronDown
                      className="size-5 shrink-0 text-[var(--slate)] transition-transform duration-300 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <div className="pb-7 pr-2 sm:pr-12">
                    <p className="text-[17px] leading-[1.65] text-[var(--slate)]">{faq.answer}</p>
                    {faq.link ? (
                      faq.link.href.startsWith("#") ? (
                        <a href={faq.link.href} className="tlh-text-link mt-3">
                          {faq.link.label}
                        </a>
                      ) : (
                        <Link to="/masterclass" className="tlh-text-link mt-3">
                          {faq.link.label}
                        </Link>
                      )
                    ) : null}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Final call ---------- */}
        <section
          className="tlh-night relative overflow-hidden py-28 sm:py-36"
          aria-labelledby="final-title"
        >
          <div className="tlh-final-light absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto max-w-[760px] px-5 text-center sm:px-8">
            <img src="/tlh-icon.png" alt="" width={56} height={56} className="mx-auto size-14" />
            <h2 id="final-title" className="tlh-statement mt-8 text-white">
              Stop waiting for the right time. Start with a clear plan.
            </h2>
            <p className="mx-auto mt-6 max-w-[34rem] text-[19px] leading-[1.6] text-[var(--on-night-muted)]">
              Join the free 90-minute live masterclass and leave knowing exactly what to work on
              next.
            </p>
            <PrimaryCta className="mt-10">Reserve my free seat</PrimaryCta>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="tlh-night border-t border-white/10 pb-24 lg:pb-0">
        <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" className="flex items-center gap-2.5" aria-label="Tech Leader Hub home">
              <img src="/tlh-icon.png" alt="" width={32} height={32} className="size-8" />
              <span className="text-[16px] font-semibold text-white">Tech Leader Hub</span>
            </Link>
            <p className="mt-4 max-w-[18rem] text-[14px] leading-6 text-[var(--on-night-faint)]">
              Learn. Grow. Lead. Career acceleration for experienced Android developers.
            </p>
          </div>

          <FooterColumn title="Explore">
            <Link to="/masterclass">Free masterclass</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login">Sign in</Link>
          </FooterColumn>

          <FooterColumn title="Legal">
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
          </FooterColumn>

          <div>
            <p className="text-[13px] font-semibold text-white">Follow</p>
            <div className="mt-4 flex gap-2">
              {SOCIALS.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Tech Leader Hub on ${label}`}
                  className="tlh-social"
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1200px] border-t border-white/10 px-5 py-6 text-[12px] leading-5 text-[var(--on-night-faint)] sm:px-8">
          <p>© {new Date().getFullYear()} Tech Leader Hub. All rights reserved.</p>
          <p className="mt-1">
            Android is a trademark of Google LLC. Company names are mentioned only to describe
            Nikhil Rai's work history and do not imply endorsement.
          </p>
        </div>
      </footer>

      {/* ---------- Mobile join bar (appears after the hero) ---------- */}
      <div
        className={`tlh-mobile-bar lg:hidden ${showMobileBar ? "is-visible" : ""}`}
        aria-hidden={!showMobileBar}
        inert={!showMobileBar}
      >
        <PrimaryCta className="w-full" onClick={closeMenu}>
          Join the free masterclass
        </PrimaryCta>
      </div>
    </div>
  );
}

function StoryAuthor({
  story,
  large = false,
}: {
  story: (typeof stories)[number];
  large?: boolean;
}) {
  return (
    <figcaption className={`flex items-center gap-3.5 ${large ? "mt-8" : "mt-5"}`}>
      <img
        src={story.photo}
        alt=""
        width={large ? 52 : 44}
        height={large ? 52 : 44}
        loading="lazy"
        className={`${large ? "size-[52px]" : "size-11"} rounded-full bg-[var(--mist)] object-cover`}
      />
      <span>
        <span className="block text-[15px] font-semibold text-[var(--ink)]">{story.name}</span>
        <span className="block text-[14px] text-[var(--slate)]">{story.role}</span>
      </span>
    </figcaption>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[13px] font-semibold text-white">{title}</p>
      <div className="tlh-footer-links mt-4 flex flex-col gap-3">{children}</div>
    </div>
  );
}
