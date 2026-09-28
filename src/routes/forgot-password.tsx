import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, LoaderCircle } from "lucide-react";

import { AuthShell } from "@/components/auth/auth-shell";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requestPasswordReset } from "@/lib/auth.functions";

export const Route = createFileRoute("/forgot-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Forgot Password | Tech Leader Hub" },
      { name: "description", content: "Reset your Tech Leader Hub password securely." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!identifier.trim()) {
      setError("Enter your email address or phone number.");
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset({ data: { identifier } });
      setSubmitted(true);
    } catch {
      setError("We couldn't process the request right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <AuthShell>
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <CheckCircle2 aria-hidden="true" className="size-6" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase text-accent">Check your inbox</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Password reset link sent</h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            If an account matches the details you entered, you’ll receive a password reset email shortly.
            Check your spam or promotions folder too.
          </p>
          <Button className="mt-7 h-11 w-full" onClick={() => navigate({ to: "/login" })}>
            Back to sign in <ArrowRight aria-hidden="true" />
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
            <KeyRound aria-hidden="true" className="size-5" />
          </div>
          <p className="mt-6 text-sm font-bold uppercase text-accent">Account recovery</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-foreground">Forgot your password?</h1>
          <p className="mt-3 leading-7 text-muted-foreground">
            Enter the email or phone number linked to your account. We’ll send a secure password reset link to your email.
          </p>
        </div>

        {error ? (
          <Alert variant="destructive" className="mt-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
          <div className="space-y-2">
            <Label htmlFor="identifier">Email or Phone Number</Label>
            <Input
              id="identifier"
              name="identifier"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              autoComplete="username"
              className="h-11"
              placeholder="you@example.com or +91..."
              required
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={submitting}>
            {submitting ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : <>Send reset link <ArrowRight aria-hidden="true" /></>}
          </Button>
        </form>
      </div>
    </AuthShell>
  );
}
