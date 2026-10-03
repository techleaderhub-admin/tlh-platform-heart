import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ReactNode } from "react";
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

type NavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  locked?: boolean;
};

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

  const items: NavItem[] = [
    { href: "/dashboard", label: "Journey", icon: <LayoutDashboard /> },
    { href: "/dashboard/profile", label: "Profile", icon: <UserRound /> },
    { href: COURSES_URL, label: "Courses", icon: <BookOpen />, locked: rank < 1 },
    { href: "/dashboard/jobs", label: "Jobs", icon: <BriefcaseBusiness /> },
    {
      href: "/dashboard/interview-questions",
      label: "Interview Questions",
      icon: <MessageSquareText />,
    },
    { href: "/dashboard/foundation", label: "Foundation", icon: <BookOpen /> },
    { href: "/dashboard/assessment", label: "Assessment", icon: <ClipboardCheck /> },
    { href: "/dashboard/career-os", label: "Career OS", icon: <Map />, locked: rank < 2 },
    {
      href: "/dashboard/l1-learning",
      label: "Silver Learning",
      icon: <GraduationCap />,
      locked: rank < 2,
    },
    {
      href: "/dashboard/l2-knowledge-check",
      label: "Gold Check",
      icon: <CheckCircle2 />,
      locked: rank < 3,
    },
    {
      href: "/dashboard/l3-course",
      label: "Diamond Track",
      icon: <GraduationCap />,
      locked: rank < 4,
    },
    {
      href: "/dashboard/l3-live-sessions",
      label: "Live Sessions",
      icon: <MessageSquareText />,
      locked: rank < 4,
    },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? location.pathname === href : location.pathname.startsWith(href);

  const navRef = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState({ left: 0, width: 0, opacity: 0 });

  // Slide a highlight pill under the active nav link; scroll it into view on mobile.
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const active = nav.querySelector<HTMLElement>('[data-active="true"]');
      if (!active) {
        setIndicator((current) => ({ ...current, opacity: 0 }));
        return;
      }
      setIndicator({ left: active.offsetLeft, width: active.offsetWidth, opacity: 1 });
      active.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [location.pathname]);

  return (
    <div className="tlh-dash min-h-screen">
      <header className="dash-header">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <TLHLogo className="hidden h-9 w-auto max-w-[170px] object-contain sm:block" />
            <TLHLogo variant="icon" className="size-9 object-contain sm:hidden" />
            <div className="hidden min-w-0 sm:block">
              <p className="font-heading text-sm font-bold text-white">Tech Leader Hub</p>
              <p className="text-xs text-[var(--dash-faint)]">Leader workspace</p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5">
            <span className={`dash-tier dash-tier-${membershipLevelKey(membership)}`}>
              {membershipLabel}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="border-white/15 bg-transparent text-white hover:bg-white/10"
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
          className="dash-nav-scroll border-b border-[var(--dash-line)]"
          aria-label="Leader navigation"
        >
          <div ref={navRef} className="dash-nav">
            <span
              className="dash-nav-indicator"
              aria-hidden="true"
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: indicator.width,
                opacity: indicator.opacity,
              }}
            />
            {items.map((item) => {
              const active = !item.locked && isActive(item.href);
              const external = item.href.startsWith("http");

              if (item.locked) {
                return (
                  <span
                    key={item.href}
                    className="dash-nav-link is-locked"
                    title={`${item.label} requires a higher membership`}
                  >
                    <LockKeyhole className="size-4" aria-hidden="true" />
                    {item.label}
                  </span>
                );
              }

              return external ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-active={active}
                  className="dash-nav-link"
                >
                  {item.icon}
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  to={item.href as never}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className={"dash-nav-link" + (active ? " is-active" : "")}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div>
          <p className="dash-eyebrow">Leader workspace</p>
          <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-2xl text-[var(--dash-faint)]">{subtitle}</p>
        </div>
        <div className="mt-8">{children}</div>
      </main>
    </div>
  );
}

function membershipLevelKey(membership: PublicMembership): string {
  return { free: "free", bronz: "l0", silver: "l1", gold: "l2", diamond: "l3" }[membership];
}
