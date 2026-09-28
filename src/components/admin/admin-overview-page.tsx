import { useEffect, useState } from "react";
import { ArrowRight, GraduationCap, UserPlus, Video } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { AdminShell } from "@/components/admin/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export function AdminOverviewPage() {
  const [stats, setStats] = useState({ users: 0, students: 0, admins: 0, registrations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [users, roles, registrations] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("user_roles").select("role"),
        supabase.from("masterclass_registrations").select("id", { count: "exact", head: true }),
      ]);

      const roleRows = roles.data ?? [];
      setStats({
        users: users.count ?? 0,
        students: roleRows.filter((row) => row.role === "student").length,
        admins: roleRows.filter((row) => row.role === "admin").length,
        registrations: registrations.count ?? 0,
      });
      setLoading(false);
    };
    void load();
  }, []);

  const cards = [
    { label: "Total users", value: stats.users, icon: UserPlus },
    { label: "Students", value: stats.students, icon: GraduationCap },
    { label: "Admins", value: stats.admins, icon: UserPlus },
    { label: "Masterclass leads", value: stats.registrations, icon: Video },
  ];

  return (
    <AdminShell
      title="Admin Overview"
      subtitle="A single place to monitor your TLH platform activity and move into the next operational area."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-border/80 bg-card/80">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{label}</p>
                <Icon className="size-5 text-primary" aria-hidden="true" />
              </div>
              <p className="mt-3 font-heading text-3xl font-bold">{loading ? "—" : value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">Lead management</p>
            <h2 className="mt-2 font-heading text-xl font-bold">Masterclass registrations</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Search, filter, review and export the people who registered for the Sunday masterclass.
            </p>
            <Button asChild className="mt-5">
              <Link to="/admin/masterclass">
                Open registrations <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/80">
          <CardContent className="p-6">
            <p className="text-sm font-bold uppercase tracking-[0.14em] text-primary">User management</p>
            <h2 className="mt-2 font-heading text-xl font-bold">Students</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Review registered platform users and open their career workspace in future phases.
            </p>
            <Button asChild variant="outline" className="mt-5">
              <Link to="/admin/students">
                Manage students <ArrowRight />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
