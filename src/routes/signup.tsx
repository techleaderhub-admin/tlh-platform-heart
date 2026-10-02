import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertCircle, CheckCircle2, LoaderCircle, UserPlus } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneCountryField, findCountryByIso } from "@/components/auth/phone-country-field";
import { supabase } from "@/integrations/supabase/client";
import { signupSchema } from "@/lib/auth-validation";

const findDialCode = (iso: string) => findCountryByIso(iso).dialCode;

export const Route = createFileRoute("/signup")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create Account | Tech Leader Hub" },
      { name: "description", content: "Create your secure Tech Leader Hub Leader account." },
      { property: "og:title", content: "Create Account | Tech Leader Hub" },
      { property: "og:description", content: "Create your secure Tech Leader Hub Leader account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  function validateField(event: React.FocusEvent<HTMLInputElement>) {
    const fieldName = event.currentTarget.name;
    const form = event.currentTarget.form;
    if (!form) return;

    const formValues = Object.fromEntries(new FormData(form));
    const values = { ...formValues, phone: `${findDialCode(phoneCountryCode)}${String(formValues.phone ?? "")}` };
    const parsed = signupSchema.safeParse(values);
    const message = parsed.success
      ? undefined
      : parsed.error.issues.find((issue) => issue.path[0] === fieldName)?.message;

    setFieldErrors((current) => {
      const next = { ...current };
      if (message) next[fieldName] = message;
      else delete next[fieldName];
      return next;
    });
  }

  function clearFieldError(fieldName: string) {
    setFieldErrors((current) => {
      if (!current[fieldName]) return current;
      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  }

  function getSignupError(error: { code?: string; message?: string; status?: number } | null) {
    if (!error) return null;

    switch (error.code) {
      case "email_exists":
      case "user_already_exists":
        return { field: "email", message: "This email is already registered. Please sign in or use Forgot password." };
      case "phone_exists":
        return { field: "phone", message: "This phone number is already registered. Please use a different number or sign in." };
      case "weak_password":
        return { field: "password", message: "This password is too weak. Use at least 6 characters with uppercase, lowercase, and a number." };
      case "validation_failed":
        return { field: "email", message: "Please check the email and account details and try again." };
      case "signup_disabled":
      case "email_provider_disabled":
        return { field: "email", message: "Email sign-up is currently disabled. Please contact Tech Leader Hub support." };
    }

    const raw = `${error.code ?? ""} ${error.message ?? ""}`.toLowerCase();
    if (raw.includes("profiles_phone_unique_idx") || (raw.includes("duplicate key") && raw.includes("phone"))) {
      return { field: "phone", message: "This phone number is already registered. Please use a different number or sign in." };
    }
    if (raw.includes("email") && (raw.includes("already") || raw.includes("exists"))) {
      return { field: "email", message: "This email is already registered. Please sign in or use Forgot password." };
    }
    if (raw.includes("password") && (raw.includes("weak") || raw.includes("short"))) {
      return { field: "password", message: "Please choose a stronger password." };
    }

    return null;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formValues = Object.fromEntries(new FormData(event.currentTarget));
    const values = { ...formValues, phone: `${findDialCode(phoneCountryCode)}${String(formValues.phone ?? "")}` };
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors(Object.fromEntries(Object.entries(flattened).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."])));
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    const { data, error: signupError } = await supabase.auth.signUp({
      email: parsed.data.email.toLowerCase(),
      password: parsed.data.password,
      options: {
        emailRedirectTo: window.location.origin + "/login",
        data: { full_name: parsed.data.fullName, phone: parsed.data.phone },
      },
    });
    setSubmitting(false);

    if (signupError || !data.user) {
      const mappedError = getSignupError(signupError);
      if (mappedError) {
        setFieldErrors({ [mappedError.field]: mappedError.message });
        return;
      }

      setError(
        signupError?.status && signupError.status >= 500
          ? "We couldn't create your account because the account service is temporarily unavailable. Please try again in a moment."
          : "We couldn't create your account. Please check the highlighted fields and try again.",
      );
      return;
    }
    if (data.session) await supabase.auth.signOut();
    setComplete(true);
  }

  if (complete) {
    return (
      <AuthShell>
        <div className="mx-auto max-w-md py-10 text-center">
          <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-accent" />
          <h1 className="mt-6 font-heading text-3xl font-bold text-foreground">Check your email</h1>
          <p className="mt-4 leading-7 text-muted-foreground">Confirm your email address, then return to sign in with your email or phone number.</p>
          <Button asChild className="mt-8"><Link to="/login">Return to sign in</Link></Button>
        </div>
      </AuthShell>
    );
  }

  const fields = [
    { id: "fullName", label: "Full Name", type: "text", autoComplete: "name", inputMode: undefined },
    { id: "email", label: "Email", type: "email", autoComplete: "email", inputMode: "email" as const },
  ];

  return (
    <AuthShell>
      <div className="mx-auto max-w-md">
        <p className="text-sm font-bold uppercase text-accent">Leader account</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Create your account</h1>
        <p className="mt-3 text-muted-foreground">Use your email, international phone number, and a strong password.</p>
        {error ? <Alert variant="destructive" className="mt-6"><AlertCircle aria-hidden="true" /><AlertDescription>{error}</AlertDescription></Alert> : null}
        <form className="mt-8 space-y-4" onSubmit={handleSubmit} noValidate>
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id}>{field.label}</Label>
              <Input id={field.id} name={field.id} type={field.type} autoComplete={field.autoComplete} inputMode={field.inputMode} className="h-11" aria-invalid={Boolean(fieldErrors[field.id])} aria-describedby={fieldErrors[field.id] ? `${field.id}-error` : undefined} onBlur={validateField} onChange={() => clearFieldError(field.id)} required />
              {fieldErrors[field.id] ? <p id={`${field.id}-error`} className="text-sm text-destructive">{fieldErrors[field.id]}</p> : null}
            </div>
          ))}
          <PhoneCountryField
            id="phone"
            value={phoneNumber}
            onChange={(value) => { setPhoneNumber(value); clearFieldError("phone"); }}
            countryCode={phoneCountryCode}
            onCountryCodeChange={setPhoneCountryCode}
            error={fieldErrors["phone"]}
          />
          <PasswordField id="password" label="Password" autoComplete="new-password" error={fieldErrors["password"]} onBlur={validateField} onChange={() => clearFieldError("password")} />
          <PasswordField id="confirmPassword" label="Confirm Password" autoComplete="new-password" error={fieldErrors["confirmPassword"]} onBlur={validateField} onChange={() => clearFieldError("confirmPassword")} />
          <Button type="submit" className="h-11 w-full" disabled={submitting}>
            {submitting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <><UserPlus aria-hidden="true" /> Create account</>}
          </Button>
        </form>
        <p className="mt-7 text-center text-sm text-muted-foreground">Already have an account? <Link to="/login" className="font-semibold text-accent underline-offset-4 hover:underline">Sign in</Link></p>
      </div>
    </AuthShell>
  );
}
