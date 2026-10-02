import { CalendarDays, Plus, ExternalLink, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

type Session = {
  id: string;
  title: string;
  topic: string | null;
  session_date: string;
  session_link: string | null;
  membership: string;
  is_active: boolean;
};

type Attendance = {
  id: string;
  session_id: string;
  student_id: string;
  attended: boolean;
  responded_at: string | null;
};

export function L3LiveSessionsAdminPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [form, setForm] = useState({
    title: "",
    topic: "",
    date: "",
    link: "",
  });
  const [busy, setBusy] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    const [sessionsResult, attendanceResult] = await Promise.all([
      db
        .from("l3_live_sessions")
        .select("*")
        .order("session_date", { ascending: false }),
      db
        .from("l3_session_attendance")
        .select("*")
        .order("updated_at", { ascending: false }),
    ]);

    if (sessionsResult.error || attendanceResult.error) {
      setError("Live session administration data could not be loaded.");
      return;
    }

    setSessions(sessionsResult.data ?? []);
    setAttendance(attendanceResult.data ?? []);
  }

  async function createSession() {
    if (!form.title.trim() || !form.date) {
      setError("Session title and date are required.");
      return;
    }

    setBusy("create");
    setError(null);

    const user = (await supabase.auth.getUser()).data.user;
    const result = await db
      .from("l3_live_sessions")
      .insert({
        title: form.title.trim(),
        topic: form.topic.trim() || null,
        session_date: new Date(form.date).toISOString(),
        session_link: form.link.trim() || null,
        membership: "l3",
        is_active: false,
        created_by: user?.id ?? null,
      })
      .select("*")
      .single();

    if (result.error) {
      setError(result.error.message);
    } else {
      setForm({ title: "", topic: "", date: "", link: "" });
      await load();
    }

    setBusy("");
  }

  async function toggleAttendance(item: Attendance) {
    setBusy(item.id);
    setError(null);

    const result = await db
      .from("l3_session_attendance")
      .update({
        attended: !item.attended,
        responded_at: new Date().toISOString(),
      })
      .eq("id", item.id);

    if (result.error) {
      setError(result.error.message);
    } else {
      await load();
    }

    setBusy("");
  }

  async function togglePublished(session: Session) {
    setBusy(session.id);
    setError(null);

    const result = await db
      .from("l3_live_sessions")
      .update({ is_active: !session.is_active })
      .eq("id", session.id);

    if (result.error) {
      setError(result.error.message);
    } else {
      await load();
    }

    setBusy("");
  }

  const stats = useMemo(() => {
    const total = attendance.length;
    const attended = attendance.filter((item) => item.attended).length;
    const pending = attendance.filter((item) => item.responded_at === null).length;

    return {
      total,
      attended,
      pending,
      rate: total ? Math.round((attended / total) * 100) : 0,
    };
  }, [attendance]);

  return (
    <AdminShell
      title="Weekly Live Sessions"
      subtitle="Create, publish and track L3 weekly live sessions and attendance."
    >
      <div className="space-y-6">
        {error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Attendance overview</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-4">
            <div>
              <p className="text-2xl font-bold">{stats.attended}</p>
              <p className="text-sm text-muted-foreground">Attended responses</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-sm text-muted-foreground">Total responses</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.rate}%</p>
              <p className="text-sm text-muted-foreground">Attendance rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.pending}</p>
              <p className="text-sm text-muted-foreground">Unresponded</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create session</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Session title"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
            />
            <Input
              placeholder="Topic"
              value={form.topic}
              onChange={(event) => setForm({ ...form, topic: event.target.value })}
            />
            <Input
              type="datetime-local"
              value={form.date}
              onChange={(event) => setForm({ ...form, date: event.target.value })}
            />
            <Input
              placeholder="Session link"
              value={form.link}
              onChange={(event) => setForm({ ...form, link: event.target.value })}
            />
            <Button
              className="md:col-span-2"
              disabled={!form.title.trim() || !form.date || busy === "create"}
              onClick={() => void createSession()}
            >
              <Plus />
              Create session
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Published & scheduled sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{session.title}</p>
                    {session.topic ? (
                      <p className="text-sm text-muted-foreground">{session.topic}</p>
                    ) : null}
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(session.session_date).toLocaleString()} ·{" "}
                      {attendance.filter((item) => item.session_id === session.id).length} responses
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={session.is_active ? "secondary" : "default"}
                      disabled={busy === session.id}
                      onClick={() => void togglePublished(session)}
                    >
                      {session.is_active ? "Published" : "Publish"}
                    </Button>

                    {session.session_link ? (
                      <Button size="sm" variant="outline" asChild>
                        <a href={session.session_link} target="_blank" rel="noreferrer">
                          Open link <ExternalLink />
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}

            {!sessions.length ? (
              <p className="text-sm text-muted-foreground">No sessions created yet.</p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance responses</CardTitle>
            <p className="text-sm text-muted-foreground">
              Admin can review and correct each Student → Session → Attended / Not Attended response.
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {attendance.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
              >
                <div>
                  <p className="font-semibold">
                    {sessions.find((session) => session.id === item.session_id)?.title ?? "Session"}
                  </p>
                  <p className="text-xs text-muted-foreground">Student: {item.student_id}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={item.attended ? "default" : "secondary"}>
                    {item.attended ? "Attended" : "Not Attended"}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={busy === item.id}
                    onClick={() => void toggleAttendance(item)}
                  >
                    Mark {item.attended ? "not attended" : "attended"}
                  </Button>
                </div>
              </div>
            ))}

            {!attendance.length ? (
              <p className="text-sm text-muted-foreground">No attendance responses yet.</p>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
