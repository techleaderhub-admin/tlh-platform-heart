import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
      <div className="auth-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden border-r border-border bg-muted/30 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck aria-hidden="true" className="size-5" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold text-foreground">Tech Leader Hub</p>
              <p className="text-xs font-semibold uppercase text-accent">Career acceleration platform</p>
            </div>
          </div>
          <div>
            <div className="mb-6 h-1 w-14 rounded-full bg-accent" />
            <h1 className="font-heading text-4xl font-bold leading-tight text-foreground">
              Build your path to tech leadership.
            </h1>
            <p className="mt-5 max-w-sm leading-7 text-muted-foreground">
              Secure access to your personalized Tech Leader Hub workspace.
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Private member access</p>
        </section>
        <section className="p-6 sm:p-10 lg:p-12">
          <div className="mb-9 flex items-center gap-3 lg:hidden">
            <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck aria-hidden="true" className="size-4" />
            </span>
            <p className="font-heading font-bold text-foreground">Tech Leader Hub</p>
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
