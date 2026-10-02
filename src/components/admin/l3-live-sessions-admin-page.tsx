import { CalendarDays, Plus, ExternalLink, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
const db=supabase as any;
type Session={id:string;title:string;topic:string|null;session_date:string;session_link:string|null;membership:string;is_active:boolean};
type Attendance={id:string;session_id:string;student_id:string;attended:boolean;responded_at:string|null};
export function L3LiveSessionsAdminPage(){
 const [sessions,setSessions]=useState<Session[]>([]),[attendance,setAttendance]=useState<Attendance[]>([]),[form,setForm]=useState({title:"",topic:"",date:"",link:""}),[busy,setBusy]=useState(""),[error,setError]=useState<string|null>(null);
 useEffect(()=>{void load()},[]);
 async function load(){const [s,a]=await Promise.all([db.from("l3_live_sessions").select("*").order("session_date",{ascending:false}),db.from("l3_session_attendance").select("*").order("updated_at",{ascending:false})]);if(s.error||a.error){setError("Live session administration data could not be loaded.");return}setSessions(s.data??[]);setAttendance(a.data??[])}
 async function create(){setBusy("create");setError(null);const u=(await supabase.auth.getUser()).data.user;const r=await db.from("l3_live_sessions").insert({title:form.title.trim(),topic:form.topic.trim()||null,session_date:new Date(form.date).toISOString(),session_link:form.link.trim()||null,membership:"l3",is_active:false,created_by:u?.id??null}).select("*").single();if(r.error)setError(r.error.message);else{setForm({title:"",topic:"",date:"",link:""});await load()}setBusy("")}
 async function toggleAttendance(a:Attendance){setBusy(a.id);setError(null);const r=await db.from("l3_session_attendance").update({attended:!a.attended,responded_at:new Date().toISOString()}).eq("id",a.id);if(r.error)setError(r.error.message);else await load();setBusy("")}
 async function toggle(s:Session){setBusy(s.id);const r=await db.from("l3_live_sessions").update({is_active:!s.is_active}).eq("id",s.id);if(r.error)setError(r.error.message);else await load();setBusy("")}
 const stats=useMemo(()=>{const total=attendance.length;const attended=attendance.filter(a=>a.attended).length;const pending=attendance.filter(a=>a.responded_at===null).length;return {total,attended,pending,rate:total?Math.round((attended/total)*100):0}},[attendance]);
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
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <Input
            placeholder="Topic"
            value={form.topic}
            onChange={(e) => setForm({ ...form, topic: e.target.value })}
          />
          <Input
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
          <Input
            placeholder="Session link"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
          <Button
            className="md:col-span-2"
            disabled={!form.title.trim() || !form.date || busy === "create"}
            onClick={() => void create()}
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
          {sessions.map((s) => (
            <div key={s.id} className="rounded-xl border p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{s.title}</p>
                  {s.topic ? (
                    <p className="text-sm text-muted-foreground">{s.topic}</p>
                  ) : null}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(s.session_date).toLocaleString()} ·{" "}
                    {attendance.filter((a) => a.session_id === s.id).length} responses
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={s.is_active ? "secondary" : "default"}
                    disabled={busy === s.id}
                    onClick={() => void toggle(s)}
                  >
                    {s.is_active ? "Published" : "Publish"}
                  </Button>
                  {s.session_link ? (
                    <Button size="sm" variant="outline" asChild>
                      <a href={s.session_link} target="_blank" rel="noreferrer">
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
          {attendance.map((a) => (
            <div
              key={a.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4"
            >
              <div>
                <p className="font-semibold">
                  {sessions.find((s) => s.id === a.session_id)?.title ?? "Session"}
                </p>
                <p className="text-xs text-muted-foreground">Student: {a.student_id}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={a.attended ? "default" : "secondary"}>
                  {a.attended ? "Attended" : "Not Attended"}
                </Badge>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busy === a.id}
                  onClick={() => void toggleAttendance(a)}
                >
                  Mark {a.attended ? "not attended" : "attended"}
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
