import { FileQuestion, GraduationCap, Layers3, Plus, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

type AssessmentRow = {
  id: string; question_text: string; category: string; option_a: string; option_b: string;
  option_c: string; option_d: string; correct_option: string; explanation: string | null;
  sort_order: number; is_active: boolean;
};

export function AssessmentAdminPage() {
  const [l1, setL1] = useState<AssessmentRow[]>([]);
  const [l2, setL2] = useState<AssessmentRow[]>([]);
  const [l1Attempts, setL1Attempts] = useState(0);
  const [l2Attempts, setL2Attempts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [level, setLevel] = useState<"l1" | "l2">("l1");
  const [form, setForm] = useState({
    question_text: "", category: "", option_a: "", option_b: "", option_c: "", option_d: "",
    correct_option: "a", explanation: "", sort_order: "1",
  });

  const load = async () => {
    setLoading(true); setMessage(null);
    const [q1, q2, a1, a2] = await Promise.all([
      supabase.from("l1_assessment_questions").select("*").order("sort_order"),
      supabase.from("l2_assessment_questions").select("*").order("sort_order"),
      supabase.from("l1_assessment_attempts").select("id", { count: "exact", head: true }),
      supabase.from("l2_assessment_attempts").select("id", { count: "exact", head: true }),
    ]);
    if (q1.error || q2.error || a1.error || a2.error) setMessage("Assessment administration data could not be loaded.");
    setL1((q1.data ?? []) as AssessmentRow[]);
    setL2((q2.data ?? []) as AssessmentRow[]);
    setL1Attempts(a1.count ?? 0); setL2Attempts(a2.count ?? 0);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const questions = level === "l1" ? l1 : l2;
  const addQuestion = async () => {
    if (!form.question_text.trim() || !form.category.trim() || !form.option_a.trim() || !form.option_b.trim() || !form.option_c.trim() || !form.option_d.trim()) {
      setMessage("Question, category and all four options are required."); return;
    }
    const table = level === "l1" ? "l1_assessment_questions" : "l2_assessment_questions";
    const { error } = await supabase.from(table).insert({
      question_text: form.question_text.trim(), category: form.category.trim(),
      option_a: form.option_a.trim(), option_b: form.option_b.trim(), option_c: form.option_c.trim(), option_d: form.option_d.trim(),
      correct_option: form.correct_option, explanation: form.explanation.trim() || null,
      sort_order: Number(form.sort_order) || questions.length + 1, is_active: false,
    });
    if (error) setMessage(error.message);
    else {
      setMessage("Question saved as inactive. Publish it when it is ready.");
      setForm({ question_text:"", category:"", option_a:"", option_b:"", option_c:"", option_d:"", correct_option:"a", explanation:"", sort_order:String(questions.length+2) });
      await load();
    }
  };

  const toggle = async (question: AssessmentRow) => {
    const table = level === "l1" ? "l1_assessment_questions" : "l2_assessment_questions";
    const { error } = await supabase.from(table).update({ is_active: !question.is_active }).eq("id", question.id);
    if (error) setMessage(error.message); else await load();
  };

  return (
    <AdminShell title="Assessment Admin" subtitle="Manage the question banks and monitor assessment activity for L1 Silver and L2 Advanced Android, with the existing career assessment workspace available below.">
      <div className="space-y-6">
        {message && <Card className="border-primary/20 bg-primary/[0.03]"><CardContent className="p-4 text-sm">{message}</CardContent></Card>}

        <section className="grid gap-4 md:grid-cols-4">
          <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">L1 questions</p><p className="mt-1 text-2xl font-bold">{l1.length}</p><p className="text-xs text-muted-foreground">{l1.filter(q=>q.is_active).length} active</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">L1 attempts</p><p className="mt-1 text-2xl font-bold">{l1Attempts}</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">L2 questions</p><p className="mt-1 text-2xl font-bold">{l2.length}</p><p className="text-xs text-muted-foreground">{l2.filter(q=>q.is_active).length} active</p></CardContent></Card>
          <Card><CardContent className="p-5"><p className="text-xs text-muted-foreground">L2 attempts</p><p className="mt-1 text-2xl font-bold">{l2Attempts}</p></CardContent></Card>
        </section>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileQuestion className="size-5 text-primary"/>Create assessment question</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2"><Button variant={level==="l1"?"default":"outline"} onClick={()=>setLevel("l1")}><GraduationCap/>L1 Silver</Button><Button variant={level==="l2"?"default":"outline"} onClick={()=>setLevel("l2")}><Layers3/>L2 Advanced</Button></div>
            <Textarea placeholder="Question" value={form.question_text} onChange={e=>setForm({...form,question_text:e.target.value})}/>
            <div className="grid gap-3 md:grid-cols-2"><Input placeholder="Category" value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/><Input type="number" placeholder="Sort order" value={form.sort_order} onChange={e=>setForm({...form,sort_order:e.target.value})}/></div>
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="Option A" value={form.option_a} onChange={e=>setForm({...form,option_a:e.target.value})}/>
              <Input placeholder="Option B" value={form.option_b} onChange={e=>setForm({...form,option_b:e.target.value})}/>
              <Input placeholder="Option C" value={form.option_c} onChange={e=>setForm({...form,option_c:e.target.value})}/>
              <Input placeholder="Option D" value={form.option_d} onChange={e=>setForm({...form,option_d:e.target.value})}/>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <select className="h-10 rounded-md border bg-background px-3 text-sm" value={form.correct_option} onChange={e=>setForm({...form,correct_option:e.target.value})}><option value="a">Correct: A</option><option value="b">Correct: B</option><option value="c">Correct: C</option><option value="d">Correct: D</option></select>
              <Input placeholder="Explanation (optional)" value={form.explanation} onChange={e=>setForm({...form,explanation:e.target.value})}/>
            </div>
            <Button onClick={()=>void addQuestion()}><Plus/>Save inactive question</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{level.toUpperCase()} question bank</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {loading ? <p className="py-6 text-sm text-muted-foreground">Loading assessment data…</p> : questions.map((q,index)=>(
              <div key={q.id} className="rounded-xl border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="font-medium">{index+1}. {q.question_text}</p><div className="mt-2 flex gap-2"><Badge variant="outline">{q.category}</Badge><Badge variant={q.is_active?"default":"outline"}>{q.is_active?"Active":"Inactive"}</Badge></div></div><Button size="sm" variant="outline" onClick={()=>void toggle(q)}>{q.is_active?"Deactivate":"Publish"}</Button></div>
                <p className="mt-3 text-sm text-muted-foreground">A: {q.option_a} · B: {q.option_b} · C: {q.option_c} · D: {q.option_d}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-5 flex flex-wrap items-center justify-between gap-4">
            <div><p className="font-semibold">Career Assessment & Skill Gaps</p><p className="mt-1 text-sm text-muted-foreground">Review saved career baselines and maintain current skill-gap status.</p></div>
            <Button variant="outline" asChild><Link to="/admin/assessments">Open career assessment workspace<ArrowRight/></Link></Button>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
