import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Gift,
  Laptop2,
  Layers3,
  Map,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TLHLogo } from "@/components/brand/tlh-logo";

const SESSION_LABEL = "Sunday 11:00 AM IST";
const SESSION_TIME = "11:00 AM IST";

const audience = [
  {
    icon: Target,
    title: "2–8 years of Android experience",
    description: "You're past the beginner stage and want your experience to create stronger career opportunities.",
  },
  {
    icon: Layers3,
    title: "Service or mid-tier product company",
    description: "You want to understand what stronger product organizations expect from experienced engineers.",
  },
  {
    icon: Map,
    title: "Planning your next switch",
    description: "You've been thinking about changing jobs and need a clearer, structured path.",
  },
  {
    icon: BrainCircuit,
    title: "Ready for technical leadership",
    description: "You want to move toward Senior, Lead, Architect or broader technical ownership.",
  },
];

const learningPoints = [
  {
    number: "01",
    title: "The Product-Company Mindset",
    description:
      "Understand how expectations change when you move from feature execution toward product engineering and technical ownership.",
  },
  {
    number: "02",
    title: "The 3 Skills That Matter at Senior Level",
    description:
      "Identify the capabilities that increasingly separate experienced engineers from engineers ready for larger technical responsibilities.",
  },
  {
    number: "03",
    title: "How to Position Yourself as a Tech Leader",
    description:
      "Learn why years of experience alone do not automatically communicate leadership-level capability.",
  },
  {
    number: "04",
    title: "The TLH Career Roadmap",
    description:
      "See a practical path from Senior Android Engineer toward Tech Lead, Architect and technology leadership.",
  },
];

const framework = [
  ["01", "Diagnose", "Understand where your career is today."],
  ["02", "Position", "Define the role and career direction you're targeting."],
  ["03", "Upgrade", "Build the technical capabilities you're missing."],
  ["04", "Prove", "Create evidence of your technical depth."],
  ["05", "Prepare", "Become interview-ready."],
  ["06", "Activate", "Start targeting the right opportunities."],
  ["07", "Convert", "Turn interviews into opportunities."],
  ["08", "Negotiate", "Create stronger career outcomes."],
  ["09", "Advance", "Build your long-term leadership trajectory."],
];

const faqs = [
  {
    question: "Is this masterclass really free?",
    answer: "Yes. The live 90-minute masterclass is free to attend.",
  },
  {
    question: "Is this for beginners?",
    answer: "No. The primary audience is experienced Android professionals, particularly those with around 2–8 years of experience.",
  },
  {
    question: "I'm already a Senior Android Developer. Is this relevant?",
    answer: "Yes. The session focuses on career positioning, technical depth, interviews and progression toward larger technical responsibilities.",
  },
  {
    question: "Is this about learning basic Android?",
    answer: "No. This is not a beginner Android-development class. It is a career-focused session for professionals who already work with Android.",
  },
  {
    question: "Where is the masterclass conducted?",
    answer: "The masterclass is live online via Zoom.",
  },
  {
    question: "What happens after the masterclass?",
    answer: "You'll understand the TLH career framework and your potential next steps. If you want deeper guidance afterward, you'll be able to explore the Tech Leader Hub ecosystem.",
  },
];

type RegistrationForm = {
  experienceRange: string;
  currentRole: string;
  biggestChallenge: string;
  fullName: string;
  email: string;
  phone: string;
};

