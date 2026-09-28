import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowRight, LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
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
    const values = Object.fromEntries(new FormData(event.currentTarget));
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
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Phone Number</Label>
            <Input id="identifier" name="identifier" autoComplete="username" inputMode="email" className="h-11" aria-invalid={Boolean(fieldErrors["identifier"])} aria-describedby={fieldErrors["identifier"] ? "identifier-error" : undefined} required />
            {fieldErrors["identifier"] ? <p id="identifier-error" className="text-sm text-destructive">{fieldErrors["identifier"]}</p> : null}
          </div>
          <PasswordField id="password" label="Password" autoComplete="current-password" error={fieldErrors["password"]} />
          <Button type="submit" className="h-11 w-full" disabled={submitting}>
            {submitting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <>Sign in <ArrowRight aria-hidden="true" /></>}
          </Button>
        </form>
        <p className="mt-7 text-center text-sm text-muted-foreground">New to Tech Leader Hub? <Link to="/signup" className="font-semibold text-accent underline-offset-4 hover:underline">Create an account</Link></p>
      </div>
    </AuthShell>
  );
}
