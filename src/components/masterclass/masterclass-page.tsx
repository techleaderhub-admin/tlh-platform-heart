import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarDays, Check, Clock3, Laptop2, Sparkles, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { TLHLogo } from "@/components/brand/tlh-logo";

const SESSION_LABEL = "Sunday 11:00 AM IST";
const SESSION_TIME = "11:00 AM IST";

const questions = [
  { title: "What's your Android experience?", options: ["0–2 years", "3–5 years", "6+ years"] },
  { title: "What's your biggest career roadblock?", options: ["Low salary", "Failing interviews", "Stuck in a service company"] },
];

type RegistrationForm = {
  experienceRange: string;
  roadblock: string;
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
  const [form, setForm] = useState<RegistrationForm>({
    experienceRange: "",
    roadblock: "",
    fullName: "",
    email: "",
    phone: "",
  });

  const start = () => {
    setStep(0);
    setProcessing(false);
    setRegistered(false);
    setError("");
    setForm({ experienceRange: "", roadblock: "", fullName: "", email: "", phone: "" });
    setOpen(true);
  };

  const choose = (value: string) => {
    setError("");
    if (step === 0) {
      setForm((current) => ({ ...current, experienceRange: value }));
      setStep(1);
      return;
    }

    setForm((current) => ({ ...current, roadblock: value }));
    setStep(2);
  };

  const submitRegistration = async () => {
    setError("");

    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please enter your name, email, and phone number.");
      return;
    }

    setProcessing(true);

    const { error: insertError } = await supabase.from("masterclass_registrations").insert({
      full_name: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      experience_range: form.experienceRange,
      roadblock: form.roadblock,
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
    <main className="min-h-screen bg-[#0B0C10] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0B0C10]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/" aria-label="Tech Leader Hub home"><TLHLogo className="h-10 w-auto max-w-[190px] object-contain" /></Link>
          <Button onClick={start} className="bg-[#2563EB] text-white hover:bg-[#1d4ed8]">Save My Free Seat</Button>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_25%,rgba(37,99,235,.30),transparent_36%),radial-gradient(circle_at_18%_20%,rgba(34,211,238,.10),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.08fr_.92fr] lg:items-center lg:pb-28 lg:pt-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#22D3EE]/25 bg-[#22D3EE]/5 px-4 py-2 text-xs font-bold uppercase tracking-[.16em] text-[#22D3EE]"><Sparkles className="size-3.5" />Free 90-Minute Masterclass</div>
            <p className="mt-6 text-sm font-semibold text-white/75">Ex-Ola & PayU Android Engineer reveals the career roadmap nobody talks about.</p>
            <h1 className="mt-5 max-w-4xl font-heading text-4xl font-extrabold leading-[1.04] sm:text-6xl lg:text-7xl">How Android Developers Can Get Hired in Product-Based Companies and <span className="text-[#2563EB]">2X Their Salary.</span></h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/60 sm:text-xl">A practical 90-minute session on positioning, interview readiness, career architecture, and the moves that can open stronger product-company opportunities.</p>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              {[[CalendarDays, "Every Sunday"], [Clock3, SESSION_TIME], [Laptop2, "Live on Zoom"]].map(([Icon, value]) => <div key={String(value)} className="border border-white/10 bg-white/[.03] p-4"><Icon className="size-5 text-[#22D3EE]" /><p className="mt-3 text-sm text-white/75">{String(value)}</p></div>)}
            </div>
            <Button size="lg" onClick={start} className="mt-8 h-13 bg-[#2563EB] px-7 text-white hover:bg-[#1d4ed8]">Save My Free Seat Now <ArrowRight /></Button>
          </div>
          <div className="border border-white/10 bg-white/[.04] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
            <div className="aspect-[4/3] border border-white/10 bg-[linear-gradient(135deg,rgba(37,99,235,.18),rgba(34,211,238,.05))] p-6">
              <div className="flex h-full flex-col justify-between"><p className="text-xs uppercase tracking-[.18em] text-white/40">Career Architecture / TLH 90</p><div className="grid grid-cols-2 gap-3">{["Position","Upgrade","Prove","Convert"].map((x,i)=><div key={x} className="border border-white/10 bg-black/20 p-4"><span className="text-xs text-[#22D3EE]">0{i+1}</span><p className="mt-5 font-heading font-bold">{x}</p></div>)}</div><p className="text-sm text-white/55">Product-company career blueprint</p></div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-20 sm:py-28"><div className="mx-auto max-w-6xl px-5 sm:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#22D3EE]">The problem</p><h2 className="mt-4 max-w-3xl font-heading text-3xl font-bold sm:text-5xl">You can be experienced and still feel stuck.</h2><div className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-3">{[["Legacy code","Years of experience can feel invisible when the work no longer stretches your engineering depth."],["Salary stagnation","Small increments compound into a career ceiling when your market positioning stays unchanged."],["Interview anxiety","HLD, LLD, system design, and architecture rounds demand preparation beyond day-to-day feature work."]].map(([t,d])=><article key={t} className="bg-[#0B0C10] p-7 sm:p-9"><h3 className="font-heading text-xl font-bold">{t}</h3><p className="mt-3 leading-7 text-white/60">{d}</p></article>)}</div></div></section>

      <section className="border-b border-white/10 bg-white/[.02] py-20 sm:py-28"><div className="mx-auto max-w-6xl px-5 sm:px-8"><p className="text-sm font-bold uppercase tracking-[.16em] text-[#22D3EE]">Inside the masterclass</p><h2 className="mt-4 max-w-3xl font-heading text-3xl font-bold sm:text-5xl">Three ideas that change how you approach the next move.</h2><div className="mt-12 grid gap-5 lg:grid-cols-3">{[["01","The Degree Myth","Understand what product organizations evaluate beyond academic percentages, college brand, and polished English."],["02","The Invisible Ceiling","See why syntax and problem-solving alone are not the complete Senior/Architect story—and where architecture depth fits."],["03","The Airport Water Bottle Theory","Learn how positioning and negotiation framing can change the value conversation."]].map(([n,t,d])=><article key={t} className="border border-white/10 bg-[#0E1118] p-7 sm:p-9"><span className="text-5xl font-extrabold text-white/10">{n}</span><h3 className="mt-10 font-heading text-2xl font-bold">{t}</h3><p className="mt-4 leading-7 text-white/60">{d}</p></article>)}</div></div></section>

      <section className="border-b border-white/10 py-20 sm:py-28"><div className="mx-auto max-w-6xl px-5 sm:px-8"><div className="grid gap-4 sm:grid-cols-2">{["Android Career Roadmap PDF","4 Ways to Earn Money Guide","TLH VIP Community access details","Practical product-company preparation framework"].map(x=><div key={x} className="flex gap-3 border border-white/10 bg-white/[.03] p-5"><Check className="size-5 shrink-0 text-[#22D3EE]" /><span className="text-white/75">{x}</span></div>)}</div></div></section>

      <section className="border-b border-white/10 bg-white/[.02] py-20 sm:py-28"><div className="mx-auto max-w-5xl px-5 text-center sm:px-8"><Users className="mx-auto size-8 text-[#F5B942]" /><h2 className="mt-5 font-heading text-3xl font-bold sm:text-5xl">Built for working Android developers.</h2><p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-white/60">Whether you're considering a switch, interviewing already, or trying to break through a career plateau, this session is designed around the decisions that come next.</p><Button size="lg" onClick={start} className="mt-8 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">Register Free <ArrowRight /></Button></div></section>

      <footer className="border-t border-white/10 py-8"><div className="mx-auto flex max-w-7xl justify-between px-5 text-sm text-white/45 sm:px-8"><Link to="/" className="text-white/70" aria-label="Tech Leader Hub home"><TLHLogo className="h-8 w-auto max-w-[160px] object-contain" /></Link><span>Career acceleration for technology professionals.</span></div></footer>

      {open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="registration-title"><div className="relative w-full max-w-lg border border-white/15 bg-[#0E1118] p-7 shadow-2xl sm:p-9"><button type="button" onClick={()=>setOpen(false)} aria-label="Close registration" className="absolute right-4 top-4 p-2 text-white/50 hover:text-white"><X className="size-5" /></button>
        {registered ? <div className="py-10 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#22D3EE]/10"><Check className="size-7 text-[#22D3EE]" /></div>
          <h2 id="registration-title" className="mt-6 font-heading text-2xl font-bold">You're registered.</h2>
          <p className="mt-3 text-white/60">Your masterclass registration has been saved successfully.</p>
          <div className="mt-6 border border-white/10 bg-white/[.03] p-4 text-sm text-white/75"><strong>Every Sunday · 11:00 AM IST · Live on Zoom</strong></div>
          <p className="mt-4 text-sm text-white/45">Course details and the next steps can be shared after the masterclass.</p>
          <Button onClick={()=>setOpen(false)} className="mt-7 bg-[#2563EB] text-white hover:bg-[#1d4ed8]">Done</Button>
        </div> : processing ? <div className="py-12 text-center"><div className="mx-auto size-10 animate-spin rounded-full border-2 border-white/15 border-t-[#22D3EE]" /><h2 id="registration-title" className="mt-6 font-heading text-2xl font-bold">Saving your seat...</h2></div> : step < 2 ? <><p className="text-xs font-bold uppercase tracking-[.16em] text-[#22D3EE]">Step {step+1} of 3</p><h2 id="registration-title" className="mt-3 pr-8 font-heading text-2xl font-bold">{questions[step].title}</h2><div className="mt-7 space-y-3">{questions[step].options.map(x=><button key={x} type="button" onClick={()=>choose(x)} className="flex w-full items-center justify-between border border-white/10 bg-white/[.03] px-5 py-4 text-left hover:border-[#2563EB]/70 hover:bg-[#2563EB]/10"><span>{x}</span><ArrowRight className="size-4" /></button>)}</div></> : <><p className="text-xs font-bold uppercase tracking-[.16em] text-[#22D3EE]">Step 3 of 3</p><h2 id="registration-title" className="mt-3 pr-8 font-heading text-2xl font-bold">Where should we send your masterclass details?</h2><div className="mt-6 space-y-3"><input value={form.fullName} onChange={(e)=>setForm((current)=>({...current,fullName:e.target.value}))} placeholder="Full Name" autoComplete="name" className="h-12 w-full border border-white/10 bg-white/[.03] px-4 text-white outline-none placeholder:text-white/35 focus:border-[#2563EB]" /><input value={form.email} onChange={(e)=>setForm((current)=>({...current,email:e.target.value}))} placeholder="Email Address" type="email" autoComplete="email" className="h-12 w-full border border-white/10 bg-white/[.03] px-4 text-white outline-none placeholder:text-white/35 focus:border-[#2563EB]" /><input value={form.phone} onChange={(e)=>setForm((current)=>({...current,phone:e.target.value}))} placeholder="Phone Number" type="tel" autoComplete="tel" className="h-12 w-full border border-white/10 bg-white/[.03] px-4 text-white outline-none placeholder:text-white/35 focus:border-[#2563EB]" />{error && <p className="text-sm text-red-300">{error}</p>}<Button onClick={submitRegistration} className="mt-2 h-12 w-full bg-[#2563EB] text-white hover:bg-[#1d4ed8]">Save My Free Seat <ArrowRight /></Button></div></>}
      </div></div> : null}
    </main>
  );
}
