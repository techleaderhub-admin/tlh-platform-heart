import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  LogOut,
  Map,
  MessageSquareText,
  UserRound,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { signOutAndReturnToLogin } from "@/lib/auth-client";
import { TLHLogo } from "@/components/brand/tlh-logo";

const COURSES_URL = "https://app.techleaderhub.com/web/courses";

type PublicMembership = "free" | "bronz" | "silver" | "gold" | "diamond";

const RANK: Record<PublicMembership, number> = {
  free: 0,
  bronz: 1,
  silver: 2,
  gold: 3,
  diamond: 4,
};

function publicMembershipFromLabel(label: string): PublicMembership {
  const value = label.toLowerCase();
  if (value.includes("diamond")) return "diamond";
  if (value.includes("gold")) return "gold";
  if (value.includes("silver")) return "silver";
  if (value.includes("bronz")) return "bronz";
  return "free";
}

function NavItem({
  href,
  label,
  icon,
  active,
  locked,
}: {
  href: string;
  label: string;
  icon: ReactNode;
  active: boolean;
  locked?: boolean;
}) {
  if (locked) {
    return (
      <Button variant="ghost" size="sm" disabled title={label + " requires a higher membership"}>
        <LockKeyhole className="size-4" />
        {label}
      </Button>
    );
  }

  if (href.startsWith("http")) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <a href={href} target="_blank" rel="noopener noreferrer">
          {icon}
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button variant={active ? "secondary" : "ghost"} size="sm" asChild>
      <Link to={href as never}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

export function StudentShell({
  children,
  title,
  subtitle,
  membershipLabel,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  membershipLabel: string;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const membership = publicMembershipFromLabel(membershipLabel);
  const rank = RANK[membership];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <TLHLogo className="hidden h-10 w-auto max-w-[180px] object-contain sm:block" />
            <TLHLogo variant="icon" className="size-10 object-contain sm:hidden" />
            <div className="hidden min-w-0 sm:block">
              <p className="font-heading text-sm font-bold">Tech Leader Hub</p>
              <p className="text-xs text-muted-foreground">Leader workspace</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <span className="hidden rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary sm:inline-flex">
              {membershipLabel}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                signOutAndReturnToLogin(queryClient, () =>
                  navigate({ to: "/login", replace: true }),
                )
              }
            >
              <LogOut />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <nav
          className="flex gap-1 overflow-x-auto border-b border-border py-2"
          aria-label="Leader navigation"
        >
          <NavItem
            href="/dashboard"
            label="Journey"
            icon={<LayoutDashboard />}
            active={location.pathname === "/dashboard"}
          />
          <NavItem
            href="/dashboard/profile"
            label="Profile"
            icon={<UserRound />}
            active={location.pathname === "/dashboard/profile"}
          />
          <NavItem
            href={COURSES_URL}
            label="Courses"
            icon={<BookOpen />}
            active={false}
            locked={rank < 1}
          />
          <NavItem
            href="/dashboard/foundation"
            label="Foundation"
            icon={<BookOpen />}
            active={location.pathname.startsWith("/dashboard/foundation")}
          />
          <NavItem
            href="/dashboard/l1-learning"
            label="Silver Learning"
            icon={<GraduationCap />}
            active={location.pathname.startsWith("/dashboard/l1-learning")}
            locked={rank < 2}
          />
          <NavItem
            href="/dashboard/assessment"
            label="Assessment"
            icon={<ClipboardCheck />}
            active={location.pathname.startsWith("/dashboard/assessment")}
            locked={false}
          />
          <NavItem
            href="/dashboard/l2-knowledge-check"
            label="Gold Check"
            icon={<CheckCircle2 />}
            active={location.pathname.startsWith("/dashboard/l2-knowledge-check")}
            locked={rank < 3}
          />
          <NavItem
            href="/dashboard/l3-course"
            label="Diamond Track"
            icon={<GraduationCap />}
            active={location.pathname.startsWith("/dashboard/l3-course")}
            locked={rank < 4}
          />
          <NavItem
            href="/dashboard/l3-live-sessions"
            label="Live Sessions"
            icon={<MessageSquareText />}
            active={location.pathname.startsWith("/dashboard/l3-live-sessions")}
            locked={rank < 4}
          />
          <NavItem
            href="/dashboard/career-os"
            label="Career OS"
            icon={<Map />}
            active={location.pathname.startsWith("/dashboard/career-os")}
            locked={rank < 2}
          />
          <NavItem
            href="/dashboard/jobs"
            label="Jobs"
            icon={<BriefcaseBusiness />}
            active={location.pathname.startsWith("/dashboard/jobs")}
          />
          <NavItem
            href="/dashboard/interview-questions"
            label="Interview Questions"
            icon={<MessageSquareText />}
            active={location.pathname.startsWith("/dashboard/interview-questions")}
          />
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Leader workspace</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
        </div>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}
