import type { ReactNode } from "react";
import { TLHLogo } from "@/components/brand/tlh-logo";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-5 py-10 sm:px-8">
      <div className="auth-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-lg border border-border bg-card shadow-2xl lg:grid-cols-[0.9fr_1.1fr]">
        <section className="hidden border-r border-border bg-muted/30 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <TLHLogo className="h-12 w-auto max-w-[210px] object-contain" />
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
            <TLHLogo className="h-10 w-auto max-w-[180px] object-contain" />
          </div>
          {children}
        </section>
      </div>
    </main>
  );
}
