import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Download, Mail, Phone, RefreshCw, Search, Users, X } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Registration = Database["public"]["Tables"]["masterclass_registrations"]["Row"];

const EXPERIENCE_OPTIONS = ["0–2 years", "3–5 years", "6+ years"];
const ROADBLOCK_OPTIONS = ["Low salary", "Failing interviews", "Stuck in a service company"];

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function isToday(value: string) {
  const date = new Date(value);
  const now = new Date();
  return (
    date.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) ===
    now.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
  );
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(rows: Registration[]) {
  const headers = [
    "Full Name",
    "Email",
    "Phone",
    "Experience",
    "Roadblock",
    "Session",
    "Registered At",
  ];

  const body = rows.map((row) =>
    [
      row.full_name,
      row.email,
      row.phone,
      row.experience_range,
      row.roadblock,
      row.session_label,
      formatDate(row.created_at),
    ]
      .map(escapeCsv)
      .join(","),
  );

  const csv = [headers.map(escapeCsv).join(","), ...body].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `tlh-masterclass-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function MasterclassRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [experience, setExperience] = useState("all");
  const [roadblock, setRoadblock] = useState("all");
  const [selected, setSelected] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRegistrations = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("masterclass_registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);

    if (queryError) {
      setError("We could not load registrations. Please refresh and try again.");
      setRegistrations([]);
    } else {
      setRegistrations(data ?? []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadRegistrations();
  }, [loadRegistrations]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return registrations.filter((row) => {
      const matchesSearch =
        !term ||
        row.full_name.toLowerCase().includes(term) ||
        row.email.toLowerCase().includes(term) ||
        row.phone.toLowerCase().includes(term);

      const matchesExperience = experience === "all" || row.experience_range === experience;
      const matchesRoadblock = roadblock === "all" || row.roadblock === roadblock;

      return matchesSearch && matchesExperience && matchesRoadblock;
    });
  }, [experience, registrations, roadblock, search]);

  const todayCount = registrations.filter((row) => isToday(row.created_at)).length;
  const interviewCount = registrations.filter((row) => row.roadblock === "Failing interviews").length;
  const experiencedCount = registrations.filter((row) => row.experience_range === "6+ years").length;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border bg-card/80 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users aria-hidden="true" className="size-5" />
            </div>
            <div>
              <p className="font-heading text-sm font-bold">Tech Leader Hub</p>
              <p className="text-xs text-muted-foreground">Admin workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">Overview</Link>
            </Button>
            <Button variant="secondary" size="sm" asChild>
              <Link to="/admin/masterclass">Masterclass</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin/students">Leaders</Link>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void loadRegistrations()}
              disabled={loading}
            >
              <RefreshCw aria-hidden="true" className={loading ? "animate-spin" : ""} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-primary">Lead management</p>
            <h1 className="mt-2 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              Masterclass Registrations
            </h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              View and manage registrations for the Sunday 11:00 AM IST masterclass.
            </p>
          </div>

          <Button onClick={() => downloadCsv(filtered)} disabled={!filtered.length}>
            <Download aria-hidden="true" />
            Export CSV
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total registrations" value={registrations.length} />
          <StatCard label="Registered today" value={todayCount} />
          <StatCard label="6+ years experience" value={experiencedCount} />
          <StatCard label="Interview roadblock" value={interviewCount} />
        </div>

        <Card className="mt-8 border-border/80 bg-card/80">
          <CardContent className="p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_190px_220px]">
              <div className="relative">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email or phone..."
                  className="pl-9"
                />
              </div>

              <Select value={experience} onValueChange={setExperience}>
                <SelectTrigger aria-label="Filter by experience">
                  <SelectValue placeholder="Experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All experience</SelectItem>
                  {EXPERIENCE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={roadblock} onValueChange={setRoadblock}>
                <SelectTrigger aria-label="Filter by roadblock">
                  <SelectValue placeholder="Roadblock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roadblocks</SelectItem>
                  {ROADBLOCK_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
              <span>
                Showing <strong className="text-foreground">{filtered.length}</strong> of{" "}
                <strong className="text-foreground">{registrations.length}</strong> registrations
              </span>
              {(search || experience !== "all" || roadblock !== "all") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setExperience("all");
                    setRoadblock("all");
                  }}
                >
                  <X aria-hidden="true" />
                  Clear filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="mt-5 overflow-hidden border-border/80 bg-card/80">
          {error ? (
            <div className="p-8 text-center">
              <p className="font-medium text-destructive">{error}</p>
              <Button className="mt-4" variant="outline" onClick={() => void loadRegistrations()}>
                Try again
              </Button>
            </div>
          ) : loading ? (
            <div className="space-y-3 p-5">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-muted/50" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <Users aria-hidden="true" className="mx-auto size-8 text-muted-foreground" />
              <h2 className="mt-4 font-heading text-lg font-semibold">No registrations found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Try changing the search or filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Registrant</th>
                    <th className="px-5 py-3 font-semibold">Phone</th>
                    <th className="px-5 py-3 font-semibold">Experience</th>
                    <th className="px-5 py-3 font-semibold">Roadblock</th>
                    <th className="px-5 py-3 font-semibold">Registered</th>
                    <th className="px-5 py-3 text-right font-semibold">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((row) => (
                    <tr key={row.id} className="transition-colors hover:bg-muted/20">
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          className="text-left"
                          onClick={() => setSelected(row)}
                        >
                          <p className="font-semibold text-foreground hover:text-primary">{row.full_name}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">{row.email}</p>
                        </button>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{row.phone}</td>
                      <td className="px-5 py-4">
                        <Badge variant="outline">{row.experience_range}</Badge>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{row.roadblock}</td>
                      <td className="px-5 py-4 text-muted-foreground">{formatDate(row.created_at)}</td>
                      <td className="px-5 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-2xl">{selected.full_name}</DialogTitle>
                <DialogDescription>Masterclass registration details</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:grid-cols-2">
                <Detail label="Email">
                  <a className="break-all text-primary hover:underline" href={`mailto:${selected.email}`}>
                    {selected.email}
                  </a>
                </Detail>
                <Detail label="Phone">
                  <a className="text-primary hover:underline" href={`tel:${selected.phone}`}>
                    {selected.phone}
                  </a>
                </Detail>
                <Detail label="Experience">{selected.experience_range}</Detail>
                <Detail label="Primary roadblock">{selected.roadblock}</Detail>
                <Detail label="Session">{selected.session_label}</Detail>
                <Detail label="Registered at">{formatDate(selected.created_at)}</Detail>
              </div>

              <div className="flex flex-wrap gap-2 border-t border-border pt-4">
                <Button asChild variant="outline">
                  <a href={`mailto:${selected.email}`}>
                    <Mail aria-hidden="true" />
                    Email
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={`tel:${selected.phone}`}>
                    <Phone aria-hidden="true" />
                    Call
                  </a>
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card className="border-border/80 bg-card/80">
      <CardContent className="p-5">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-2 font-heading text-3xl font-bold tracking-tight">{value}</p>
      </CardContent>
    </Card>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-1.5 text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}
