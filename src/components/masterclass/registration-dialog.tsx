import { useEffect, useId, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CalendarPlus, Check, Lock, X } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { trackMetaCustom, trackMetaStandard } from "@/lib/meta-tracking";
import {
  CHALLENGE_OPTIONS,
  COMPANY_OPTIONS,
  CTC_OPTIONS,
  EVENT,
  EXPERIENCE_OPTIONS,
  TIMELINE_OPTIONS,
  type Option,
} from "@/components/masterclass/masterclass-content";
import {
  formatSessionDate,
  nextSessionStart,
  sessionLabel,
} from "@/components/masterclass/use-next-session";

type Answers = {
  experience: string;
  company: string;
  ctc: string;
  challenge: string;
  timeline: string;
  fullName: string;
  email: string;
  phone: string;
};

const EMPTY: Answers = {
  experience: "",
  company: "",
  ctc: "",
  challenge: "",
  timeline: "",
  fullName: "",
  email: "",
  phone: "",
};

const STEP_TITLES = [
  "Where are you in your Android career?",
  "What's holding your next move back?",
  "Where should we send your seat?",
] as const;

const STEP_HINTS = [
  "Two quick taps. This tailors the session to the people in the room.",
  "Your answers shape the examples Nikhil uses live.",
  "Your Zoom link and reminders go to your email and WhatsApp.",
] as const;