export function MasterclassPage() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [form, setForm] = useState<RegistrationForm>({
    experienceRange: "",
    currentRole: "",
    biggestChallenge: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const start = () => {
    setStep(0);
    setProcessing(false);
    setRegistered(false);
    setError("");
    setForm({
      experienceRange: "",
      currentRole: "",
      biggestChallenge: "",
      fullName: "",
      email: "",
      phone: "",
    });
    setOpen(true);
  };

  const submitRegistration = async () => {
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please enter your name, email, and WhatsApp number.");
      return;
    }

    if (!form.experienceRange || !form.currentRole || !form.biggestChallenge) {
      setError("Please complete your career details before registering.");
      return;
    }

    setProcessing(true);

    // The existing masterclass table has a roadblock field but no current_role column.
    // Preserve both qualification answers in that existing field until the schema is expanded.
    const roadblock = `Current role: ${form.currentRole} | Biggest challenge: ${form.biggestChallenge}`;

    const { error: insertError } = await supabase.from("masterclass_registrations").insert({
      full_name: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      experience_range: form.experienceRange,
      roadblock,
      session_label: SESSION_LABEL,
    });

    if (insertError) {
      setProcessing(false);
      setError("We couldn't complete your registration. Please check your details and try again.");
      return;
    }

    setProcessing(false);
    setRegistered(true);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#071426] text-[#F8FAFC]">
      <div className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#071426]/90 backdrop-blur-2xl">
        <div className="mx-auto flex h-11 max-w-7xl items-center justify-center px-5 sm:px-8">
          <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70 sm:text-xs">
            <span className="size-1.5 animate-pulse rounded-full bg-[#22D3EE]" />
            Free Live Masterclass · Sunday · {SESSION_TIME}
          </p>
        </div>
      </div>

      <header className="sticky top-11 z-40 border-b border-white/10 bg-[#071426]/80 backdrop-blur-2xl">
        <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link to="/" aria-label="Tech Leader Hub home" className="shrink-0">
            <TLHLogo className="h-9 w-auto max-w-[175px] object-contain sm:h-10" />
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            <a href="#why" className="text-sm text-white/55 transition hover:text-white">Why this</a>
            <a href="#learn" className="text-sm text-white/55 transition hover:text-white">What you'll learn</a>
            <a href="#framework" className="text-sm text-white/55 transition hover:text-white">Framework</a>
            <a href="#host" className="text-sm text-white/55 transition hover:text-white">About Nikhil</a>
            <a href="#faq" className="text-sm text-white/55 transition hover:text-white">FAQ</a>
          </nav>

          <Button onClick={start} className="h-10 rounded-full bg-[#1677FF] px-5 text-sm font-bold text-white shadow-[0_0_30px_rgba(22,119,255,.22)] hover:bg-[#2581ff]">
            Book My Free Seat <ArrowRight />
          </Button>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_22%,rgba(22,119,255,.22),transparent_33%),radial-gradient(circle_at_15%_12%,rgba(34,211,238,.08),transparent_27%)]" />
        <div className="hero-grid absolute inset-0 opacity-50" aria-hidden="true" />

        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.04fr_.96fr] lg:items-center lg:gap-20 lg:pb-28 lg:pt-24">
          <div className="home-reveal">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/[0.06] px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">
              <Sparkles className="size-3.5" />
              Free 90-Minute Live Masterclass
            </div>

            <p className="mt-7 text-sm font-semibold text-white/55 sm:text-base">
              For Android professionals ready to move from senior developer to tech leader.
            </p>

            <h1 className="mt-4 max-w-4xl font-heading text-4xl font-extrabold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-[4.55rem]">
              How Senior Android Engineers Can Unlock{" "}
              <span className="bg-gradient-to-r from-[#1677FF] via-[#22D3EE] to-[#F5B942] bg-clip-text text-transparent">
                High-Paying Product Roles
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-7 text-white/60 sm:text-xl sm:leading-8">
              A practical career system for Android professionals ready to build stronger technical depth, sharper positioning and the interview readiness needed for their next career move.
            </p>

            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[
                [CalendarDays, "Every Sunday"],
                [Clock3, SESSION_TIME],
                [Laptop2, "Live on Zoom"],
              ].map(([Icon, value]) => (
                <div key={String(value)} className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
                  <Icon className="size-5 text-[#22D3EE]" />
                  <p className="mt-3 text-sm font-semibold text-white/80">{String(value)}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button size="lg" onClick={start} className="h-14 rounded-full bg-[#1677FF] px-7 text-base font-extrabold text-white shadow-[0_12px_50px_rgba(22,119,255,.28)] hover:bg-[#2581ff]">
                Book My Free Seat <ArrowRight />
              </Button>
              <p className="text-sm text-white/45">No credit card · 100% free · 90 minutes</p>
            </div>
          </div>

          <div className="relative home-reveal home-delay">
            <div className="absolute -inset-10 rounded-full bg-[#1677FF]/10 blur-3xl" />
            <div className="relative rounded-[28px] border border-white/12 bg-white/[0.045] p-3 shadow-2xl backdrop-blur-xl sm:p-5">
              <div className="rounded-[22px] border border-white/10 bg-[#0B1C32]/90 p-5 sm:p-7">
                <div className="flex items-center justify-between border-b border-white/10 pb-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#22D3EE]">Tech Leader Hub</p>
                    <p className="mt-1 font-heading text-lg font-bold">Career OS</p>
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#22D3EE]">
                    Live System
                  </div>
                </div>

                <div className="mt-7 grid gap-3 sm:grid-cols-[1.1fr_.9fr]">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Current</p>
                    <p className="mt-2 font-heading text-lg font-bold">Senior Android Engineer</p>
                    <div className="mt-5 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-white/35">Readiness</p>
                        <p className="mt-1 text-2xl font-extrabold text-[#22D3EE]">78%</p>
                      </div>
                      <div className="size-14 rounded-full border-[5px] border-[#1677FF] border-r-[#22D3EE]/20" />
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-[#1677FF] to-[#22D3EE]" />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Target</p>
                    <p className="mt-2 font-heading text-lg font-bold">Tech Lead / Architect</p>
                    <div className="mt-6 space-y-3 text-xs">
                      {["Technical depth", "System design", "Interview readiness", "Career positioning"].map((item, index) => (
                        <div key={item} className="flex items-center justify-between gap-3">
                          <span className="text-white/55">{item}</span>
                          {index < 2 ? <Check className="size-3.5 text-[#22D3EE]" /> : <span className="size-2 rounded-full bg-[#F5B942]" />}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {["Diagnose", "Position", "Upgrade"].map((item, index) => (
                    <div key={item} className="rounded-xl border border-white/10 bg-black/15 px-3 py-3">
                      <span className="text-[9px] font-bold text-[#22D3EE]">0{index + 1}</span>
                      <p className="mt-1 text-xs font-bold text-white/75">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="hero-orbit pointer-events-none absolute -inset-6 rounded-full border border-[#22D3EE]/10" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0B1C32]/45" aria-label="Trust signals">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
          {[
            ["13+", "Years in software & Android"],
            ["Ola", "Product engineering experience"],
            ["PayU", "Technology experience"],
            ["100+", "Android engineers mentored"],
          ].map(([value, label]) => (
            <div key={value} className="px-4 py-7 text-center sm:px-6">
              <p className="font-heading text-2xl font-extrabold text-white sm:text-3xl">{value}</p>
              <p className="mt-1 text-[11px] leading-5 text-white/40 sm:text-xs">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="why" className="border-b border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">The real problem</p>
          <h2 className="mt-4 max-w-4xl font-heading text-3xl font-extrabold tracking-tight sm:text-5xl">
            Your experience is growing.{" "}
            <span className="text-white/45">But is your career growing with it?</span>
          </h2>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/55">
            You already know Android. You've shipped applications, solved production problems and spent years becoming better at your craft. But career growth can still feel slower than technical growth.
          </p>

          <div className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-white/10 bg-white/10 md:grid-cols-3">
            {[
              ["I keep delaying my switch.", "You know you should move, but months keep passing without a clear plan."],
              ["I interview, but I don't convert.", "Your experience looks good on paper, but interviews expose preparation gaps."],
              ["My experience isn't translating.", "You're becoming more experienced without seeing the career acceleration you expected."],
            ].map(([title, description]) => (
              <article key={title} className="bg-[#071426] p-7 sm:p-9">
                <span className="text-[#F5B942]">●</span>
                <h3 className="mt-5 font-heading text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-white/50">{description}</p>
              </article>
            ))}
          </div>

          <p className="mt-8 text-sm font-semibold text-white/65">
            If any of these sound familiar, this masterclass was built for you.
          </p>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.018] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">Is this you?</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-5xl">This masterclass is for experienced Android engineers.</h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {audience.map(({ icon: Icon, title, description }) => (
              <article key={title} className="group rounded-3xl border border-white/10 bg-[#0B1C32]/55 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#1677FF]/40 sm:p-8">
                <div className="flex size-11 items-center justify-center rounded-2xl border border-[#22D3EE]/15 bg-[#22D3EE]/5">
                  <Icon className="size-5 text-[#22D3EE]" />
                </div>
                <h3 className="mt-6 font-heading text-xl font-bold">{title}</h3>
                <p className="mt-3 leading-7 text-white/50">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-[#F5B942]/20 bg-[#F5B942]/[0.045] p-5 text-center">
            <p className="font-semibold text-white/80">
              This isn't another “learn Android from scratch” webinar.
            </p>
          </div>
        </div>
      </section>

      <section id="learn" className="border-b border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">Inside the masterclass</p>
              <h2 className="mt-4 max-w-3xl font-heading text-3xl font-extrabold sm:text-5xl">What you'll discover in 90 minutes.</h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-white/40">Specific ideas. Practical direction. No beginner Android syllabus.</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {learningPoints.map(({ number, title, description }) => (
              <article key={number} className="rounded-3xl border border-white/10 bg-white/[0.025] p-7 sm:p-9">
                <span className="font-heading text-5xl font-extrabold text-white/10">{number}</span>
                <h3 className="mt-8 font-heading text-2xl font-bold">{title}</h3>
                <p className="mt-4 max-w-xl leading-7 text-white/50">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10">
            <Button onClick={start} size="lg" className="rounded-full bg-[#1677FF] px-7 font-bold text-white hover:bg-[#2581ff]">
              Reserve My Free Seat <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <section id="framework" className="relative overflow-hidden border-b border-white/10 bg-[#0B1C32]/45 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(34,211,238,.07),transparent_35%)]" />
        <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">The signature framework</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-5xl">Your career needs a system.</h2>
            <p className="mt-5 text-lg leading-8 text-white/50">
              Introducing the Tech Leader Hub 9-stage career framework.
            </p>
          </div>

          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {framework.map(([number, title, description]) => (
              <article key={number} className="rounded-2xl border border-white/10 bg-[#071426]/75 p-6">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold tracking-[0.15em] text-[#22D3EE]">{number}</span>
                  <span className="size-2 rounded-full bg-[#F5B942]" />
                </div>
                <h3 className="mt-6 font-heading text-xl font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/45">{description}</p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white/35">
            {framework.map(([number, title], index) => (
              <span key={number} className="flex items-center gap-2">
                <span className="text-[#22D3EE]">{title}</span>
                {index < framework.length - 1 && <ArrowRight className="size-3 text-white/15" />}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:items-center">
          <div className="relative mx-auto w-full max-w-sm">
            <div className="absolute -inset-8 rounded-full bg-[#1677FF]/10 blur-3xl" />
            <div className="relative aspect-square rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0B1C32] via-[#0A1830] to-[#071426] p-6 shadow-2xl">
              <div className="flex h-full flex-col items-center justify-center rounded-[24px] border border-white/10 bg-white/[0.025]">
                <TLHLogo variant="icon" className="size-32 object-contain drop-shadow-[0_0_35px_rgba(34,211,238,.18)]" />
                <p className="mt-7 text-xs font-extrabold uppercase tracking-[0.22em] text-[#22D3EE]">Tech Leader Hub</p>
                <p className="mt-2 text-sm text-white/45">Career acceleration for technology professionals</p>
              </div>
            </div>
          </div>

          <div id="host">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">Your host</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-5xl">Hi, I'm Nikhil Rai.</h2>
            <p className="mt-3 font-semibold text-[#F5B942]">Android Architect · Mentor · Founder, Tech Leader Hub</p>
            <p className="mt-6 text-lg leading-8 text-white/55">
              I've spent 13+ years building software and working through the realities of Android engineering, product development and technical growth.
            </p>
            <p className="mt-5 text-lg leading-8 text-white/55">
              I've worked across companies including Ola and PayU, and experienced the difference between simply writing code and taking ownership of larger technical problems.
            </p>
            <p className="mt-5 text-lg leading-8 text-white/55">
              Today, I'm building Tech Leader Hub to help experienced Android engineers turn their existing experience into stronger technical depth, better positioning and a clearer path toward technical leadership.
            </p>

            <blockquote className="mt-8 border-l-2 border-[#22D3EE] pl-5 font-heading text-xl font-bold leading-8 text-white/85 sm:text-2xl">
              “You don't need another Android course. You need a system that connects your technical skills with your career goals.”
            </blockquote>

            <Button onClick={start} className="mt-8 rounded-full bg-[#1677FF] px-6 font-bold text-white hover:bg-[#2581ff]">
              Join My Free Masterclass <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.018] py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Users className="mx-auto size-8 text-[#F5B942]" />
            <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">Social proof</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-5xl">Built for engineers who are ready for their next level.</h2>
            <p className="mt-5 text-lg leading-8 text-white/50">
              Tech Leader Hub is built around practical career acceleration for experienced Android engineers.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {[
              ["100+", "Android engineers mentored"],
              ["13+", "Years of software & Android experience"],
              ["9", "Stages in the TLH career framework"],
            ].map(([value, label]) => (
              <div key={label} className="rounded-3xl border border-white/10 bg-[#071426] p-8 text-center">
                <p className="font-heading text-4xl font-extrabold text-white">{value}</p>
                <p className="mt-3 text-sm leading-6 text-white/40">{label}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-[#071426]/60 p-5 text-center text-sm text-white/45">
            Student testimonials and verified outcome screenshots can be added here as your proof library grows. No fabricated testimonials or results.
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">Bonus resources</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-5xl">Register free. Unlock the career starter pack.</h2>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Android Career Roadmap", "A structured roadmap to understand what capabilities matter at each career stage."],
              ["02", "LinkedIn Optimization Checklist", "A practical checklist to improve your professional positioning."],
              ["03", "Android Interview Questions Guide", "A focused guide to identify and prepare for common senior-level Android interview areas."],
            ].map(([number, title, description]) => (
              <article key={title} className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B1C32]/55 p-7 sm:p-8">
                <Gift className="size-7 text-[#F5B942]" />
                <span className="absolute right-6 top-6 font-heading text-4xl font-extrabold text-white/5">{number}</span>
                <h3 className="mt-8 font-heading text-xl font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/45">{description}</p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-5 rounded-3xl border border-[#22D3EE]/15 bg-[#22D3EE]/[0.035] p-7 sm:flex-row sm:items-center sm:justify-between sm:p-9">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#22D3EE]">Included with registration</p>
              <p className="mt-2 font-heading text-xl font-bold">Free masterclass + career resources</p>
            </div>
            <Button onClick={start} className="rounded-full bg-[#1677FF] px-6 font-bold text-white hover:bg-[#2581ff]">
              Claim My Free Seat <ArrowRight />
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 bg-white/[0.018] py-20 sm:py-28">
        <div className="mx-auto max-w-5xl px-5 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <ShieldCheck className="mx-auto size-8 text-[#22D3EE]" />
            <h2 className="mt-5 font-heading text-3xl font-extrabold sm:text-5xl">Here's what happens after you register.</h2>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-4">
            {[
              ["01", "Reserve your seat", "Complete the short registration form."],
              ["02", "Get your confirmation", "Receive your masterclass details."],
              ["03", "Join live on Zoom", "Attend the 90-minute session."],
              ["04", "Build career clarity", "Understand your next move and the TLH framework."],
            ].map(([number, title, description]) => (
              <article key={number} className="rounded-2xl border border-white/10 bg-[#071426] p-6">
                <span className="text-xs font-extrabold text-[#22D3EE]">{number}</span>
                <h3 className="mt-5 font-heading font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/40">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="border-b border-white/10 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">FAQ</p>
            <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-5xl">Questions before you reserve your seat?</h2>
          </div>

          <div className="mt-12 overflow-hidden rounded-3xl border border-white/10">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="border-b border-white/10 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-6 text-left sm:px-7"
                  aria-expanded={openFaq === index}
                >
                  <span className="font-heading font-bold text-white/85">{faq.question}</span>
                  <ChevronDown className={`size-5 shrink-0 text-white/40 transition-transform ${openFaq === index ? "rotate-180" : ""}`} />
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 text-sm leading-7 text-white/50 sm:px-7">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-white/10 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(22,119,255,.16),transparent_45%)]" />
        <div className="relative mx-auto max-w-4xl px-5 text-center sm:px-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#22D3EE]">Next live session</p>
          <h2 className="mt-5 font-heading text-4xl font-extrabold tracking-tight sm:text-6xl">Your next career move deserves a strategy.</h2>
          <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
            {[
              ["Sunday", "11:00 AM IST"],
              ["90 minutes", "Live on Zoom"],
              ["Free", "Limited live seats"],
            ].map(([value, label]) => (
              <div key={value} className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
                <p className="font-heading text-lg font-bold">{value}</p>
                <p className="mt-1 text-xs text-white/40">{label}</p>
              </div>
            ))}
          </div>
          <Button onClick={start} size="lg" className="mt-9 h-14 rounded-full bg-[#1677FF] px-9 text-base font-extrabold text-white shadow-[0_12px_50px_rgba(22,119,255,.28)] hover:bg-[#2581ff]">
            Book My Free Seat <ArrowRight />
          </Button>
          <p className="mt-4 text-xs text-white/35">Live · Online · 100% Free</p>
        </div>
      </section>

      <section className="border-b border-white/10 bg-[#0B1C32]/45 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <div className="rounded-[32px] border border-[#1677FF]/20 bg-[#071426] p-7 shadow-2xl sm:p-10">
            <div className="text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">Reserve your seat</p>
              <h2 className="mt-4 font-heading text-3xl font-extrabold sm:text-5xl">You already have the experience. Now build the career system around it.</h2>
              <p className="mx-auto mt-5 max-w-2xl leading-7 text-white/45">
                Join the free Tech Leader Hub masterclass and discover a clearer path from experienced Android engineer to technical leader.
              </p>
              <Button onClick={start} size="lg" className="mt-8 h-14 rounded-full bg-[#1677FF] px-8 text-base font-extrabold text-white hover:bg-[#2581ff]">
                Book My Free Seat <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-9">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link to="/" aria-label="Tech Leader Hub home">
            <TLHLogo className="h-9 w-auto max-w-[170px] object-contain" />
          </Link>
          <div className="flex flex-wrap gap-5 text-xs text-white/35">
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/framework" className="hover:text-white">Framework</Link>
            <Link to="/programs" className="hover:text-white">Programs</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/privacy" className="hover:text-white">Privacy</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p className="text-xs text-white/30">© Tech Leader Hub</p>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#071426]/95 p-3 backdrop-blur-xl md:hidden">
        <Button onClick={start} className="h-12 w-full rounded-full bg-[#1677FF] font-extrabold text-white hover:bg-[#2581ff]">
          Book My Free Seat <ArrowRight />
        </Button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md" role="dialog" aria-modal="true" aria-labelledby="registration-title">
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/12 bg-[#0B1C32] p-6 shadow-2xl sm:p-8">
            <button type="button" onClick={() => setOpen(false)} aria-label="Close registration" className="absolute right-4 top-4 rounded-full p-2 text-white/45 transition hover:bg-white/5 hover:text-white">
              <X className="size-5" />
            </button>

            {registered ? (
              <div className="py-10 text-center">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-[#22D3EE]/20 bg-[#22D3EE]/10">
                  <Check className="size-8 text-[#22D3EE]" />
                </div>
                <h2 id="registration-title" className="mt-7 font-heading text-3xl font-extrabold">You're registered.</h2>
                <p className="mt-3 leading-7 text-white/50">Your masterclass registration has been saved successfully.</p>
                <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.035] p-5 text-sm text-white/75">
                  <strong>Every Sunday · 11:00 AM IST · Live on Zoom</strong>
                </div>
                <p className="mt-4 text-xs leading-6 text-white/35">Your session details and next steps can be shared after registration.</p>
                <Button onClick={() => setOpen(false)} className="mt-7 rounded-full bg-[#1677FF] px-7 text-white hover:bg-[#2581ff]">Done</Button>
              </div>
            ) : processing ? (
              <div className="py-14 text-center">
                <div className="mx-auto size-10 animate-spin rounded-full border-2 border-white/10 border-t-[#22D3EE]" />
                <h2 id="registration-title" className="mt-6 font-heading text-2xl font-bold">Saving your seat...</h2>
              </div>
            ) : (
              <>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#22D3EE]">Step {step + 1} of 3</p>
                <h2 id="registration-title" className="mt-3 pr-8 font-heading text-2xl font-extrabold">
                  {step === 0 && "Let's reserve your seat."}
                  {step === 1 && "Tell us where you are in your career."}
                  {step === 2 && "What's the biggest challenge you want to solve?"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/40">
                  {step === 0 && "We'll use these details to confirm your live masterclass seat."}
                  {step === 1 && "This helps us understand the audience in the room."}
                  {step === 2 && "Your answer helps us make the session more relevant."}
                </p>

                <div className="mt-7 space-y-4">
                  {step === 0 && (
                    <>
                      <input value={form.fullName} onChange={(e) => setForm((current) => ({ ...current, fullName: e.target.value }))} placeholder="Full Name" autoComplete="name" className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-white outline-none placeholder:text-white/30 focus:border-[#1677FF]" />
                      <input value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} placeholder="Email Address" type="email" autoComplete="email" className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-white outline-none placeholder:text-white/30 focus:border-[#1677FF]" />
                      <input value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} placeholder="WhatsApp Number" type="tel" autoComplete="tel" className="h-13 w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 text-white outline-none placeholder:text-white/30 focus:border-[#1677FF]" />
                    </>
                  )}

                  {step === 1 && (
                    <>
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Years of Android experience</label>
                        <select value={form.experienceRange} onChange={(e) => setForm((current) => ({ ...current, experienceRange: e.target.value }))} className="h-13 w-full rounded-xl border border-white/10 bg-[#0B1C32] px-4 text-white outline-none focus:border-[#1677FF]">
                          <option value="">Select experience</option>
                          <option value="2–3 years">2–3 years</option>
                          <option value="3–5 years">3–5 years</option>
                          <option value="5–8 years">5–8 years</option>
                          <option value="8+ years">8+ years</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Current role</label>
                        <select value={form.currentRole} onChange={(e) => setForm((current) => ({ ...current, currentRole: e.target.value }))} className="h-13 w-full rounded-xl border border-white/10 bg-[#0B1C32] px-4 text-white outline-none focus:border-[#1677FF]">
                          <option value="">Select current role</option>
                          <option value="Android Developer">Android Developer</option>
                          <option value="Senior Android Developer">Senior Android Developer</option>
                          <option value="Lead Android Developer">Lead Android Developer</option>
                          <option value="Staff Engineer">Staff Engineer</option>
                          <option value="Architect">Architect</option>
                          <option value="Engineering Manager">Engineering Manager</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  {step === 2 && (
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">Biggest career challenge</label>
                      <select value={form.biggestChallenge} onChange={(e) => setForm((current) => ({ ...current, biggestChallenge: e.target.value }))} className="h-13 w-full rounded-xl border border-white/10 bg-[#0B1C32] px-4 text-white outline-none focus:border-[#1677FF]">
                        <option value="">Select your biggest challenge</option>
                        <option value="Planning to switch">I'm planning to switch</option>
                        <option value="Interviewing but not converting">I'm interviewing but not converting</option>
                        <option value="Salary growth has slowed">My salary growth has slowed</option>
                        <option value="Want to move into leadership">I want to move into leadership</option>
                        <option value="Need stronger system-design skills">I need stronger system-design skills</option>
                        <option value="Don't know what to focus on next">I don't know what to focus on next</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  )}

                  {error && <p className="text-sm text-red-300">{error}</p>}

                  {step < 2 ? (
                    <Button
                      onClick={() => {
                        setError("");
                        if (step === 0 && (!form.fullName.trim() || !form.email.trim() || !form.phone.trim())) {
                          setError("Please enter your name, email, and WhatsApp number.");
                          return;
                        }
                        if (step === 1 && (!form.experienceRange || !form.currentRole)) {
                          setError("Please select your experience and current role.");
                          return;
                        }
                        setStep(step + 1);
                      }}
                      className="h-13 w-full rounded-xl bg-[#1677FF] font-extrabold text-white hover:bg-[#2581ff]"
                    >
                      Continue <ArrowRight />
                    </Button>
                  ) : (
                    <Button onClick={submitRegistration} className="h-13 w-full rounded-xl bg-[#1677FF] font-extrabold text-white hover:bg-[#2581ff]">
                      Book My Free Seat <ArrowRight />
                    </Button>
                  )}

                  <p className="text-center text-[11px] leading-5 text-white/30">Your information is used to confirm your masterclass registration and send session details.</p>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
