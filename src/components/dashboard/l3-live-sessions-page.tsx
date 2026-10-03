import { CalendarDays, CheckCircle2, ExternalLink, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

type Session = {
  id: string;
  title: string;
  topic: string | null;
  session_date: string;
  session_link: string | null;
  membership: string;
};

type Attendance = {
  session_id: string;
  attended: boolean;
};

export function L3LiveSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setError("Please sign in again.");
      setLoading(false);
      return;
    }

    const [sessionsResult, attendanceResult] = await Promise.all([
      db
        .from("l3_live_sessions")
        .select("*")
        .eq("is_active", true)
        .order("session_date", { ascending: true }),
      db
        .from("l3_session_attendance")
        .select("session_id,attended")
        .eq("student_id", user.id),
    ]);

    if (sessionsResult.error || attendanceResult.error) {
      setError("Live sessions could not be loaded.");
    }

    setSessions(sessionsResult.data ?? []);
    setAttendance(
      Object.fromEntries(
        (attendanceResult.data ?? []).map((item: Attendance) => [
          item.session_id,
          item.attended,
        ]),
      ),
    );
    setLoading(false);
  }

  const summary = useMemo(() => {
    const total = sessions.length;
    const attended = sessions.filter((session) => attendance[session.id] === true).length;
    const responded = sessions.filter(
      (session) => attendance[session.id] !== undefined,
    ).length;

    return {
      total,
      attended,
      responded,
      pct: total ? Math.round((attended / total) * 100) : 0,
    };
  }, [sessions, attendance]);

  async function answer(session: Session, attended: boolean) {
    setBusy(session.id);

    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      setBusy(null);
      setError("Please sign in again.");
      return;
    }

    const result = await db
      .from("l3_session_attendance")
      .upsert(
        {
          session_id: session.id,
          student_id: user.id,
          attended,
          responded_at: new Date().toISOString(),
        },
        { onConflict: "session_id,student_id" },
      )
      .select("session_id,attended")
      .single();

    if (result.error) {
      setError("Your attendance response could not be saved.");
    } else {
      setAttendance((previous) => ({
        ...previous,
        [session.id]: result.data.attended,
      }));
    }

    setBusy(null);
  }

  return (
    <StudentShell
      title="Weekly Live Sessions"
      subtitle="Your scheduled L3 live sessions and attendance responses."
      membershipLabel="Diamond Membership"
    >
      <div className="space-y-4">
        {error ? (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
          </Card>
        ) : null}

        {loading ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Loading live sessions…
            </CardContent>
          </Card>
        ) : !sessions.length ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Video className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 font-semibold">No live sessions published yet.</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Your admin will publish the next L3 session here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance progress</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-bold">
                    {summary.attended}/{summary.total}
                  </p>
                  <p className="text-sm text-muted-foreground">Sessions attended</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{summary.pct}%</p>
                  <p className="text-sm text-muted-foreground">Attendance rate</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {summary.responded}/{summary.total}
                  </p>
                  <p className="text-sm text-muted-foreground">Responses recorded</p>
                </div>
              </CardContent>
            </Card>

            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <Badge variant="outline">L3 Live Session</Badge>
                      <CardTitle className="mt-2">{session.title}</CardTitle>
                      {session.topic ? (
                        <p className="mt-1 text-sm text-muted-foreground">{session.topic}</p>
                      ) : null}
                    </div>
                    <Badge
                      variant={
                        attendance[session.id] === true
                          ? "default"
                          : attendance[session.id] === false
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {attendance[session.id] === true
                        ? "Attended"
                        : attendance[session.id] === false
                          ? "Not attended"
                          : "Attendance pending"}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <CalendarDays className="size-4" />
                    {new Date(session.session_date).toLocaleString()}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {session.session_link ? (
                      <Button asChild>
                        <a
                          href={session.session_link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Join session <ExternalLink />
                        </a>
                      </Button>
                    ) : null}

                    <Button
                      variant={attendance[session.id] === true ? "secondary" : "outline"}
                      disabled={busy === session.id}
                      onClick={() => void answer(session, true)}
                    >
                      <CheckCircle2 />
                      Yes, I attended
                    </Button>

                    <Button
                      variant={attendance[session.id] === false ? "secondary" : "outline"}
                      disabled={busy === session.id}
                      onClick={() => void answer(session, false)}
                    >
                      No, I didn't attend
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </StudentShell>
  );
}
