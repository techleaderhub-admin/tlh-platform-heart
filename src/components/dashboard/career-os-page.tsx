import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Circle, RefreshCw, Target, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StudentShell } from "@/components/dashboard/student-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type MembershipLevel = Database["public"]["Enums"]["membership_level"];
type Roadmap = Database["public"]["Tables"]["career_roadmaps"]["Row"];
type RoadmapItem = Database["public"]["Tables"]["roadmap_items"]["Row"];
type SkillGap = Database["public"]["Tables"]["career_skill_gaps"]["Row"];
type Profile = Database["public"]["Tables"]["career_profiles"]["Row"];
type CareerOsPayload = { profile: Profile | null; skill_gaps: SkillGap[]; roadmap: Roadmap | null; items: RoadmapItem[] };

const STATUS_LABEL: Record<string,string> = { not_started:"Not started", in_progress:"In progress", completed:"Completed", blocked:"Blocked" };
const GAP_LABEL: Record<string,string> = { open:"Needs work", developing:"Developing", strength:"Strength", in_progress:"In progress", resolved:"Resolved" };

export function CareerOsPage() {
  const [membership,setMembership] = useState<MembershipLevel>("free");
  const [payload,setPayload] = useState<CareerOsPayload>({profile:null,skill_gaps:[],roadmap:null,items:[]});
  const [loading,setLoading] = useState(true);
  const [busy,setBusy] = useState<string|null>(null);
  const [error,setError] = useState<string|null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    const {data:userData,error:userError} = await supabase.auth.getUser();
    if (userError || !userData.user) { setError("Your session could not be loaded. Please sign in again."); setLoading(false); return; }
    const [{data:membershipData},{data,error:osError}] = await Promise.all([
      supabase.from("student_memberships").select("level,is_active").eq("student_id",userData.user.id).maybeSingle(),
      supabase.rpc("get_my_career_os")
    ]);
    if (osError) setError("Your Career OS could not be loaded. Please refresh. "+osError.message);
    else if (data) setPayload(data as unknown as CareerOsPayload);
    if (membershipData?.is_active !== false && membershipData?.level) setMembership(membershipData.level);
    setLoading(false);
  };
  useEffect(()=>{void load();},[]);

  const completed = useMemo(()=>payload.items.filter(i=>i.status==="completed").length,[payload.items]);
  const progress = payload.items.length ? Math.round(completed/payload.items.length*100) : 0;
  const openGaps = payload.skill_gaps.filter(g=>g.status==="open"||g.status==="developing");

  const toggleItem = async (item:RoadmapItem) => {
    setBusy(item.id); setError(null);
    const {error:updateError}=await supabase.rpc("update_my_roadmap_item_status",{p_item_id:item.id,p_status:item.status==="completed"?"in_progress":"completed"});
    if (updateError) setError("Could not update this milestone. "+updateError.message); else await load();
    setBusy(null);
  };

  const membershipLabel = membership==="free" ? "Free Membership" : membership.toUpperCase()+" Membership";
  return <StudentShell title="Career OS" subtitle="Your personalized career workspace connects your profile, current skill gaps and the roadmap your TLH team has prepared for you." membershipLabel={membershipLabel}>
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild><Link to="/dashboard"><ArrowLeft/>Back to dashboard</Link></Button>
        <Button variant="outline" onClick={()=>void load()} disabled={loading}><RefreshCw className={loading?"animate-spin":""}/>Refresh</Button>
      </div>
      {error && <Card className="border-destructive/30 bg-destructive/5"><CardContent className="p-4 text-sm font-medium text-destructive">{error}</CardContent></Card>}
      {loading ? <Card><CardContent className="p-10 text-center text-muted-foreground">Loading your Career OS…</CardContent></Card> : <>
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-6 sm:p-7">
            <div className="flex items-start gap-3"><Target className="mt-1 size-6 text-primary"/><div><p className="text-sm font-semibold text-primary">Career direction</p><h2 className="mt-1 font-heading text-2xl font-bold">{payload.profile?.target_role||"Target role not set yet"}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{payload.profile?.career_goal||"Complete your career profile so your roadmap can be aligned to a specific goal."}</p></div></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border bg-background p-4"><p className="text-xs text-muted-foreground">Experience</p><p className="mt-1 font-semibold">{payload.profile?.experience_years!=null?payload.profile.experience_years+" years":"Not set"}</p></div>
              <div className="rounded-xl border bg-background p-4"><p className="text-xs text-muted-foreground">Target compensation</p><p className="mt-1 font-semibold">{payload.profile?.target_compensation!=null?"₹"+payload.profile.target_compensation+" LPA":"Not set"}</p></div>
              <div className="rounded-xl border bg-background p-4"><p className="text-xs text-muted-foreground">Preferred locations</p><p className="mt-1 font-semibold">{payload.profile?.preferred_locations?.length?payload.profile.preferred_locations.join(", "):"Not set"}</p></div>
            </div>
            <Button className="mt-5" variant="outline" asChild><Link to="/dashboard/profile"><UserRound/>Update career profile</Link></Button>
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Roadmap progress</CardTitle></CardHeader><CardContent>
            <p className="font-heading text-4xl font-bold text-primary">{progress}%</p><Progress value={progress} className="mt-3"/><p className="mt-3 text-sm text-muted-foreground">{completed} of {payload.items.length} milestones completed.</p>
            {payload.roadmap?.target_date && <p className="mt-2 text-xs text-muted-foreground">Target date: {new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeZone:"Asia/Kolkata"}).format(new Date(payload.roadmap.target_date))}</p>}
          </CardContent></Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
          <Card><CardHeader><CardTitle>{payload.roadmap?.title||"Personalized roadmap"}</CardTitle><p className="text-sm text-muted-foreground">{payload.roadmap?.description||"Your roadmap will appear here once the TLH team creates it."}</p></CardHeader><CardContent className="space-y-3">
            {payload.items.length===0 ? <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">No roadmap milestones have been published for you yet.</div> : payload.items.map(item=><div key={item.id} className="flex items-start gap-3 rounded-xl border p-4">
              <button type="button" onClick={()=>void toggleItem(item)} disabled={busy===item.id} className="mt-0.5 rounded-full" aria-label={"Mark "+item.title+(item.status==="completed"?" incomplete":" complete")}>{item.status==="completed"?<CheckCircle2 className="size-5 text-primary"/>:<Circle className="size-5 text-muted-foreground"/>}</button>
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className={"font-semibold "+(item.status==="completed"?"line-through text-muted-foreground":"")}>{item.title}</p><Badge variant="outline">{STATUS_LABEL[item.status]||item.status}</Badge></div>{item.description&&<p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>}<div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">{item.category&&<span>{item.category}</span>}{item.due_date&&<span>Due {new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeZone:"Asia/Kolkata"}).format(new Date(item.due_date))}</span>}</div></div>
            </div>)}
          </CardContent></Card>
          <Card><CardHeader><CardTitle className="text-base">Current skill gaps</CardTitle><p className="text-sm text-muted-foreground">Your latest assessment snapshot.</p></CardHeader><CardContent className="space-y-3">
            {payload.skill_gaps.length===0?<p className="text-sm text-muted-foreground">No skill-gap snapshot yet. Complete the career assessment first.</p>:payload.skill_gaps.map(g=><div key={g.id} className="rounded-xl border p-3"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{g.domain}</p><Badge variant="outline">{g.score??0}%</Badge></div><p className="mt-1 text-xs text-muted-foreground">{GAP_LABEL[g.status]||g.status}</p>{g.recommendation&&<p className="mt-2 text-xs leading-5 text-muted-foreground">{g.recommendation}</p>}</div>)}
            {openGaps.length>0&&<Button className="w-full" variant="outline" asChild><Link to="/dashboard/assessment">Review assessment</Link></Button>}
          </CardContent></Card>
        </section>
      </>}
    </div>
  </StudentShell>;
}
