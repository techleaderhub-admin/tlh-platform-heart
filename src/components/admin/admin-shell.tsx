import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  BarChart3,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FileText,
  GraduationCap,
  Layers,
  LayoutDashboard,
  LogOut,
  Map,
  MessageSquareText,
  Target,
  Trophy,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { signOutAndReturnToLogin } from "@/lib/auth-client";
import { TLHLogo } from "@/components/brand/tlh-logo";

type NavItem = { to: string; label: string; icon: LucideIcon };
type NavGroup = { label: string; items: NavItem[] };

/**
 * Admin navigation grouped by operating area (see the TLH master plan):
 * people, acquisition, career, learning, interview, opportunity, growth and business.
 */
const NAV_GROUPS: NavGroup[] = [
  { label: "", items: [{ to: "/admin", label: "Overview", icon: BarChart3 }] },
  {
    label: "People",
    items: [
      { to: "/admin/students", label: "Leaders", icon: Users },
      { to: "/admin/admin-360", label: "Admin 360", icon: LayoutDashboard },
    ],
  },
  {
    label: "Acquisition",
    items: [{ to: "/admin/masterclass", label: "Masterclass", icon: Video }],
  },
  {
    label: "Career",
    items: [
      { to: "/admin/assessments", label: "Assessments & gaps", icon: Target },
      { to: "/admin/assessment-admin", label: "Assessment Admin", icon: ClipboardCheck },
      { to: "/admin/career-os", label: "Career OS", icon: Map },
    ],
  },
  {
    label: "Learning",
    items: [
      { to: "/admin/foundation", label: "Foundation", icon: BookOpen },
      { to: "/admin/learning-programs", label: "Learning & Programs", icon: Layers },
      { to: "/admin/l1-learning", label: "L1 Learning", icon: GraduationCap },
      { to: "/admin/l3-course", label: "L3 Career Track", icon: Trophy },
      { to: "/admin/l3-live-sessions", label: "Live Sessions", icon: CalendarDays },
    ],
  },
  {
    label: "Interview",
    items: [{ to: "/admin/interview-questions", label: "Interview Bank", icon: MessageSquareText }],
  },
  {
    label: "Opportunity",
    items: [
      { to: "/admin/jobs", label: "Jobs", icon: BriefcaseBusiness },
      { to: "/admin/applications", label: "Applications", icon: ClipboardList },
    ],
  },
  { label: "Growth", items: [{ to: "/admin/blog", label: "Blog & SEO", icon: FileText }] },
  { label: "Business", items: [{ to: "/admin/payments", label: "Payments", icon: CreditCard }] },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((group) => group.items);

function isActive(pathname: string, to: string) {
  if (to === "/admin") return pathname === "/admin" || pathname === "/admin/";
  return pathname === to || pathname.startsWith(to + "/");
}

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.label || "home"}>
          {group.label ? (
            <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground/80">
              {group.label}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map(({ to, label, icon: Icon }) => {
              const active = isActive(pathname, to);
              return (
                <li key={to}>
                  <Link
                    to={to}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={
                      "flex min-h-10 items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition-colors " +
                      (active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground")
                    }
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

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
  const [menuOpen, setMenuOpen] = useState(false);
  const current = ALL_ITEMS.find((item) => isActive(location.pathname, item.to));

  // Close the mobile menu whenever the route changes.
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1400px] items-center justify-between gap-4 px-5 sm:px-8">
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
            <LogOut />
            Sign out
          </Button>
        </div>

        {/* Mobile and tablet: grouped menu that folds away */}
        <div className="border-t border-border px-5 py-2 sm:px-8 lg:hidden">
          <button
            type="button"
            className="flex min-h-10 w-full items-center justify-between rounded-lg border border-border px-3 text-sm font-medium"
            aria-expanded={menuOpen}
            aria-controls="admin-mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="flex items-center gap-2">
              {current ? <current.icon className="size-4 text-primary" aria-hidden="true" /> : null}
              {current?.label ?? "Admin menu"}
            </span>
            <ChevronDown
              className={"size-4 transition-transform " + (menuOpen ? "rotate-180" : "")}
              aria-hidden="true"
            />
          </button>
          {menuOpen ? (
            <nav
              id="admin-mobile-nav"
              aria-label="Admin navigation"
              className="max-h-[70vh] overflow-y-auto py-3"
            >
              <NavLinks pathname={location.pathname} onNavigate={() => setMenuOpen(false)} />
            </nav>
          ) : null}
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-8 px-5 sm:px-8">
        {/* Desktop: grouped sidebar */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav
            aria-label="Admin navigation"
            className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto py-8 pr-2"
          >
            <NavLinks pathname={location.pathname} />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 py-8 sm:py-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">
              Admin workspace
            </p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">{subtitle}</p>
          </div>
          <div className="mt-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
