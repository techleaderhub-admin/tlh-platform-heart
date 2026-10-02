import { BookOpen, ChevronDown, ChevronRight, ExternalLink, PlayCircle, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
type Program={id:string;name:string;description:string|null};
type Course={id:string;program_id:string;title:string;description:string|null};
type Module={id:string;course_id:string;title:string;description:string|null};
type Lesson={id:string;module_id:string;title:string;description:string|null;lesson_type:string;video_url:string|null;resource_url:string|null;duration_minutes:number|null};
type Progress={lesson_id:string;status:"not_started"|"in_progress"|"completed"};
type Assignment={id:string;module_id:string;title:string;description:string|null;instructions:string|null;sort_order:number;is_required:boolean};
type Submission={id:string;assignment_id:string;submission_text:string|null;submission_url:string|null;status:string;feedback:string|null;score:number|null};

const statusLabel:Record<string,string>={submitted:"Submitted",under_review:"Under review",reviewed:"Reviewed",needs_revision:"Needs revision"};

export function L3CoursePage(){
 const [program,setProgram]=useState<Program|null>(null),[course,setCourse]=useState<Course|null>(null),[modules,setModules]=useState<Module[]>([]),[lessons,setLessons]=useState<Lesson[]>([]),[assignments,setAssignments]=useState<Assignment[]>([]);
 const [progress,setProgress]=useState<Progress[]>([]),[submissions,setSubmissions]=useState<Record<string,Submission>>({});
 const [open,setOpen]=useState<string|null>(null),[drafts,setDrafts]=useState<Record<string,{text:string;url:string}>>({});
 const [loading,setLoading]=useState(true),[busy,setBusy]=useState<string|null>(null),[error,setError]=useState<string|null>(null);

 useEffect(()=>{void load()},[]);
 async function load(){
  setLoading(true);setError(null);
  const user=(await supabase.auth.getUser()).data.user;
  if(!user){setError("Your session could not be loaded. Please sign in again.");setLoading(false);return;}
  const p=await db.from("l3_programs").select("*").eq("is_active",true).order("sort_order").limit(1).maybeSingle();
  if(p.error){setError("The L3 program could not be loaded.");setLoading(false);return;}
  if(!p.data){setProgram(null);setCourse(null);setModules([]);setLessons([]);setAssignments([]);setLoading(false);return;}
  setProgram(p.data);
  const c=await db.from("l3_courses").select("*").eq("program_id",p.data.id).eq("is_active",true).order("sort_order").limit(1).maybeSingle();
  if(c.error){setError("The L3 course could not be loaded.");setLoading(false);return;}
  if(!c.data){setCourse(null);setModules([]);setLessons([]);setAssignments([]);setLoading(false);return;}
  setCourse(c.data);
  const m=await db.from("l3_course_modules").select("*").eq("course_id",c.data.id).eq("is_active",true).order("sort_order");
  if(m.error){setError("The L3 modules could not be loaded.");setLoading(false);return;}
  const moduleRows=m.data??[];setModules(moduleRows);
  const ids=moduleRows.map((x:Module)=>x.id);
  if(!ids.length){setLessons([]);setAssignments([]);setProgress([]);setSubmissions({});setLoading(false);return;}
  const [l,a,pr,s]=await Promise.all([
   db.from("l3_course_lessons").select("*").in("module_id",ids).eq("is_active",true).order("sort_order"),
   db.from("l3_assignments").select("*").in("module_id",ids).eq("is_active",true).order("sort_order"),
   db.from("student_l3_lesson_progress").select("lesson_id,status").eq("student_id",user.id),
   db.from("l3_assignment_submissions").select("*").eq("student_id",user.id)
  ]);
  if(l.error||a.error||pr.error||s.error)setError("Some L3 learning data could not be loaded.");
  setLessons(l.data??[]);setAssignments(a.data??[]);setProgress(pr.data??[]);
  setSubmissions(Object.fromEntries((s.data??[]).map((x:Submission)=>[x.assignment_id,x])));
  setLoading(false);
 }
 const statusFor=(id:string)=>progress.find(x=>x.lesson_id===id)?.status??"not_started";
 const markProgress=async(lesson:Lesson,status:"in_progress"|"completed")=>{
  setBusy(lesson.id);const user=(await supabase.auth.getUser()).data.user;if(!user){setBusy(null);return;}
  const existing=progress.find(x=>x.lesson_id===lesson.id);const now=new Date().toISOString();
  const payload:any={student_id:user.id,lesson_id:lesson.id,status,started_at:existing?"":now,completed_at:status==="completed"?now:null};
  if(existing)delete payload.started_at;
  const r=await db.from("student_l3_lesson_progress").upsert(payload,{onConflict:"student_id,lesson_id"}).select("lesson_id,status").single();
  if(r.error)setError("Lesson progress could not be saved.");else setProgress(prev=>[...prev.filter(x=>x.lesson_id!==lesson.id),r.data]);
  setBusy(null);
 };
 const submit=async(a:Assignment)=>{
  setBusy(a.id);setError(null);const user=(await supabase.auth.getUser()).data.user;if(!user){setBusy(null);return;}
  const d=drafts[a.id]??{text:"",url:""};if(!d.text.trim()&&!d.url.trim()){setError("Add your assignment response or a submission link before submitting.");setBusy(null);return;}
  const existing=submissions[a.id];
  const r=await db.from("l3_assignment_submissions").upsert({assignment_id:a.id,student_id:user.id,submission_text:d.text.trim()||null,submission_url:d.url.trim()||null,status:"submitted",reviewer_id:null,feedback:existing?.feedback??null,score:existing?.score??null,submitted_at:new Date().toISOString(),reviewed_at:null},{onConflict:"assignment_id,student_id"}).select("*").single();
  if(r.error)setError("Your assignment could not be submitted. Please try again.");else setSubmissions(prev=>({...prev,[a.id]:r.data}));
  setBusy(null);
 };
 const lessonsBy=useMemo(()=>Object.fromEntries(modules.map(m=>[m.id,lessons.filter(l=>l.module_id===m.id)])),[modules,lessons]);
 const assignmentsBy=useMemo(()=>Object.fromEntries(modules.map(m=>[m.id,assignments.filter(a=>a.module_id===m.id)])),[modules,assignments]);
 const completed=lessons.filter(l=>statusFor(l.id)==="completed").length;
 const required=assignments.filter(a=>a.is_required);const submitted=required.filter(a=>!!submissions[a.id]).length;
 const total=lessons.length+required.length;const percent=total?Math.round(((completed+submitted)/total)*100):0;

 return <StudentShell title="L3 Career Track" subtitle="Course → Assignments → Weekly Live Session → Interview Experience" membershipLabel="L3 Career Track">
  <div className="space-y-6">
   {error&&<Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card>}
   {loading?<Card><CardContent className="p-8 text-center text-muted-foreground">Loading your L3 career track…</CardContent></Card>:
   !program||!course?<Card><CardContent className="p-8 text-center"><BookOpen className="mx-auto size-8 text-muted-foreground"/><p className="mt-3 font-semibold">No L3 course is published yet.</p><p className="mt-2 text-sm text-muted-foreground">Your L3 learning area is ready. An admin needs to publish the program, course and lessons.</p></CardContent></Card>:
   <>
    <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-6 sm:p-7"><Badge variant="outline" className="border-primary/30 text-primary">L3 Career Track</Badge><h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">{course.title}</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{course.description||program.description||"Your L3 career-track course."}</p><div className="mt-5"><div className="flex justify-between text-xs font-semibold"><span>Weekly progress</span><span>{percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${percent}%`}}/></div><p className="mt-2 text-xs text-muted-foreground">{completed}/{lessons.length} lessons completed · {submitted}/{required.length} required assignments submitted</p></div></CardContent></Card>
    <div className="space-y-4">{modules.map((module,i)=>{const items=lessonsBy[module.id]??[],as=assignmentsBy[module.id]??[],expanded=open===module.id;return <Card key={module.id}>
     <CardHeader className="cursor-pointer" onClick={()=>setOpen(expanded?null:module.id)}><div className="flex items-start justify-between gap-4"><div><Badge variant="secondary">Module {i+1}</Badge><CardTitle className="mt-2">{module.title}</CardTitle>{module.description&&<p className="mt-1 text-sm text-muted-foreground">{module.description}</p>}</div>{expanded?<ChevronDown className="mt-1 size-5"/>:<ChevronRight className="mt-1 size-5"/>}</div></CardHeader>
     {expanded&&<CardContent className="space-y-3">
      {items.map((lesson,j)=>{const st=statusFor(lesson.id);return <div key={lesson.id} className="rounded-xl border border-border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><PlayCircle className="size-5 text-primary"/><div><p className="text-sm font-semibold">{j+1}. {lesson.title}</p><p className="text-xs text-muted-foreground">{lesson.duration_minutes?lesson.duration_minutes+" min · ":""}{lesson.lesson_type}</p></div></div><div className="flex flex-wrap items-center gap-2"><Badge variant={st==="completed"?"default":st==="in_progress"?"secondary":"outline"}>{st==="completed"?"Completed":st==="in_progress"?"In progress":"Not started"}</Badge>{st!=="completed"&&<Button size="sm" variant="ghost" disabled={busy===lesson.id} onClick={()=>void markProgress(lesson,"in_progress")}>Start</Button>}{st!=="completed"&&<Button size="sm" disabled={busy===lesson.id} onClick={()=>void markProgress(lesson,"completed")}>Complete</Button>}{lesson.video_url&&<Button asChild size="sm" variant="outline"><a href={lesson.video_url} target="_blank" rel="noreferrer">Watch <ExternalLink/></a></Button>}{lesson.resource_url&&<Button asChild size="sm" variant="ghost"><a href={lesson.resource_url} target="_blank" rel="noreferrer">Resource <ExternalLink/></a></Button>}</div></div>{lesson.description&&<p className="mt-3 text-sm text-muted-foreground">{lesson.description}</p>}</div>})}
      {as.length>0&&<div className="mt-5 space-y-3 border-t border-border pt-5"><div><p className="font-semibold">Assignments</p><p className="text-xs text-muted-foreground">Submit your work here. Admin review status appears after submission.</p></div>{as.map(a=>{const s=submissions[a.id];const d=drafts[a.id]??{text:s?.submission_text??"",url:s?.submission_url??""};return <div key={a.id} className="rounded-xl border border-border p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-semibold">{a.title}</p>{a.description&&<p className="mt-1 text-sm text-muted-foreground">{a.description}</p>}{a.instructions&&<p className="mt-2 whitespace-pre-wrap text-sm leading-6">{a.instructions}</p>}</div>{a.is_required&&<Badge>Required</Badge>}</div><Textarea className="mt-4 min-h-28" placeholder="Write your assignment response…" value={d.text} onChange={e=>setDrafts(prev=>({...prev,[a.id]:{...d,text:e.target.value}}))}/><Input className="mt-3" placeholder="Optional submission URL" value={d.url} onChange={e=>setDrafts(prev=>({...prev,[a.id]:{...d,url:e.target.value}}))}/><div className="mt-3 flex flex-wrap items-center justify-between gap-3"><div className="text-xs text-muted-foreground">{s?<><span>Status: <strong>{statusLabel[s.status]??s.status}</strong>{s.score!=null?" · Score "+s.score:""}</span>{s.feedback&&<p className="mt-1">Feedback: {s.feedback}</p>}</>:"Not submitted yet"}</div><Button disabled={busy===a.id} onClick={()=>void submit(a)}><Send/> Submit assignment</Button></div></div>})}</div>}
      {!items.length&&!as.length&&<p className="text-sm text-muted-foreground">No published learning items in this module yet.</p>}
     </CardContent>}
    </Card>})}</div>
   </>
   }
  </div>
 </StudentShell>;
}
