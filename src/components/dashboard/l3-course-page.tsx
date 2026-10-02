import { BookOpen, ChevronDown, ChevronRight, ExternalLink, Layers3, PlayCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;

type Program = { id:string; name:string; description:string|null };
type Course = { id:string; program_id:string; title:string; description:string|null };
type Module = { id:string; course_id:string; title:string; description:string|null };
type Lesson = { id:string; module_id:string; title:string; description:string|null; lesson_type:string; video_url:string|null; resource_url:string|null; duration_minutes:number|null };
type Progress = { lesson_id:string; status:"not_started"|"in_progress"|"completed" };

export function L3CoursePage() {
  const [program,setProgram]=useState<Program|null>(null);
  const [course,setCourse]=useState<Course|null>(null);
  const [modules,setModules]=useState<Module[]>([]);
  const [lessons,setLessons]=useState<Lesson[]>([]);
  const [open,setOpen]=useState<string|null>(null);\n  const [progress,setProgress]=useState<Progress[]>([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState<string|null>(null);

  useEffect(()=>{ void load(); },[]);

  async function load(){
    setLoading(true); setError(null);
    const current=await supabase.auth.getUser();\n    const studentId=current.data.user?.id;\n    if(studentId){ const pr=await db.from("student_l3_lesson_progress").select("lesson_id,status").eq("student_id",studentId); if(!pr.error)setProgress(pr.data??[]); }\n    const p=await db.from("l3_programs").select("*").eq("is_active",true).order("sort_order").limit(1).maybeSingle();
    if(p.error){setError("The L3 program could not be loaded.");setLoading(false);return;}
    if(!p.data){setProgram(null);setCourse(null);setModules([]);setLessons([]);setLoading(false);return;}
    setProgram(p.data);
    const c=await db.from("l3_courses").select("*").eq("program_id",p.data.id).eq("is_active",true).order("sort_order").limit(1).maybeSingle();
    if(c.error){setError("The L3 course could not be loaded.");setLoading(false);return;}
    if(!c.data){setCourse(null);setModules([]);setLessons([]);setLoading(false);return;}
    setCourse(c.data);
    const m=await db.from("l3_course_modules").select("*").eq("course_id",c.data.id).eq("is_active",true).order("sort_order");
    if(m.error){setError("The L3 modules could not be loaded.");setLoading(false);return;}
    setModules(m.data??[]);
    const ids=(m.data??[]).map((x:Module)=>x.id);
    if(ids.length){const l=await db.from("l3_course_lessons").select("*").in("module_id",ids).eq("is_active",true).order("sort_order"); if(l.error)setError("Some L3 lessons could not be loaded."); else setLessons(l.data??[]);}
    setLoading(false);
  }

  const statusFor=(lessonId:string)=>progress.find(x=>x.lesson_id===lessonId)?.status??"not_started";
  const markProgress=async(lesson:Lesson,status:"in_progress"|"completed")=>{
    const user=(await supabase.auth.getUser()).data.user; if(!user)return;
    const now=new Date().toISOString();
    const payload:any={student_id:user.id,lesson_id:lesson.id,status,started_at:status==="in_progress"?now:undefined,completed_at:status==="completed"?now:null};
    const r=await db.from("student_l3_lesson_progress").upsert(payload,{onConflict:"student_id,lesson_id"}).select("lesson_id,status").single();
    if(!r.error)setProgress(prev=>[...prev.filter(x=>x.lesson_id!==lesson.id),r.data]);
  };
  const total=lessons.length, completed=progress.filter(x=>x.status==="completed" && lessons.some(l=>l.id===x.lesson_id)).length;
  const coursePercent=total?Math.round((completed/total)*100):0;

  return <StudentShell title="L3 Career Track" subtitle="Your published career-track course is organized into modules and lessons. Completion tracking and assignments will be added in the next planned tasks." membershipLabel="L3 Career Track">
    <div className="space-y-6">
      {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card>}
      {loading ? <Card><CardContent className="p-8 text-center text-muted-foreground">Loading your L3 course…</CardContent></Card> :
      !program || !course ? <Card><CardContent className="p-8 text-center"><BookOpen className="mx-auto size-8 text-muted-foreground"/><p className="mt-3 font-semibold">No L3 course is published yet.</p><p className="mt-2 text-sm text-muted-foreground">Your L3 learning area is ready. An admin needs to publish the program, course and lessons.</p></CardContent></Card> :
      <>
        <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-6 sm:p-7">
          <Badge variant="outline" className="border-primary/30 text-primary">L3 Career Track</Badge>
          <h2 className="mt-3 font-heading text-2xl font-bold sm:text-3xl">{course.title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{course.description||program.description||"Your L3 career-track course."}</p><div className="mt-5"><div className="flex justify-between text-xs font-semibold"><span>Course progress</span><span>{coursePercent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary transition-all" style={{width:`${coursePercent}%`}} /></div><p className="mt-2 text-xs text-muted-foreground">{completed} of {total} lessons completed</p></div>
        </CardContent></Card>
        <div className="space-y-4">
          {modules.map((module,i)=>{
            const items=lessons.filter(x=>x.module_id===module.id);
            const expanded=open===module.id;
            return <Card key={module.id}>
              <CardHeader className="cursor-pointer" onClick={()=>setOpen(expanded?null:module.id)}>
                <div className="flex items-start justify-between gap-4"><div><Badge variant="secondary">Module {i+1}</Badge><CardTitle className="mt-2">{module.title}</CardTitle>{module.description&&<p className="mt-1 text-sm text-muted-foreground">{module.description}</p>}</div>{expanded?<ChevronDown className="mt-1 size-5"/>:<ChevronRight className="mt-1 size-5"/>}</div>
              </CardHeader>
              {expanded&&<CardContent className="space-y-3">
                {items.map((lesson,j)=><div key={lesson.id} className="rounded-xl border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><PlayCircle className="size-5 text-primary"/><div><p className="text-sm font-semibold">{j+1}. {lesson.title}</p><p className="text-xs text-muted-foreground">{lesson.duration_minutes?lesson.duration_minutes+" min · ":""}{lesson.lesson_type}</p></div></div>
                  <div className="flex flex-wrap items-center gap-2"><Badge variant={statusFor(lesson.id)==="completed"?"default":statusFor(lesson.id)==="in_progress"?"secondary":"outline"}>{statusFor(lesson.id)==="completed"?"Completed":statusFor(lesson.id)==="in_progress"?"In progress":"Not started"}</Badge>{statusFor(lesson.id)!=="completed"&&<Button size="sm" variant="ghost" onClick={()=>void markProgress(lesson,"in_progress")}>Start</Button>}{statusFor(lesson.id)!=="completed"&&<Button size="sm" onClick={()=>void markProgress(lesson,"completed")}>Complete</Button>}{lesson.video_url&&<Button asChild size="sm" variant="outline"><a href={lesson.video_url} target="_blank" rel="noreferrer">Watch <ExternalLink/></a></Button>}{lesson.resource_url&&<Button asChild size="sm" variant="ghost"><a href={lesson.resource_url} target="_blank" rel="noreferrer">Resource <ExternalLink/></a></Button>}</div></div>
                  {lesson.description&&<p className="mt-3 text-sm text-muted-foreground">{lesson.description}</p>}
                </div>)}
                {!items.length&&<p className="text-sm text-muted-foreground">No published lessons in this module yet.</p>}
              </CardContent>}
            </Card>
          })}
        </div>
      </>}
    </div>
  </StudentShell>;
}
