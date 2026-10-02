import { useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Target } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile=Database["public"]["Tables"]["profiles"]["Row"];
type CareerProfile=Database["public"]["Tables"]["career_profiles"]["Row"];
type Roadmap=Database["public"]["Tables"]["career_roadmaps"]["Row"];
type RoadmapItem=Database["public"]["Tables"]["roadmap_items"]["Row"];

const STATUSES=["not_started","in_progress","completed","blocked"];

export function CareerOsAdminPage(){
  const [profiles,setProfiles]=useState<Profile[]>([]);
  const [careerProfiles,setCareerProfiles]=useState<CareerProfile[]>([]);
  const [roadmaps,setRoadmaps]=useState<Roadmap[]>([]);
  const [items,setItems]=useState<RoadmapItem[]>([]);
  const [studentId,setStudentId]=useState("");
  const [title,setTitle]=useState("");
  const [description,setDescription]=useState("");
  const [targetDate,setTargetDate]=useState("");
  const [itemDraft,setItemDraft]=useState<Record<string,{title:string;description:string;category:string;due_date:string}>>({});
  const [message,setMessage]=useState<string|null>(null);
  const [busy,setBusy]=useState(false);

  const load=async()=>{
    setMessage(null);
    const [p,cp,r,i]=await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("career_profiles").select("*"),
      supabase.from("career_roadmaps").select("*").order("updated_at",{ascending:false}),
      supabase.from("roadmap_items").select("*").order("sort_order").order("created_at"),
    ]);
    if(p.error||cp.error||r.error||i.error){setMessage("Career OS data could not be loaded.");return;}
    setProfiles(p.data??[]);setCareerProfiles(cp.data??[]);setRoadmaps(r.data??[]);setItems(i.data??[]);
  };
  useEffect(()=>{void load();},[]);

  const profileByStudent=useMemo(()=>Object.fromEntries(careerProfiles.map(p=>[p.student_id,p])),[careerProfiles]);
  const itemsByRoadmap=useMemo(()=>items.reduce<Record<string,RoadmapItem[]>>((a,item)=>{(a[item.roadmap_id]??=[]).push(item);return a},{}),[items]);

  const createRoadmap=async()=>{
    if(!studentId||!title.trim()){setMessage("Select a student and enter a roadmap title.");return;}
    setBusy(true);
    const {error}=await supabase.from("career_roadmaps").insert({student_id:studentId,title:title.trim(),description:description.trim()||null,target_date:targetDate||null,status:"active"});
    if(error)setMessage(error.message);else{setMessage("Roadmap created.");setTitle("");setDescription("");setTargetDate("");await load();}
    setBusy(false);
  };

  const addItem=async(roadmap:Roadmap)=>{
    const draft=itemDraft[roadmap.id]??{title:"",description:"",category:"",due_date:""};
    if(!draft.title.trim()){setMessage("Enter a milestone title first.");return;}
    setBusy(true);
    const current=itemsByRoadmap[roadmap.id]??[];
    const {error}=await supabase.from("roadmap_items").insert({roadmap_id:roadmap.id,title:draft.title.trim(),description:draft.description.trim()||null,category:draft.category.trim()||null,due_date:draft.due_date||null,sort_order:current.length,status:"not_started"});
    if(error)setMessage(error.message);else{setMessage("Milestone added.");setItemDraft(v=>({...v,[roadmap.id]:{title:"",description:"",category:"",due_date:""}}));await load();}
    setBusy(false);
  };

  const updateStatus=async(item:RoadmapItem,status:string)=>{
    setBusy(true);
    const {error}=await supabase.from("roadmap_items").update({status,completed_at:status==="completed"?new Date().toISOString():null}).eq("id",item.id);
    if(error)setMessage(error.message);else await load();
    setBusy(false);
  };

  return <AdminShell title="Career OS" subtitle="Central workspace for student career profiles, personalized roadmaps and milestone progress.">
    <div className="space-y-6">
      {message&&<Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}
      <section className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Students with career profiles</p><p className="mt-1 text-2xl font-bold">{careerProfiles.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Roadmaps</p><p className="mt-1 text-2xl font-bold">{roadmaps.length}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-xs uppercase tracking-wider text-muted-foreground">Milestones</p><p className="mt-1 text-2xl font-bold">{items.length}</p></CardContent></Card>
      </section>

      <Card><CardHeader><CardTitle className="flex items-center gap-2"><Plus className="size-5 text-primary"/>Create personalized roadmap</CardTitle></CardHeader><CardContent className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2"><Label>Student</Label><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={studentId} onChange={e=>setStudentId(e.target.value)}><option value="">Select student</option>{profiles.map(p=><option key={p.id} value={p.id}>{p.full_name||p.id}{profileByStudent[p.id]?.target_role?" · "+profileByStudent[p.id].target_role:""}</option>)}</select></div>
        <div className="space-y-2"><Label>Roadmap title</Label><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Android Tech Lead Transition Roadmap"/></div>
        <div className="space-y-2 md:col-span-2"><Label>Description</Label><Textarea value={description} onChange={e=>setDescription(e.target.value)} rows={3} placeholder="What this roadmap is designed to achieve."/></div>
        <div className="space-y-2"><Label>Target date</Label><Input type="date" value={targetDate} onChange={e=>setTargetDate(e.target.value)}/></div>
        <div className="flex items-end"><Button onClick={()=>void createRoadmap()} disabled={busy}><Target/>Create roadmap</Button></div>
      </CardContent></Card>

      <Card><CardHeader><div className="flex items-center justify-between gap-3"><div><CardTitle>Student roadmaps</CardTitle><p className="mt-1 text-sm text-muted-foreground">Review progress and add concrete milestones. No student outcomes are generated automatically.</p></div><Button variant="outline" onClick={()=>void load()} disabled={busy}><RefreshCw/>Refresh</Button></div></CardHeader><CardContent className="space-y-5">
        {roadmaps.length===0?<div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No roadmaps created yet.</div>:roadmaps.map(r=>{
          const student=profiles.find(p=>p.id===r.student_id); const cp=profileByStudent[r.student_id]; const roadmapItems=itemsByRoadmap[r.id]??[]; const done=roadmapItems.filter(i=>i.status==="completed").length; const draft=itemDraft[r.id]??{title:"",description:"",category:"",due_date:""};
          return <div key={r.id} className="rounded-2xl border p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-semibold">{student?.full_name||"Unknown student"}</p><p className="mt-1 text-sm text-muted-foreground">{r.title}{cp?.target_role?" · Target: "+cp.target_role:""}</p><p className="mt-1 text-xs text-muted-foreground">{done}/{roadmapItems.length} milestones completed · {r.status}</p></div><Badge variant="outline">{r.target_date||"No target date"}</Badge></div>{r.description&&<p className="mt-3 text-sm text-muted-foreground">{r.description}</p>}
            <div className="mt-4 space-y-2">{roadmapItems.map(item=><div key={item.id} className="flex flex-wrap items-center gap-2 rounded-xl border p-3"><span className="min-w-0 flex-1 text-sm font-medium">{item.title}</span><Badge variant="outline">{item.status}</Badge>{STATUSES.map(status=><Button key={status} size="sm" variant={item.status===status?"default":"ghost"} disabled={busy} onClick={()=>void updateStatus(item,status)}>{status.replace("_"," ")}</Button>)}</div>)}</div>
            <div className="mt-4 grid gap-2 md:grid-cols-4"><Input placeholder="Milestone title" value={draft.title} onChange={e=>setItemDraft(v=>({...v,[r.id]:{...draft,title:e.target.value}}))}/><Input placeholder="Category" value={draft.category} onChange={e=>setItemDraft(v=>({...v,[r.id]:{...draft,category:e.target.value}}))}/><Input type="date" value={draft.due_date} onChange={e=>setItemDraft(v=>({...v,[r.id]:{...draft,due_date:e.target.value}}))}/><Button variant="outline" onClick={()=>void addItem(r)} disabled={busy}><Plus/>Add milestone</Button><Textarea className="md:col-span-4" rows={2} placeholder="Milestone description" value={draft.description} onChange={e=>setItemDraft(v=>({...v,[r.id]:{...draft,description:e.target.value}}))}/></div>
          </div>
        })}
      </CardContent></Card>
    </div>
  </AdminShell>;
}
