import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertCircle, ArrowLeft, CheckCircle2, LoaderCircle, LockKeyhole } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordField } from "@/components/auth/password-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/update-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Set New Password | Tech Leader Hub" },
      { name: "description", content: "Set a new password for your Tech Leader Hub account." },
    ],
  }),
  component: UpdatePasswordPage,
});

function UpdatePasswordPage() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ready, setReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let active = true;
    let timeoutId: number | undefined;
    let listener: { subscription: { unsubscribe: () => void } } | undefined;

    async function prepare() {
      const { data } = await supabase.auth.getSession();
      if (!active) return;

      if (data.session) {
        setReady(true);
        setChecking(false);
        return;
      }

      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if (!active) return;
        if (event === "PASSWORD_RECOVERY" && session) {
          setReady(true);
          setChecking(false);
          if (timeoutId) window.clearTimeout(timeoutId);
          listener?.subscription.unsubscribe();
        }
      });
      listener = authListener;

      timeoutId = window.setTimeout(() => {
        if (!active) return;
        setChecking(false);
        setError("This password reset link is invalid or has expired. Please request a new one.");
        listener?.subscription.unsubscribe();
      }, 10000);
    }

    prepare();
    return () => {
      active = false;
      if (timeoutId) window.clearTimeout(timeoutId);
      listener?.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setFieldErrors({});

    const values = Object.fromEntries(new FormData(event.currentTarget));
    const password = String(values.password ?? "");
    const confirmPassword = String(values.confirmPassword ?? "");

    const nextErrors: Record<string, string> = {};
    if (password.length < 10) nextErrors.password = "Password must be at least 10 characters.";
    else if (!/[A-Z]/.test(password)) nextErrors.password = "Password must include an uppercase letter.";
    else if (!/[a-z]/.test(password)) nextErrors.password = "Password must include a lowercase letter.";
    else if (!/[0-9]/.test(password)) nextErrors.password = "Password must include a number.";
    if (password !== confirmPassword) nextErrors.confirmPassword = "Passwords do not match.";

    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setSuccess(true);
      await supabase.auth.signOut();
    } catch {
      setError("We couldn't update your password. Please request a new reset link.");
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center bg-background" aria-label="Checking password reset link"><LoaderCircle className="size-7 animate-spin text-accent" /></main>;
  }

  if (success) {
    return (
      <AuthShell>
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase text-accent">Password updated</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">You’re all set.</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Your password has been changed successfully. Sign in with your new password.</p>
          <Button className="mt-7 h-11 w-full" onClick={() => navigate({ to: "/login" })}>
            Go to sign in
          </Button>
        </div>
      </AuthShell>
    );
  }

  if (!ready) {
    return (
      <AuthShell>
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertCircle aria-hidden="true" className="size-6" />
          </div>
          <h1 className="mt-6 font-heading text-3xl font-bold text-foreground">Reset link unavailable</h1>
          <p className="mt-3 leading-7 text-muted-foreground">{error}</p>
          <Button className="mt-7 h-11 w-full" onClick={() => navigate({ to: "/forgot-password" })}>
            Request a new link
          </Button>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="mx-auto max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to sign in
        </Link>
        <div className="mt-8">
          <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LockKeyhole aria-hidden="true" className="size-5" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase text-accent">Account recovery</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Set a new password</h1>
          <p className="mt-3 leading-7 text-muted-foreground">Choose a strong password with at least 10 characters, including uppercase, lowercase, and a number.</p>
        </div>

        {error ? (
          <Alert variant="destructive" className="mt-6">
            <AlertCircle aria-hidden="true" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <PasswordField id="password" label="New Password" autoComplete="new-password" error={fieldErrors.password} />
          <PasswordField id="confirmPassword" name="confirmPassword" label="Confirm New Password" autoComplete="new-password" error={fieldErrors.confirmPassword} />
          <Button type="submit" className="h-11 w-full" disabled={submitting}>
            {submitting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <>Update password</>}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
