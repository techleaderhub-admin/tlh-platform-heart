import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, KeyRound, LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { PhoneCountryField, findCountryByIso } from "@/components/auth/phone-country-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { destinationForRole } from "@/lib/auth-client";
import { signInWithIdentifier, getMyIdentity } from "@/lib/auth.functions";
import { loginSchema } from "@/lib/auth-validation";

export const Route = createFileRoute("/login")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Sign In | Tech Leader Hub" },
      { name: "description", content: "Sign in securely to your Tech Leader Hub account." },
      { property: "og:title", content: "Sign In | Tech Leader Hub" },
      { property: "og:description", content: "Sign in securely to your Tech Leader Hub account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [initializing, setInitializing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [phoneCountryCode, setPhoneCountryCode] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    let active = true;
    setInitializing(true);
    supabase.auth.getUser().then(async ({ data }) => {
      if (!active) return;
      if (data.user) {
        try {
          const identity = await getMyIdentity();
          await navigate({ to: destinationForRole(identity.role), replace: true });
          return;
        } catch {
          await supabase.auth.signOut();
        }
      }
      if (active) setInitializing(false);
    });
    return () => { active = false; };
  }, [navigate]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formValues = Object.fromEntries(new FormData(event.currentTarget));
    const identifier = loginMethod === "phone"
      ? `${findCountryByIso(phoneCountryCode).dialCode}${phoneNumber}`
      : String(formValues.identifier ?? "");
    const values = { ...formValues, identifier };
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setFieldErrors(Object.fromEntries(Object.entries(flattened).map(([key, messages]) => [key, messages?.[0] ?? "Invalid value."])));
      return;
    }

    setFieldErrors({});
    setSubmitting(true);
    try {
      const tokens = await signInWithIdentifier({ data: parsed.data });
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });
      if (sessionError) throw sessionError;
      const identity = await getMyIdentity();
      await navigate({ to: destinationForRole(identity.role), replace: true, reloadDocument: true });
    } catch {
      await supabase.auth.signOut();
      setError("Invalid email or phone number, or password.");
    } finally {
      setSubmitting(false);
    }
  }

  if (initializing) {
    return <main className="flex min-h-screen items-center justify-center bg-background" aria-label="Checking your session"><LoaderCircle className="size-7 animate-spin text-accent" /></main>;
  }

  return (
    <AuthShell>
      <div className="mx-auto max-w-md">
        <p className="text-sm font-bold uppercase text-accent">Member access</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Welcome back</h1>
        <p className="mt-3 text-muted-foreground">Sign in to continue to your workspace.</p>

        {error ? <Alert variant="destructive" className="mt-6"><AlertCircle aria-hidden="true" /><AlertDescription>{error}</AlertDescription></Alert> : null}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-3">
            <div className="grid grid-cols-2 rounded-lg border border-border bg-muted/40 p-1" role="tablist" aria-label="Sign in method">
              <button
                type="button"
                role="tab"
                aria-selected={loginMethod === "email"}
                className={loginMethod === "email" ? "rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm" : "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"}
                onClick={() => { setLoginMethod("email"); setFieldErrors({}); }}
              >
                Email
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={loginMethod === "phone"}
                className={loginMethod === "phone" ? "rounded-md bg-background px-3 py-2 text-sm font-semibold text-foreground shadow-sm" : "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"}
                onClick={() => { setLoginMethod("phone"); setFieldErrors({}); }}
              >
                Phone Number
              </button>
            </div>

            {loginMethod === "email" ? (
              <div className="space-y-2">
                <Label htmlFor="identifier">Email</Label>
                <Input id="identifier" name="identifier" type="email" autoComplete="username" inputMode="email" className="h-11" aria-invalid={Boolean(fieldErrors["identifier"])} aria-describedby={fieldErrors["identifier"] ? "identifier-error" : undefined} required />
                {fieldErrors["identifier"] ? <p id="identifier-error" className="text-sm text-destructive">{fieldErrors["identifier"]}</p> : null}
              </div>
            ) : (
              <PhoneCountryField
                id="identifier"
                label="Phone Number"
                value={phoneNumber}
                onChange={(value) => { setPhoneNumber(value); setFieldErrors((current) => { const next = { ...current }; delete next.identifier; return next; }); }}
                countryCode={phoneCountryCode}
                onCountryCodeChange={setPhoneCountryCode}
                error={fieldErrors["identifier"]}
                autoComplete="username"
              />
            )}
          </div>
          <PasswordField id="password" label="Password" autoComplete="current-password" error={fieldErrors["password"]} />
          <Button type="submit" className="h-11 w-full" disabled={submitting}>
            {submitting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <>Sign in <ArrowRight aria-hidden="true" /></>}
          </Button>
        </form>
        <div className="mt-5 flex items-center justify-between text-sm">
          <Link to="/forgot-password" className="inline-flex items-center gap-1.5 font-semibold text-accent underline-offset-4 hover:underline">
            <KeyRound aria-hidden="true" className="size-4" />
            Forgot password?
          </Link>
        </div>
        <p className="mt-7 text-center text-sm text-muted-foreground">New to Tech Leader Hub? <Link to="/signup" className="font-semibold text-accent underline-offset-4 hover:underline">Create an account</Link></p>
      </div>
    </AuthShell>
  );
}
