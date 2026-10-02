import { BookOpen, Layers3, Plus, Save, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

const db=supabase as any;

type Program={id:string;name:string;description:string|null;sort_order:number;is_active:boolean};
type Course={id:string;program_id:string;title:string;description:string|null;sort_order:number;is_active:boolean};
type Module={id:string;course_id:string;title:string;description:string|null;sort_order:number;is_active:boolean};
type Lesson={id:string;module_id:string;title:string;description:string|null;lesson_type:string;video_url:string|null;resource_url:string|null;duration_minutes:number|null;sort_order:number;is_active:boolean};

export function L3CourseAdminPage(){
 const [programs,setPrograms]=useState<Program[]>([]),[courses,setCourses]=useState<Course[]>([]),[modules,setModules]=useState<Module[]>([]),[lessons,setLessons]=useState<Lesson[]>([]);
 const [programId,setProgramId]=useState(""),[courseId,setCourseId]=useState(""),[moduleId,setModuleId]=useState("");
 const [busy,setBusy]=useState(""),[error,setError]=useState<string|null>(null);
 const [pf,setPf]=useState({name:"",description:"",sort:"1"}),[cf,setCf]=useState({title:"",description:"",sort:"1"}),[mf,setMf]=useState({title:"",description:"",sort:"1"}),[lf,setLf]=useState({title:"",description:"",video:"",resource:"",duration:"",sort:"1"});

 useEffect(()=>{void load()},[]);
 const visibleCourses=useMemo(()=>courses.filter(x=>x.program_id===programId),[courses,programId]);
 const visibleModules=useMemo(()=>modules.filter(x=>x.course_id===courseId),[modules,courseId]);
 const visibleLessons=useMemo(()=>lessons.filter(x=>x.module_id===moduleId),[lessons,moduleId]);

 async function load(){
  setError(null);
  const [p,c,m,l]=await Promise.all([
   db.from("l3_programs").select("*").order("sort_order"),
   db.from("l3_courses").select("*").order("sort_order"),
   db.from("l3_course_modules").select("*").order("sort_order"),
   db.from("l3_course_lessons").select("*").order("sort_order")
  ]);
  if(p.error||c.error||m.error||l.error){setError("Some L3 course administration data could not be loaded.");return;}
  setPrograms(p.data??[]);setCourses(c.data??[]);setModules(m.data??[]);setLessons(l.data??[]);
  if(!programId&&p.data?.[0])setProgramId(p.data[0].id);
  if(!courseId&&c.data?.[0])setCourseId(c.data[0].id);
  if(!moduleId&&m.data?.[0])setModuleId(m.data[0].id);
 }
 async function save(table:string,data:any,key:string,reset:()=>void){
  setBusy(key);setError(null);
  const {data:auth}=await supabase.auth.getUser();
  const r=await db.from(table).insert({...data,created_by:["l3_programs","l3_courses"].includes(table)?auth.user?.id??null:undefined}).select("*").single();
  if(r.error)setError(r.error.message);else {reset();await load();}
  setBusy("");
 }
 async function toggle(table:string,id:string,value:boolean){setBusy(id);const r=await db.from(table).update({is_active:value}).eq("id",id);if(r.error)setError(r.error.message);else await load();setBusy("")}
 return <AdminShell title="L3 Career Track" subtitle="Build the L3 Program → Course → Module → Lesson structure. Content stays unpublished until you explicitly publish it.">
  <div className="space-y-6">
   {error&&<Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card>}
   <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-6"><div className="grid gap-4 md:grid-cols-4"><div><p className="text-xs uppercase text-muted-foreground">Programs</p><p className="text-2xl font-bold">{programs.length}</p></div><div><p className="text-xs uppercase text-muted-foreground">Courses</p><p className="text-2xl font-bold">{courses.length}</p></div><div><p className="text-xs uppercase text-muted-foreground">Modules</p><p className="text-2xl font-bold">{modules.length}</p></div><div><p className="text-xs uppercase text-muted-foreground">Lessons</p><p className="text-2xl font-bold">{lessons.length}</p></div></div></CardContent></Card>
   <section className="grid gap-4 lg:grid-cols-2">
    <Card><CardHeader><CardTitle className="flex gap-2"><BookOpen className="size-5 text-primary"/>Create L3 program</CardTitle></CardHeader><CardContent className="space-y-3"><Input placeholder="Program name" value={pf.name} onChange={e=>setPf({...pf,name:e.target.value})}/><Textarea placeholder="Description" value={pf.description} onChange={e=>setPf({...pf,description:e.target.value})}/><Input type="number" placeholder="Sort order" value={pf.sort} onChange={e=>setPf({...pf,sort:e.target.value})}/><Button disabled={!pf.name.trim()||busy==="program"} onClick={()=>void save("l3_programs",{name:pf.name.trim(),description:pf.description.trim()||null,sort_order:Number(pf.sort)||1,is_active:false},"program",()=>setPf({name:"",description:"",sort:"1"}))}><Plus/>Add program</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Programs & publishing</CardTitle></CardHeader><CardContent className="space-y-3">{programs.map(p=><div key={p.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">Order {p.sort_order}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>setProgramId(p.id)}>Manage</Button><Button size="sm" variant={p.is_active?"secondary":"default"} disabled={busy===p.id} onClick={()=>void toggle("l3_programs",p.id,!p.is_active)}>{p.is_active?"Published":"Publish"}</Button></div></div></div>)}{!programs.length&&<p className="text-sm text-muted-foreground">No L3 program exists yet.</p>}</CardContent></Card>
   </section>
   <section className="grid gap-4 lg:grid-cols-2">
    <Card><CardHeader><CardTitle>Create course</CardTitle></CardHeader><CardContent className="space-y-3"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={programId} onChange={e=>setProgramId(e.target.value)}><option value="">Select program</option>{programs.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><Input placeholder="Course title" value={cf.title} onChange={e=>setCf({...cf,title:e.target.value})}/><Textarea placeholder="Description" value={cf.description} onChange={e=>setCf({...cf,description:e.target.value})}/><Input type="number" placeholder="Sort order" value={cf.sort} onChange={e=>setCf({...cf,sort:e.target.value})}/><Button disabled={!programId||!cf.title.trim()||busy==="course"} onClick={()=>void save("l3_courses",{program_id:programId,title:cf.title.trim(),description:cf.description.trim()||null,sort_order:Number(cf.sort)||1,is_active:false},"course",()=>setCf({title:"",description:"",sort:"1"}))}><Plus/>Add course</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Courses in selected program</CardTitle></CardHeader><CardContent className="space-y-3">{visibleCourses.map(c=><div key={c.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{c.title}</p><p className="text-xs text-muted-foreground">Order {c.sort_order}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>setCourseId(c.id)}>Manage</Button><Button size="sm" variant={c.is_active?"secondary":"default"} disabled={busy===c.id} onClick={()=>void toggle("l3_courses",c.id,!c.is_active)}>{c.is_active?"Published":"Publish"}</Button></div></div></div>)}{!visibleCourses.length&&<p className="text-sm text-muted-foreground">Add a course to this program.</p>}</CardContent></Card>
   </section>
   <section className="grid gap-4 lg:grid-cols-2">
    <Card><CardHeader><CardTitle className="flex gap-2"><Layers3 className="size-5 text-primary"/>Create module</CardTitle></CardHeader><CardContent className="space-y-3"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={courseId} onChange={e=>setCourseId(e.target.value)}><option value="">Select course</option>{visibleCourses.map(c=><option key={c.id} value={c.id}>{c.title}</option>)}</select><Input placeholder="Module title" value={mf.title} onChange={e=>setMf({...mf,title:e.target.value})}/><Textarea placeholder="Description" value={mf.description} onChange={e=>setMf({...mf,description:e.target.value})}/><Input type="number" placeholder="Sort order" value={mf.sort} onChange={e=>setMf({...mf,sort:e.target.value})}/><Button disabled={!courseId||!mf.title.trim()||busy==="module"} onClick={()=>void save("l3_course_modules",{course_id:courseId,title:mf.title.trim(),description:mf.description.trim()||null,sort_order:Number(mf.sort)||1,is_active:false},"module",()=>setMf({title:"",description:"",sort:"1"}))}><Plus/>Add module</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Modules in selected course</CardTitle></CardHeader><CardContent className="space-y-3">{visibleModules.map(m=><div key={m.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{m.title}</p><p className="text-xs text-muted-foreground">Order {m.sort_order}</p></div><div className="flex gap-2"><Button size="sm" variant="outline" onClick={()=>setModuleId(m.id)}>Manage</Button><Button size="sm" variant={m.is_active?"secondary":"default"} disabled={busy===m.id} onClick={()=>void toggle("l3_course_modules",m.id,!m.is_active)}>{m.is_active?"Live":"Activate"}</Button></div></div></div>)}{!visibleModules.length&&<p className="text-sm text-muted-foreground">Add a module to this course.</p>}</CardContent></Card>
   </section>
   <section className="grid gap-4 lg:grid-cols-2">
    <Card><CardHeader><CardTitle className="flex gap-2"><Video className="size-5 text-primary"/>Create lesson</CardTitle></CardHeader><CardContent className="space-y-3"><select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={moduleId} onChange={e=>setModuleId(e.target.value)}><option value="">Select module</option>{visibleModules.map(m=><option key={m.id} value={m.id}>{m.title}</option>)}</select><Input placeholder="Lesson title" value={lf.title} onChange={e=>setLf({...lf,title:e.target.value})}/><Textarea placeholder="Description" value={lf.description} onChange={e=>setLf({...lf,description:e.target.value})}/><Input placeholder="Video URL (optional)" value={lf.video} onChange={e=>setLf({...lf,video:e.target.value})}/><Input placeholder="Resource URL (optional)" value={lf.resource} onChange={e=>setLf({...lf,resource:e.target.value})}/><div className="grid grid-cols-2 gap-3"><Input type="number" placeholder="Minutes" value={lf.duration} onChange={e=>setLf({...lf,duration:e.target.value})}/><Input type="number" placeholder="Sort order" value={lf.sort} onChange={e=>setLf({...lf,sort:e.target.value})}/></div><Button disabled={!moduleId||!lf.title.trim()||busy==="lesson"} onClick={()=>void save("l3_course_lessons",{module_id:moduleId,title:lf.title.trim(),description:lf.description.trim()||null,lesson_type:"video",video_url:lf.video.trim()||null,resource_url:lf.resource.trim()||null,duration_minutes:lf.duration?Number(lf.duration):null,sort_order:Number(lf.sort)||1,is_active:false},"lesson",()=>setLf({title:"",description:"",video:"",resource:"",duration:"",sort:"1"}))}><Save/>Save lesson</Button></CardContent></Card>
    <Card><CardHeader><CardTitle>Lessons in selected module</CardTitle></CardHeader><CardContent className="space-y-3">{visibleLessons.map(l=><div key={l.id} className="rounded-xl border p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{l.title}</p><p className="text-xs text-muted-foreground">{l.duration_minutes?l.duration_minutes+" min · ":""}{l.video_url?"Video URL added":"No video URL"}</p></div><Button size="sm" variant={l.is_active?"secondary":"default"} disabled={busy===l.id} onClick={()=>void toggle("l3_course_lessons",l.id,!l.is_active)}>{l.is_active?"Published":"Publish"}</Button></div></div>)}{!visibleLessons.length&&<p className="text-sm text-muted-foreground">Add lessons here; they remain unpublished until you explicitly publish them.</p>}</CardContent></Card>
   </section>
   <Card><CardContent className="p-5 text-sm text-muted-foreground">Task 6 scope is intentionally limited to the course structure. Lesson completion, assignments and weekly sessions are separate planned tasks and are not created here.</CardContent></Card>
  </div>
 </AdminShell>;
}
