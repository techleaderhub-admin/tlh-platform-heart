import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { BarChart3, BookOpen, LogOut, Users, Video, GraduationCap, MessageSquareText, BriefcaseBusiness, ClipboardList, ClipboardCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { signOutAndReturnToLogin } from "@/lib/auth-client";
import { TLHLogo } from "@/components/brand/tlh-logo";

const items = [
  { to: "/admin", label: "Overview", icon: BarChart3 },
  { to: "/admin/masterclass", label: "Masterclass", icon: Video },
  { to: "/admin/students", label: "Students", icon: Users },
  { to: "/admin/foundation", label: "Foundation", icon: BookOpen },
  { to: "/admin/l1-learning", label: "L1 Learning", icon: GraduationCap },
  { to: "/admin/interview-questions", label: "Interview Bank", icon: MessageSquareText },
  { to: "/admin/jobs", label: "Jobs", icon: BriefcaseBusiness },
  { to: "/admin/applications", label: "Applications", icon: ClipboardList },
  { to: "/admin/assessments", label: "Assessments", icon: ClipboardCheck },
] as const;

export function AdminShell({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <TLHLogo className="hidden h-10 w-auto max-w-[180px] object-contain sm:block" />
            <TLHLogo variant="icon" className="size-10 object-contain sm:hidden" />
            <div className="hidden sm:block">
              <p className="font-heading text-sm font-bold">Tech Leader Hub</p>
              <p className="text-xs text-muted-foreground">Admin workspace</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              signOutAndReturnToLogin(queryClient, () => navigate({ to: "/login", replace: true }))
            }
          >
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <nav className="flex gap-1 overflow-x-auto border-b border-border py-2" aria-label="Admin navigation">
          {items.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || (to !== "/admin" && location.pathname.startsWith(to));
            return (
              <Button key={to} variant={active ? "secondary" : "ghost"} size="sm" asChild>
                <Link to={to}>
                  <Icon aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Admin workspace</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        </div>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
