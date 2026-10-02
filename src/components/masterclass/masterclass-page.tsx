import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeCheck,
  BrainCircuit,
  CalendarDays,
  Clock3,
  Flame,
  Gift,
  Magnet,
  Play,
  Route,
  ShieldAlert,
  Timer,
  TrendingDown,
  UserRoundCog,
  Video,
} from "lucide-react";

import {
  AUDIENCE,
  BONUSES,
  CASE_STUDIES,
  CTA,
  DISCLAIMER,
  EVENT,
  FAQS,
  FINAL_CTA,
  HERO,
  PROBLEM,
  SECRETS,
  SOLUTION,
  SPEAKER,
  VSL,
  WHY_ATTEND,
  type CaseStudy,
} from "@/components/masterclass/masterclass-content";
import { RegistrationDialog } from "@/components/masterclass/registration-dialog";
import {
  formatSessionDate,
  useNextSession,
  type Countdown,
} from "@/components/masterclass/use-next-session";
import { BonusCover, HeroBlueprint, TrajectoryChart } from "@/components/masterclass/visuals";

const PAIN_ICONS = [Flame, ShieldAlert, TrendingDown, UserRoundCog];
const SECRET_ICONS = [UserRoundCog, Magnet, Route];

const PORTRAIT = {
  hero: "/images/nikhil/nikhil-rai-arms-crossed-charcoal",
  speaker: "/images/nikhil/nikhil-rai-blue-suit",
} as const;

/* ---------- Small building blocks ---------- */

function CtaButton({
  onClick,
  children = CTA.primary,
  size = "lg",
  className = "",
}: {
  onClick: () => void;
  children?: React.ReactNode;
  size?: "lg" | "sm";
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mc-btn mc-btn-primary ${size === "lg" ? "mc-btn-lg" : "mc-btn-sm"} ${className}`}
    >
      <span>{children}</span>
      <ArrowRight className="size-5 shrink-0" aria-hidden="true" />
    </button>
  );
}

function CountdownTiles({ left, compact = false }: { left: Countdown | null; compact?: boolean }) {
  const units: Array<[string, number | null]> = [
    ["Days", left?.days ?? null],
    ["Hours", left?.hours ?? null],
    ["Mins", left?.minutes ?? null],
    ["Secs", left?.seconds ?? null],
  ];
  return (
    <div
      className={compact ? "mc-countdown mc-countdown-compact" : "mc-countdown"}
      role="timer"
      aria-live="off"
    >
      {units.map(([label, value]) => (
        <div key={label} className="mc-countdown-unit">
          <span className="mc-countdown-value">
            {value === null ? "--" : String(value).padStart(2, "0")}
          </span>
          <span className="mc-countdown-label">{label}</span>
        </div>
      ))}
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  intro,
  center = false,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: string;
  center?: boolean;
  id: string;
}) {
  return (
    <div className={center ? "mc-heading mc-heading-center" : "mc-heading"}>
      <p className="mc-eyebrow">{eyebrow}</p>
      <h2 id={id} className="mc-h2">
        {title}
      </h2>
      {intro ? <p className="mc-intro">{intro}</p> : null}
    </div>
  );
}

/** Click-to-play YouTube block: nothing from YouTube loads until the visitor presses play. */
function VideoFacade({
  youtubeId,
  poster,
  label,
  className = "",
}: {
  youtubeId: string;
  poster: string;
  label: string;
  className?: string;
}) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className={`mc-video ${className}`}>
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={label}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          className="mc-video-poster"
          onClick={() => setPlaying(true)}
          aria-label={`Play video: ${label}`}
        >
          <img src={poster} alt="" width={640} height={885} loading="eager" decoding="async" />
          <span className="mc-video-play" aria-hidden="true">
            <Play className="size-7 translate-x-0.5 fill-current" />
          </span>
          <span className="mc-video-label">
            <Video className="size-4" aria-hidden="true" />
            {label}
          </span>
        </button>
      )}
    </div>
  );
}

function CaseStudyCard({ study }: { study: CaseStudy }) {
  const initials = study.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);
  return (
    <article className="mc-case" data-mc-reveal>
      <div className="mc-case-media">
        {study.videoId ? (
          <VideoFacade
            youtubeId={study.videoId}
            poster={study.photo ?? `${PORTRAIT.hero}-640.webp`}
            label={`${study.name}'s story`}
          />
        ) : (
          <div className="mc-case-avatar">
            {study.photo ? (
              <img
                src={study.photo}
                alt={`${study.name}, Droid Skool mentee`}
                width={72}
                height={72}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span aria-hidden="true">{initials}</span>
            )}
          </div>
        )}
        <div>
          <p className="mc-case-name">{study.name}</p>
          <p className="mc-case-headline">{study.headline}</p>
        </div>
      </div>
      <div className="mc-case-jump" aria-label={`From ${study.from} to ${study.to}`}>
        <span className="mc-case-from">{study.from}</span>
        <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
        <span className="mc-case-to">{study.to}</span>
      </div>
      <p className="mc-case-story">{study.story}</p>
    </article>
  );
}

