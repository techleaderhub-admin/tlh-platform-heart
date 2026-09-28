import { useEffect, useMemo, useState } from "react";
import { Mail, Phone, RefreshCw, Search, Users } from "lucide-react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function StudentsPage() {
  const [students, setStudents] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);

    const [{ data: profiles, error: profileError }, { data: roles, error: roleError }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("user_roles").select("user_id, role"),
    ]);

    if (profileError || roleError) {
      setError("We could not load students. Please refresh and try again.");
      setStudents([]);
    } else {
      const adminIds = new Set((roles ?? []).filter((row) => row.role === "admin").map((row) => row.user_id));
      setStudents((profiles ?? []).filter((profile) => !adminIds.has(profile.id)));
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.full_name ?? "", student.phone ?? ""].some((value) => value.toLowerCase().includes(term)),
    );
  }, [search, students]);

  return (
    <AdminShell
      title="Students"
      subtitle="Review registered TLH platform users. Career profiles, assessments and coaching workflows will be connected here next."
    >
      <Card className="border-border/80 bg-card/80">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or phone..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={() => void load()} disabled={loading}>
              <RefreshCw className={loading ? "animate-spin" : ""} aria-hidden="true" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-5 overflow-hidden border-border/80 bg-card/80">
        {error ? (
          <div className="p-8 text-center">
            <p className="font-medium text-destructive">{error}</p>
            <Button className="mt-4" variant="outline" onClick={() => void load()}>Try again</Button>
          </div>
        ) : loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-muted/50" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <h2 className="mt-4 font-heading text-lg font-semibold">No students found</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {search ? "Try a different search." : "Students will appear here after they create a TLH account."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-border bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Student</th>
                  <th className="px-5 py-3 font-semibold">Phone</th>
                  <th className="px-5 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 font-semibold">Role</th>
                  <th className="px-5 py-3 text-right font-semibold">Contact</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((student) => (
                  <tr key={student.id} className="hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <p className="font-semibold">{student.full_name || "Unnamed student"}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">User ID: {student.id.slice(0, 8)}…</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{student.phone || "—"}</td>
                    <td className="px-5 py-4 text-muted-foreground">
                      {new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(new Date(student.created_at))}
                    </td>
                    <td className="px-5 py-4"><Badge variant="outline">Student</Badge></td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {student.phone && <Button asChild variant="ghost" size="sm"><a href={`tel:${student.phone}`}><Phone /></a></Button>}
                        <Button variant="ghost" size="sm" disabled title="Email is stored in Supabase Auth and is not exposed to the profiles table."><Mail /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminShell>
  );
}
