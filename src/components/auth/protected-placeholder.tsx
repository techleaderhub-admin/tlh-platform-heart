import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { signOutAndReturnToLogin } from "@/lib/auth-client";

export function ProtectedPlaceholder({ area, name }: { area: "Student Dashboard" | "Admin Dashboard"; name: string | null }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck aria-hidden="true" className="size-4" />
            </span>
            <span className="font-heading font-bold text-foreground">Tech Leader Hub</span>
          </div>
          <Button variant="outline" onClick={() => signOutAndReturnToLogin(queryClient, () => navigate({ to: "/login", replace: true }))}>
            <LogOut aria-hidden="true" /> Sign out
          </Button>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-24">
        <p className="text-sm font-bold uppercase text-accent">Secure workspace</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-foreground sm:text-5xl">{area}</h1>
        <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
          Welcome{name ? `, ${name}` : ""}. Your account and role routing are working correctly.
        </p>
        <div className="mt-10 border-l-2 border-primary bg-muted/30 px-5 py-4 text-sm text-muted-foreground">
          This is a protected placeholder. Dashboard features will be added in a future step.
        </div>
      </section>
    </main>
  );
}