/** Fades sections in on scroll. Content is only hidden once this has run (no-JS safe). */
function useReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll<HTMLElement>("[data-mc-reveal]");
    if (
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    elements.forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) element.classList.add("is-in");
    });
    document.documentElement.classList.add("mc-reveal-ready");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    elements.forEach((element) => {
      if (!element.classList.contains("is-in")) observer.observe(element);
    });
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("mc-reveal-ready");
    };
  }, []);
}

/* ---------- Page ---------- */

export function MasterclassPage() {
  const session = useNextSession();
  const [dialog, setDialog] = useState<{ open: boolean; source: string }>({
    open: false,
    source: "hero",
  });
  const [showBar, setShowBar] = useState(false);
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const register = useCallback((source: string) => {
    openerRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setDialog({ open: true, source });
  }, []);

  const closeDialog = useCallback(() => {
    setDialog((current) => ({ ...current, open: false }));
    window.requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  // The sticky mobile bar appears once the hero's own button has scrolled away.
  useEffect(() => {
    const target = heroCtaRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useReveal();

  const dateLabel = session ? formatSessionDate(session.start) : EVENT.dayLabel;

  return (
    <div className="tlh-mc">
      <a href="#mc-main" className="mc-skip">
        Skip to content
      </a>

      {/* ---------- Header ---------- */}
      <header className="mc-header">
        <div className="mc-header-inner">
          <Link to="/" className="mc-logo" aria-label="Tech Leader Hub home">
            <img src="/images/brand/tlh-icon-72.webp" alt="" width={32} height={32} />
            <span>Tech Leader Hub</span>
          </Link>
          <div className="mc-header-session" aria-label="Next live session">
            <span className="mc-live-dot" aria-hidden="true" />
            <span className="mc-header-session-text">
              {EVENT.dayLabel} · {EVENT.timeLabel}
            </span>
            <CountdownTiles left={session?.left ?? null} compact />
          </div>
          <CtaButton size="sm" onClick={() => register("header")}>
            {CTA.short}
          </CtaButton>
        </div>
      </header>

      <main id="mc-main">
        {/* ---------- 1. Hero ---------- */}
        <section className="mc-hero" aria-labelledby="mc-hero-title">
          <HeroBlueprint className="mc-hero-blueprint" />
          <div className="mc-hero-glow" aria-hidden="true" />
          <div className="mc-container mc-hero-inner">
            <p className="mc-prehead">{HERO.preHeadline}</p>
            <h1 id="mc-hero-title" className="mc-h1">
              {HERO.headlineLead} <span className="mc-gradient-text">{HERO.headlineHighlight}</span>
            </h1>
            <p className="mc-hero-desc">{HERO.description}</p>

            <div className="mc-hero-grid">
              <VideoFacade
                youtubeId={VSL.youtubeId}
                poster={`${PORTRAIT.hero}-640.webp`}
                label={VSL.label}
                className="mc-hero-video"
              />

              <div className="mc-event-card" ref={heroCtaRef}>
                <div className="mc-event-badge">
                  <span className="mc-live-dot" aria-hidden="true" />
                  Free live masterclass
                </div>
                <ul className="mc-event-facts">
                  <li>
                    <CalendarDays className="size-5" aria-hidden="true" />
                    <span>
                      <strong>{dateLabel}</strong>
                      <small>Webinar date</small>
                    </span>
                  </li>
                  <li>
                    <Clock3 className="size-5" aria-hidden="true" />
                    <span>
                      <strong>{EVENT.timeLabel}</strong>
                      <small>{EVENT.durationLabel}, live</small>
                    </span>
                  </li>
                  <li>
                    <Video className="size-5" aria-hidden="true" />
                    <span>
                      <strong>Online on Zoom</strong>
                      <small>Join from anywhere</small>
                    </span>
                  </li>
                </ul>

                <div className="mc-price">
                  <span className="mc-price-old">
                    <span className="sr-only">Regular price </span>
                    {EVENT.anchorPrice}
                  </span>
                  <span className="mc-price-new">Free Access</span>
                </div>

                <div className="mc-event-countdown">
                  <p>
                    <Timer className="size-4" aria-hidden="true" />
                    Registration closes when the session starts
                  </p>
                  <CountdownTiles left={session?.left ?? null} />
                </div>

                <CtaButton onClick={() => register("hero")} className="mc-btn-block" />
                <p className="mc-micro">{CTA.micro}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Authority strip ---------- */}
        <section className="mc-strip" aria-label="Speaker experience">
          <div className="mc-container mc-strip-inner">
            <p>Lead and Architect experience at</p>
            <ul>
              {SPEAKER.companies.map((company) => (
                <li key={company}>{company}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- 2. Problem ---------- */}
        <section className="mc-section mc-light" aria-labelledby="mc-problem-title">
          <div className="mc-container">
            <SectionHeading
              id="mc-problem-title"
              eyebrow={PROBLEM.eyebrow}
              title={PROBLEM.title}
              intro={PROBLEM.intro}
            />
            <div className="mc-pain-grid">
              {PROBLEM.pains.map((pain, index) => {
                const Icon = PAIN_ICONS[index] ?? Flame;
                return (
                  <article key={pain.title} className="mc-pain" data-mc-reveal>
                    <span className="mc-icon-tile">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <h3>{pain.title}</h3>
                    <p>{pain.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- 2b. Solution ---------- */}
        <section className="mc-section mc-dark" aria-labelledby="mc-solution-title">
          <div className="mc-container mc-solution">
            <div>
              <SectionHeading
                id="mc-solution-title"
                eyebrow={SOLUTION.eyebrow}
                title={SOLUTION.title}
                intro={SOLUTION.intro}
              />
              <ol className="mc-shifts">
                {SOLUTION.shifts.map((shift) => (
                  <li key={shift.from} data-mc-reveal>
                    <span className="mc-shift-from">{shift.from}</span>
                    <ArrowRight className="mc-shift-arrow size-4" aria-hidden="true" />
                    <span className="mc-shift-to">{shift.to}</span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="mc-chart-card" data-mc-reveal>
              <TrajectoryChart className="mc-chart" />
            </div>
          </div>
        </section>

        {/* ---------- 3. Three secrets ---------- */}
        <section
          className="mc-section mc-dark mc-secrets-section"
          aria-labelledby="mc-secrets-title"
        >
          <div className="mc-container">
            <SectionHeading
              id="mc-secrets-title"
              center
              eyebrow="Inside the masterclass"
              title="3 secrets we will cover"
              intro="Two live hours. Three shifts that separate ₹8 LPA ticket-closers from tier-1 Tech Leaders."
            />
            <div className="mc-secrets">
              {SECRETS.map((secret, index) => {
                const Icon = SECRET_ICONS[index] ?? BrainCircuit;
                return (
                  <article key={secret.title} className="mc-secret" data-mc-reveal>
                    <div className="mc-secret-top">
                      <span className="mc-icon-tile mc-icon-tile-dark">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className="mc-secret-number">{secret.number}</span>
                    </div>
                    <h3>{secret.title}</h3>
                    <p>{secret.text}</p>
                    <ul className="mc-tags">
                      {secret.tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
            <div className="mc-center-cta">
              <CtaButton onClick={() => register("secrets")} />
            </div>
          </div>
        </section>

        {/* ---------- 4. Who is this webinar for ---------- */}
        <section className="mc-section mc-light" aria-labelledby="mc-audience-title">
          <div className="mc-container">
            <SectionHeading
              id="mc-audience-title"
              eyebrow="Whom is this webinar for"
              title="Built for experienced Android developers with 2–13 years behind them."
            />
            <div className="mc-audience">
              {AUDIENCE.map((item) => (
                <article key={item.title} className="mc-audience-card" data-mc-reveal>
                  <span className="mc-years">{item.years}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <p className="mc-not-for">
              <strong>Not for freshers or absolute beginners.</strong> We won't teach basic Kotlin
              syntax. This is a high-level strategic masterclass.
            </p>
          </div>
        </section>

        {/* ---------- 5. About the speaker ---------- */}
        <section className="mc-section mc-dark" aria-labelledby="mc-speaker-title">
          <div className="mc-container mc-speaker">
            <div className="mc-speaker-photo" data-mc-reveal>
              <img
                src={`${PORTRAIT.speaker}-1200.webp`}
                srcSet={`${PORTRAIT.speaker}-640.webp 640w, ${PORTRAIT.speaker}-1200.webp 736w`}
                sizes="(min-width: 1024px) 460px, 92vw"
                alt={`${SPEAKER.name}, ${SPEAKER.title}`}
                width={736}
                height={1018}
                loading="lazy"
                decoding="async"
              />
              <div className="mc-speaker-tag">
                <p>{SPEAKER.name}</p>
                <span>{SPEAKER.title}</span>
              </div>
            </div>

            <div>
              <p className="mc-eyebrow">About the speaker</p>
              <h2 id="mc-speaker-title" className="mc-h2">
                {SPEAKER.name}
              </h2>
              <p className="mc-speaker-title">{SPEAKER.title}</p>

              <dl className="mc-stats">
                {SPEAKER.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt>{stat.label}</dt>
                    <dd>{stat.value}</dd>
                  </div>
                ))}
              </dl>

              <h3 className="mc-h3">{SPEAKER.experienceTitle}</h3>
              <p className="mc-body">{SPEAKER.experience}</p>
              <ul className="mc-chips" aria-label="Platforms architected">
                {SPEAKER.platforms.map((platform) => (
                  <li key={platform}>{platform}</li>
                ))}
              </ul>

              <h3 className="mc-h3">{SPEAKER.missionTitle}</h3>
              <p className="mc-body">{SPEAKER.mission}</p>
              <dl className="mc-marks" aria-label="Academic marks">
                {SPEAKER.marks.map((mark) => (
                  <div key={mark.label}>
                    <dt>{mark.label}</dt>
                    <dd>{mark.value}</dd>
                  </div>
                ))}
              </dl>

              <CtaButton onClick={() => register("speaker")} className="mt-9">
                Learn the system from Nikhil, free
              </CtaButton>
            </div>
          </div>
        </section>

        {/* ---------- 6. Case studies ---------- */}
        <section className="mc-section mc-light" aria-labelledby="mc-cases-title">
          <div className="mc-container">
            <SectionHeading
              id="mc-cases-title"
              eyebrow="Case studies & proof"
              title="Real developers. Real career jumps."
              intro="Droid Skool mentees who applied the same system you'll see in the masterclass."
            />
            <div className="mc-cases">
              {CASE_STUDIES.map((study) => (
                <CaseStudyCard key={study.name} study={study} />
              ))}
            </div>
          </div>
        </section>

        {/* ---------- 7. Why attend + bonuses ---------- */}
        <section className="mc-section mc-dark" aria-labelledby="mc-why-title">
          <div className="mc-container">
            <SectionHeading
              id="mc-why-title"
              center
              eyebrow="Why attend this webinar"
              title="Six reasons to block two hours this Sunday."
            />
            <div className="mc-why">
              {WHY_ATTEND.map((item) => (
                <article key={item.title} className="mc-why-item" data-mc-reveal>
                  <BadgeCheck className="size-6 shrink-0" aria-hidden="true" />
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mc-bonuses" aria-labelledby="mc-bonus-title">
              <div className="mc-bonus-head">
                <Gift className="size-6" aria-hidden="true" />
                <h3 id="mc-bonus-title">3 exclusive action gifts for staying till the end</h3>
              </div>
              <div className="mc-bonus-grid">
                {BONUSES.map((bonus) => (
                  <article key={bonus.title} className="mc-bonus" data-mc-reveal>
                    <BonusCover kind={bonus.kind} title={bonus.title} />
                    <p className="mc-bonus-label">{bonus.label}</p>
                    <h4>{bonus.title}</h4>
                    <p className="mc-bonus-format">{bonus.format}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="mc-center-cta">
              <CtaButton onClick={() => register("bonuses")} />
              <p className="mc-micro">{CTA.micro}</p>
            </div>
          </div>
        </section>

        {/* ---------- 8. FAQ ---------- */}
        <section className="mc-section mc-light" aria-labelledby="mc-faq-title">
          <div className="mc-container mc-faq-wrap">
            <SectionHeading
              id="mc-faq-title"
              center
              eyebrow="Frequently asked questions"
              title="Everything you need to know before you reserve."
            />
            <div className="mc-faq">
              {FAQS.map((faq, index) => (
                <details key={faq.question} open={index === 0}>
                  <summary>
                    <h3>{faq.question}</h3>
                    <span className="mc-faq-icon" aria-hidden="true" />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- 9. Final CTA ---------- */}
        <section className="mc-final" aria-labelledby="mc-final-title">
          <div className="mc-hero-glow" aria-hidden="true" />
          <div className="mc-container mc-final-inner">
            <p className="mc-eyebrow">{FINAL_CTA.eyebrow}</p>
            <h2 id="mc-final-title" className="mc-h2 mc-final-title">
              {FINAL_CTA.title}
            </h2>
            <p className="mc-intro">{FINAL_CTA.text}</p>
            <p className="mc-final-date">
              {dateLabel} · {EVENT.timeLabel} · Online on Zoom
            </p>
            <CountdownTiles left={session?.left ?? null} />
            <div className="mc-price mc-price-center">
              <span className="mc-price-old">
                <span className="sr-only">Regular price </span>
                {EVENT.anchorPrice}
              </span>
              <span className="mc-price-new">Free Access</span>
            </div>
            <CtaButton onClick={() => register("final")} />
            <p className="mc-micro">{CTA.micro}</p>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="mc-footer">
        <div className="mc-container">
          <nav className="mc-footer-links" aria-label="Footer">
            <Link to="/">Home</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/contact">Contact</Link>
          </nav>
          <p className="mc-disclaimer">{DISCLAIMER}</p>
          <p className="mc-copyright">
            © {new Date().getFullYear()} Nikhil Rai. Tech Leader Hub and Droid Skool are brands
            founded by Nikhil Rai.
          </p>
        </div>
      </footer>

      {/* ---------- Sticky mobile CTA ---------- */}
      <div
        className={`mc-mobile-bar ${showBar ? "is-visible" : ""}`}
        aria-hidden={!showBar}
        inert={!showBar}
      >
        <div>
          <span className="mc-mobile-price">
            <s>{EVENT.anchorPrice}</s> Free
          </span>
          <span className="mc-mobile-date">
            {EVENT.dayLabel.replace("Every ", "")} · {EVENT.timeLabel}
          </span>
        </div>
        <CtaButton size="sm" onClick={() => register("sticky")}>
          {CTA.short}
        </CtaButton>
      </div>

      <RegistrationDialog open={dialog.open} source={dialog.source} onClose={closeDialog} />
    </div>
  );
}
