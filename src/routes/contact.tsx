import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, ArrowRight, CheckCircle2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { PublicPageShell, ContentSection } from "@/components/public-site/public-page-shell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [
    { title: "Contact Tech Leader Hub" },
    { name: "description", content: "Contact Tech Leader Hub about career acceleration, masterclasses, programs, and the TLH platform." },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Tech Leader Hub" },
    { property: "og:url", content: "https://techleaderhub.com/contact" },
    { property: "og:title", content: "Contact Tech Leader Hub" },
    { property: "og:description", content: "Contact Tech Leader Hub about career acceleration, masterclasses, programs, and the TLH platform." },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: "Contact Tech Leader Hub" },
    { name: "twitter:description", content: "Contact Tech Leader Hub about career acceleration, masterclasses, programs, and the TLH platform." },
  ], links: [{ rel: "canonical", href: "https://techleaderhub.com/contact" }] }),
  component: ContactPage,
});

function ContactPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", subject: "", message: "" });
  const [busy, setBusy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setSubmitted(false);
    setError(null);
    const { error: submitError } = await supabase.from("contact_messages").insert({
      full_name: form.full_name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      subject: form.subject.trim() || null,
      message: form.message.trim(),
    });
    if (submitError) {
      setError("We could not send your message. Please try again.");
    } else {
      setSubmitted(true);
      setForm({ full_name: "", email: "", phone: "", subject: "", message: "" });
    }
    setBusy(false);
  };

  return <PublicPageShell eyebrow="Contact" title="Let's talk about your next career move." description="For masterclass registration, program questions, partnerships, or platform support, use the TLH contact form or email.">
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <ContentSection title="Send a message">
        <form onSubmit={submit} className="space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="contact-name">Full name</Label><Input id="contact-name" required minLength={2} maxLength={120} value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="contact-email">Email</Label><Input id="contact-email" type="email" required maxLength={320} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="contact-phone">Phone</Label><Input id="contact-phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
            <div className="space-y-2"><Label htmlFor="contact-subject">Subject</Label><Input id="contact-subject" maxLength={200} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" required minLength={10} maxLength={5000} rows={7} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} /></div>
          {error && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}
          {submitted && <p className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm"><CheckCircle2 className="size-4 text-primary" /> Your message has been received. The TLH team can follow up from the Admin workspace.</p>}
          <Button type="submit" disabled={busy}><Send />{busy ? "Sending…" : "Send message"}</Button>
        </form>
      </ContentSection>
      <div className="space-y-6">
        <ContentSection title="Masterclass and program enquiries"><p>The fastest way to begin is through the free TLH masterclass. It introduces the framework and gives you a starting point for your career journey.</p><Button asChild><Link to="/masterclass">Join the Masterclass <ArrowRight /></Link></Button></ContentSection>
        <ContentSection title="Email"><div className="flex items-center gap-3 border border-border bg-card/50 p-5"><Mail className="text-accent" /><span className="font-medium text-foreground">techleaderhub@gmail.com</span></div></ContentSection>
      </div>
    </div>
  </PublicPageShell>;
}
