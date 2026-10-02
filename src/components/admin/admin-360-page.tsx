import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, BriefcaseBusiness, ClipboardCheck, Map, MessageSquareText, RefreshCw, Search, Target, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile=Database["public"]["Tables"]["profiles"]["Row"];
type Membership=Database["public"]["Tables"]["student_memberships"]["Row"];
type CareerProfile=Database["public"]["Tables"]["career_profiles"]["Row"];
type SkillGap=Database["public"]["Tables"]["career_skill_gaps"]["Row"];
type Roadmap=Database["public"]["Tables"]["career_roadmaps"]["Row"];
type RoadmapItem=Database["public"]["Tables"]["roadmap_items"]["Row"];
type Application=Database["public"]["Tables"]["job_applications"]["Row"];
type Interview=Database["public"]["Tables"]["interviews"]["Row"];
type Assessment=Database["public"]["Tables"]["l1_assessment_attempts"]["Row"];
type Submission=Database["public"]["Tables"]["l1_assignment_submissions"]["Row"];
type Payment=Database["public"]["Tables"]["payments"]["Row"];

const levels=["free","l0","l1","l2","l3","l4"] as const;
const levelLabel=(x:string)=>x==="free"?"Free":x.toUpperCase();
const statusLabel=(x:string)=>x.replaceAll("_"," ");