/** Lead quality for ad optimisation, from intent signals only (no personal or salary data). */
function leadQuality(answers: Answers): "high" | "medium" | "low" {
  if (answers.timeline === "Within 3 months" || answers.timeline === "3–6 months") return "high";
  if (answers.timeline === "6–12 months") return "medium";
  return "low";
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

function isValidPhone(value: string) {
  return value.replace(/\D/g, "").length >= 10;
}

function googleCalendarUrl(startMs: number) {
  const fmt = (ms: number) =>
    new Date(ms)
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const end = startMs + 2 * 60 * 60 * 1000;
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Tech Leader Hub Masterclass (Live on Zoom)",
    dates: `${fmt(startMs)}/${fmt(end)}`,
    details:
      "Free live masterclass with Nikhil Kumar Rai. The Zoom link is sent to your email and WhatsApp.",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function ChoiceGroup({
  legend,
  name,
  options,
  value,
  onChange,
  columns = 2,
}: {
  legend: string;
  name: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  columns?: 1 | 2;
}) {
  return (
    <fieldset className="mc-fieldset">
      <legend className="mc-legend">{legend}</legend>
      <div className={columns === 2 ? "mc-choices mc-choices-2" : "mc-choices"}>
        {options.map((option) => (
          <label key={option.value} className="mc-choice">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span className="mc-choice-box">
              <span className="mc-choice-dot" aria-hidden="true">
                <Check className="size-3" />
              </span>
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function RegistrationDialog({
  open,
  source,
  onClose,
}: {
  open: boolean;
  source: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [registeredFor, setRegisteredFor] = useState<number | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();

  const set = (key: keyof Answers) => (value: string) => {
    setError("");
    setAnswers((current) => ({ ...current, [key]: value }));
  };

  // Reset, track the open, lock page scroll and close on Escape while open.
  useEffect(() => {
    if (!open) return;
    setStep(0);
    setAnswers(EMPTY);
    setError("");
    setSaving(false);
    setRegisteredFor(null);
    trackMetaCustom("MasterclassOptInStart", { source });

    const { body, documentElement: html } = document;
    const scrollY = window.scrollY;
    const previous = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    html.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !panelRef.current) return;
      // Keep keyboard focus inside the dialog.
      const focusable = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      html.style.overflow = "";
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [open, source, onClose]);

  // Move focus to the first control of each step.
  useEffect(() => {
    if (!open) return;
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("input, button.mc-btn")?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, step, registeredFor]);

  if (!open) return null;

  const next = () => {
    setError("");
    if (step === 0) {
      if (!answers.experience || !answers.company) {
        setError("Please choose your experience and where you work today.");
        return;
      }
      trackMetaCustom("MasterclassQualifyStep1", {
        source,
        experience: answers.experience,
        company_type: answers.company,
      });
    }
    if (step === 1) {
      if (!answers.ctc || !answers.challenge || !answers.timeline) {
        setError("Please answer all three questions to continue.");
        return;
      }
      trackMetaCustom("MasterclassQualifyStep2", {
        source,
        challenge: answers.challenge,
        switch_timeline: answers.timeline,
        lead_quality: leadQuality(answers),
      });
    }
    setStep((current) => current + 1);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!answers.fullName.trim()) return setError("Please enter your full name.");
    if (!isValidEmail(answers.email)) return setError("Please enter a valid email address.");
    if (!isValidPhone(answers.phone)) return setError("Please enter a valid WhatsApp number.");

    setSaving(true);
    const start = nextSessionStart(Date.now());
    // Same table and fields as before, so registrations keep showing in the admin dashboard.
    // The extra qualifying answers are kept in the existing free-text roadblock field.
    const roadblock = [
      `Company: ${answers.company}`,
      `Current CTC: ${answers.ctc}`,
      `Biggest challenge: ${answers.challenge}`,
      `Switch timeline: ${answers.timeline}`,
    ].join(" | ");

    const { error: insertError } = await supabase.from("masterclass_registrations").insert({
      full_name: answers.fullName.trim(),
      email: answers.email.trim().toLowerCase(),
      phone: answers.phone.trim(),
      experience_range: answers.experience,
      roadblock,
      session_label: sessionLabel(start),
    });

    setSaving(false);
    if (insertError) {
      setError("We couldn't save your seat. Please check your details and try again.");
      return;
    }

    const quality = leadQuality(answers);
    trackMetaStandard("Lead", { content_name: "TLH Masterclass", lead_quality: quality, source });
    trackMetaStandard("CompleteRegistration", {
      content_name: "TLH Masterclass",
      lead_quality: quality,
    });
    setRegisteredFor(start);
  };

  const progress = registeredFor ? 100 : Math.round(((step + 1) / 3) * 100);

  return (
    <div
      className="mc-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={panelRef}
        className="mc-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close registration"
          className="mc-dialog-close"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="mc-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>

        {registeredFor ? (
          <div className="mc-success">
            <div className="mc-success-icon">
              <Check className="size-7" aria-hidden="true" />
            </div>
            <h2 id={headingId} className="mc-dialog-title">
              Your seat is reserved.
            </h2>
            <p className="mc-dialog-hint">
              {formatSessionDate(registeredFor)} · {EVENT.timeLabel} · {EVENT.platform}
            </p>
            <p className="mc-success-text">
              Your Zoom link and reminders are on their way to your email and WhatsApp. Stay until
              the end to claim all three action gifts.
            </p>
            <a
              className="mc-btn mc-btn-primary mc-btn-block"
              href={googleCalendarUrl(registeredFor)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CalendarPlus className="size-5" aria-hidden="true" />
              Add to Google Calendar
            </a>
            <button type="button" className="mc-btn mc-btn-ghost mc-btn-block" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          <>
            <p className="mc-step-label">Step {step + 1} of 3</p>
            <h2 id={headingId} className="mc-dialog-title">
              {STEP_TITLES[step]}
            </h2>
            <p className="mc-dialog-hint">{STEP_HINTS[step]}</p>

            {step === 0 && (
              <div className="mc-step">
                <ChoiceGroup
                  legend="Years of Android experience"
                  name="experience"
                  options={EXPERIENCE_OPTIONS}
                  value={answers.experience}
                  onChange={set("experience")}
                />
                <ChoiceGroup
                  legend="Where do you work today?"
                  name="company"
                  options={COMPANY_OPTIONS}
                  value={answers.company}
                  onChange={set("company")}
                  columns={1}
                />
              </div>
            )}

            {step === 1 && (
              <div className="mc-step">
                <ChoiceGroup
                  legend="Current annual package (CTC)"
                  name="ctc"
                  options={CTC_OPTIONS}
                  value={answers.ctc}
                  onChange={set("ctc")}
                />
                <ChoiceGroup
                  legend="Your biggest roadblock right now"
                  name="challenge"
                  options={CHALLENGE_OPTIONS}
                  value={answers.challenge}
                  onChange={set("challenge")}
                  columns={1}
                />
                <ChoiceGroup
                  legend="When do you want to make your move?"
                  name="timeline"
                  options={TIMELINE_OPTIONS}
                  value={answers.timeline}
                  onChange={set("timeline")}
                />
              </div>
            )}

            {step === 2 ? (
              <form className="mc-step" onSubmit={submit} noValidate>
                <div className="mc-field">
                  <label htmlFor={nameId}>Full name</label>
                  <input
                    id={nameId}
                    value={answers.fullName}
                    onChange={(event) => set("fullName")(event.target.value)}
                    autoComplete="name"
                    placeholder="Your full name"
                  />
                </div>
                <div className="mc-field">
                  <label htmlFor={emailId}>Email address</label>
                  <input
                    id={emailId}
                    type="email"
                    inputMode="email"
                    value={answers.email}
                    onChange={(event) => set("email")(event.target.value)}
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </div>
                <div className="mc-field">
                  <label htmlFor={phoneId}>WhatsApp number</label>
                  <input
                    id={phoneId}
                    type="tel"
                    inputMode="tel"
                    value={answers.phone}
                    onChange={(event) => set("phone")(event.target.value)}
                    autoComplete="tel"
                    placeholder="+91 98765 43210"
                  />
                </div>

                {error ? (
                  <p className="mc-error" role="alert">
                    {error}
                  </p>
                ) : null}

                <button
                  type="submit"
                  className="mc-btn mc-btn-primary mc-btn-block"
                  disabled={saving}
                >
                  {saving ? "Saving your seat…" : "Reserve my free seat"}
                  {saving ? null : <ArrowRight className="size-5" aria-hidden="true" />}
                </button>
                <button
                  type="button"
                  className="mc-btn mc-btn-ghost mc-btn-block"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="size-4" aria-hidden="true" />
                  Back
                </button>
                <p className="mc-privacy">
                  <Lock className="size-3.5" aria-hidden="true" />
                  Used only to send your Zoom link and session reminders. No spam.
                </p>
              </form>
            ) : (
              <>
                {error ? (
                  <p className="mc-error" role="alert">
                    {error}
                  </p>
                ) : null}
                <button type="button" className="mc-btn mc-btn-primary mc-btn-block" onClick={next}>
                  Continue
                  <ArrowRight className="size-5" aria-hidden="true" />
                </button>
                {step > 0 ? (
                  <button
                    type="button"
                    className="mc-btn mc-btn-ghost mc-btn-block"
                    onClick={() => setStep(step - 1)}
                  >
                    <ArrowLeft className="size-4" aria-hidden="true" />
                    Back
                  </button>
                ) : null}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