export function Admin360Page(){
 const [students,setStudents]=useState<Profile[]>([]);
 const [memberships,setMemberships]=useState<Record<string,Membership>>({});
 const [search,setSearch]=useState("");
 const [level,setLevel]=useState("all");
 const [selectedId,setSelectedId]=useState("");
 const [detail,setDetail]=useState<any>(null);
 const [loading,setLoading]=useState(true);
 const [detailLoading,setDetailLoading]=useState(false);
 const [error,setError]=useState<string|null>(null);

 const loadStudents=async()=>{
  setLoading(true);setError(null);
  const [profiles,roles,membershipRows]=await Promise.all([
   supabase.from("profiles").select("*").order("created_at",{ascending:false}).limit(500),
   supabase.from("user_roles").select("user_id,role"),
   supabase.from("student_memberships").select("*"),
  ]);
  if(profiles.error||roles.error||membershipRows.error){setError("Could not load the student directory.");setLoading(false);return;}
  const adminIds=new Set((roles.data??[]).filter(r=>r.role==="admin").map(r=>r.user_id));
  setStudents((profiles.data??[]).filter(p=>!adminIds.has(p.id)));
  setMemberships(Object.fromEntries((membershipRows.data??[]).map(m=>[m.student_id,m])) as Record<string,Membership>);
  setLoading(false);
 };
 useEffect(()=>{void loadStudents();},[]);

 const filtered=useMemo(()=>{
  const q=search.trim().toLowerCase();
  return students.filter(s=>{
   const m=memberships[s.id];
   const matchesLevel=level==="all" || (m?.is_active!==false ? (m?.level??"free") : "free")===level;
   const matchesSearch=!q || [s.full_name??"",s.phone??""].some(v=>v.toLowerCase().includes(q));
   return matchesLevel&&matchesSearch;
  });
 },[students,memberships,search,level]);

 const openStudent=async(id:string)=>{
  setSelectedId(id);setDetailLoading(true);setError(null);
  const [cp,sg,rm,ri,apps,interviews,assessments,submissions,payments]=await Promise.all([
   supabase.from("career_profiles").select("*").eq("student_id",id).maybeSingle(),
   supabase.from("career_skill_gaps").select("*").eq("student_id",id).order("domain"),
   supabase.from("career_roadmaps").select("*").eq("student_id",id).order("updated_at",{ascending:false}),
   supabase.from("roadmap_items").select("*").order("sort_order"),
   supabase.from("job_applications").select("*").eq("student_id",id).order("updated_at",{ascending:false}),
   supabase.from("interviews").select("*").eq("student_id",id).order("updated_at",{ascending:false}),
   supabase.from("l1_assessment_attempts").select("*").eq("student_id",id).order("created_at",{ascending:false}),
   supabase.from("l1_assignment_submissions").select("*").eq("student_id",id).order("updated_at",{ascending:false}),
   supabase.from("payments").select("*").eq("student_id",id).order("created_at",{ascending:false}),
  ]);
  const failed=[cp,sg,rm,ri,apps,interviews,assessments,submissions,payments].filter(x=>x.error);
  if(failed.length){setError("Some student data could not be loaded. Check the affected section permissions.");}
  const roadmaps=rm.data??[];
  const roadmapIds=new Set(roadmaps.map(r=>r.id));
  setDetail({
   careerProfile:cp.data??null,skillGaps:sg.data??[],roadmaps,roadmapItems:(ri.data??[]).filter(i=>roadmapIds.has(i.roadmap_id)),
   applications:apps.data??[],interviews:interviews.data??[],assessments:assessments.data??[],submissions:submissions.data??[],payments:payments.data??[],
  });
  setDetailLoading(false);
 };

 const selected=students.find(s=>s.id===selectedId);
 const selectedMembership=selected?memberships[selected.id]:null;
 const activeLevel=selectedMembership?.is_active===false?"free":(selectedMembership?.level??"free");

 return <AdminShell title="Admin 360" subtitle="One operational view of each student across membership, career direction, skill gaps, learning checkpoints, interviews, applications and payments.">
  <div className="space-y-6">
   <Card><CardContent className="p-4"><div className="flex flex-col gap-3 lg:flex-row"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students by name or phone"/></div><Select value={level} onValueChange={setLevel}><SelectTrigger className="w-full lg:w-44"><SelectValue placeholder="Membership"/></SelectTrigger><SelectContent><SelectItem value="all">All memberships</SelectItem>{levels.map(x=><SelectItem key={x} value={x}>{levelLabel(x)}</SelectItem>)}</SelectContent></Select><Button variant="outline" onClick={()=>void loadStudents()} disabled={loading}><RefreshCw className={loading?"animate-spin":""}/>Refresh</Button></div></CardContent></Card>

   <div className="grid gap-4 sm:grid-cols-3">
    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Students</p><p className="mt-1 text-2xl font-bold">{students.length}</p></CardContent></Card>
    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Showing</p><p className="mt-1 text-2xl font-bold">{filtered.length}</p></CardContent></Card>
    <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Selected membership</p><p className="mt-1 text-2xl font-bold">{selected?levelLabel(activeLevel):"—"}</p></CardContent></Card>
   </div>

   <div className="grid gap-6 lg:grid-cols-[0.9fr_1.6fr]">
    <Card className="h-fit"><CardHeader><CardTitle>Student directory</CardTitle></CardHeader><CardContent className="space-y-2">
     {loading?<p className="text-sm text-muted-foreground">Loading students…</p>:filtered.length===0?<p className="py-8 text-center text-sm text-muted-foreground">No matching students.</p>:filtered.map(s=>{
      const m=memberships[s.id];const l=m?.is_active===false?"free":(m?.level??"free");
      return <button key={s.id} type="button" onClick={()=>void openStudent(s.id)} className={"w-full rounded-xl border p-3 text-left transition hover:bg-muted/30 "+(selectedId===s.id?"border-primary bg-primary/[0.04]":"border-border")}>
       <div className="flex items-center justify-between gap-3"><span className="font-semibold">{s.full_name||"Unnamed student"}</span><Badge variant="outline">{levelLabel(l)}</Badge></div>
       <p className="mt-1 text-xs text-muted-foreground">{s.phone||"No phone"} · Joined {new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeZone:"Asia/Kolkata"}).format(new Date(s.created_at))}</p>
      </button>;
     })}
    </CardContent></Card>

    <div>
     {!selected?<Card><CardContent className="p-12 text-center"><UserRound className="mx-auto size-10 text-muted-foreground"/><h2 className="mt-4 font-heading text-xl font-bold">Select a student</h2><p className="mt-2 text-sm text-muted-foreground">Choose a student to open their complete operational snapshot.</p></CardContent></Card>:detailLoading?<Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Loading {selected.full_name||"student"}…</CardContent></Card>:detail&&<div className="space-y-4">
      <div className="flex items-center justify-between"><Button variant="ghost" asChild><Link to="/admin/students"><ArrowLeft/>Student management</Link></Button><Badge variant="outline">{levelLabel(activeLevel)} membership</Badge></div>
      <Card><CardContent className="p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs uppercase tracking-wider text-primary">Student profile</p><h2 className="mt-1 font-heading text-2xl font-bold">{selected.full_name||"Unnamed student"}</h2><p className="mt-1 text-sm text-muted-foreground">{selected.phone||"No phone number"}</p></div><Button variant="outline" asChild><Link to="/admin/career-os"><Map/>Open Career OS</Link></Button></div>
       <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Target role</p><p className="mt-1 text-sm font-semibold">{detail.careerProfile?.target_role||"Not set"}</p></div><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Current role</p><p className="mt-1 text-sm font-semibold">{detail.careerProfile?.current_job_role||"Not set"}</p></div><div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Experience</p><p className="mt-1 text-sm font-semibold">{detail.careerProfile?.experience_years!=null?detail.careerProfile.experience_years+" years":"Not set"}</p></div></div>
      </CardContent></Card>

      <div className="grid gap-4 sm:grid-cols-2">
       <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="size-4 text-primary"/>Career & skill gaps</CardTitle></CardHeader><CardContent className="space-y-2">{detail.skillGaps.length===0?<p className="text-sm text-muted-foreground">No skill-gap snapshot.</p>:detail.skillGaps.map((g:SkillGap)=><div key={g.id} className="flex items-center justify-between gap-3 rounded-lg border p-3"><div><p className="text-sm font-semibold">{g.domain}</p><p className="text-xs text-muted-foreground">{statusLabel(g.status)}</p></div><Badge variant="outline">{g.score??0}%</Badge></div>)}</CardContent></Card>
       <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Map className="size-4 text-primary"/>Career roadmap</CardTitle></CardHeader><CardContent>{detail.roadmaps.length===0?<p className="text-sm text-muted-foreground">No roadmap created.</p>:detail.roadmaps.slice(0,2).map((r:Roadmap)=><div key={r.id} className="mb-3 rounded-lg border p-3"><p className="font-semibold">{r.title}</p><p className="text-xs text-muted-foreground">{detail.roadmapItems.filter((i:RoadmapItem)=>i.roadmap_id===r.id&&i.status==="completed").length}/{detail.roadmapItems.filter((i:RoadmapItem)=>i.roadmap_id===r.id).length} milestones completed · {r.status}</p></div>)}</CardContent></Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
       <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><ClipboardCheck className="size-4 text-primary"/>Learning & assessment</CardTitle></CardHeader><CardContent><p className="text-sm">L1 assessment attempts: <strong>{detail.assessments.length}</strong></p><p className="mt-2 text-sm">Assignment submissions: <strong>{detail.submissions.length}</strong></p>{detail.assessments[0]&&<p className="mt-2 text-xs text-muted-foreground">Latest: {detail.assessments[0].score!=null?detail.assessments[0].score+"%":"Not scored"} · {statusLabel(detail.assessments[0].status)}</p>}</CardContent></Card>
       <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><MessageSquareText className="size-4 text-primary"/>Interviews</CardTitle></CardHeader><CardContent><p className="text-sm">Interview experiences: <strong>{detail.interviews.length}</strong></p><p className="mt-2 text-xs text-muted-foreground">{detail.interviews[0]?detail.interviews[0].company_name+" · "+statusLabel(detail.interviews[0].status):"No interview experience recorded yet."}</p></CardContent></Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
       <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><BriefcaseBusiness className="size-4 text-primary"/>Applications</CardTitle></CardHeader><CardContent><p className="text-sm">Applications: <strong>{detail.applications.length}</strong></p><div className="mt-3 space-y-2">{detail.applications.slice(0,5).map((a:Application)=><div key={a.id} className="rounded-lg border p-3 text-sm"><p className="font-medium">Job {a.job_id.slice(0,8)}…</p><p className="text-xs text-muted-foreground">{statusLabel(a.status)}</p></div>)}</div></CardContent></Card>
       <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base">Payments</CardTitle></CardHeader><CardContent><p className="text-sm">Payment records: <strong>{detail.payments.length}</strong></p><div className="mt-3 space-y-2">{detail.payments.slice(0,5).map((p:Payment)=><div key={p.id} className="flex justify-between rounded-lg border p-3 text-sm"><span>{p.product_name}</span><span>{p.currency} {p.amount} · {p.status}</span></div>)}</div></CardContent></Card>
      </div>
     </div>}
    </div>
   </div>
  </div>
 </AdminShell>;
}
