import { useEffect, useMemo, useState } from "react";
import { Archive, FileText, Plus, Save, Search } from "lucide-react";
import { AdminShell } from "@/components/admin/admin-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

type Post = {
  id: string; slug: string; title: string; excerpt: string | null; content: string; category: string | null;
  tags: string[]; cover_image_url: string | null; author_id: string | null; status: string;
  published_at: string | null; seo_title: string | null; seo_description: string | null; seo_keywords: string[];
  canonical_url: string | null; og_image_url: string | null; noindex: boolean; created_at: string; updated_at: string;
};

const emptyPost = (): Omit<Post, "id"|"created_at"|"updated_at"> => ({
  slug:"", title:"", excerpt:"", content:"", category:"", tags:[], cover_image_url:"", author_id:null,
  status:"draft", published_at:null, seo_title:"", seo_description:"", seo_keywords:[], canonical_url:"",
  og_image_url:"", noindex:false
});

export function BlogAdminPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyPost());
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");

  const load = async () => {
    const { data } = await supabase.from("blog_posts").select("*").order("updated_at",{ascending:false});
    setPosts((data ?? []) as Post[]);
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const q=filter.trim().toLowerCase();
    return posts.filter(p => (!q || [p.title,p.slug,p.category||""].some(v=>v.toLowerCase().includes(q))) && (status==="all" || p.status===status));
  }, [posts,filter,status]);

  const startNew = () => { setSelectedId(null); setForm(emptyPost()); setMessage(""); };
  const edit = (p: Post) => { setSelectedId(p.id); setForm({...p}); setMessage(""); };
  const set = (key: keyof typeof form, value: any) => setForm(prev => ({...prev,[key]:value}));

  const save = async () => {
    setMessage("");
    if (!form.title.trim() || !form.slug.trim() || !form.content.trim()) { setMessage("Title, slug and content are required."); return; }
    const { data: userData } = await supabase.auth.getUser();
    const payload = {
      slug: form.slug.trim().toLowerCase().replace(/\s+/g,"-"),
      title: form.title.trim(), excerpt: form.excerpt?.trim() || null, content: form.content,
      category: form.category?.trim() || null, tags: form.tags, cover_image_url: form.cover_image_url?.trim() || null,
      author_id: form.author_id || userData.user?.id || null, status: form.status,
      seo_title: form.seo_title?.trim() || null, seo_description: form.seo_description?.trim() || null,
      seo_keywords: form.seo_keywords, canonical_url: form.canonical_url?.trim() || null,
      og_image_url: form.og_image_url?.trim() || null, noindex: form.noindex,
    };
    const result = selectedId
      ? await supabase.from("blog_posts").update(payload).eq("id",selectedId).select().single()
      : await supabase.from("blog_posts").insert(payload).select().single();
    if (result.error) { setMessage(result.error.message); return; }
    setMessage(form.status==="published" ? "Article published." : "Draft saved.");
    await load();
    if (!selectedId && result.data) setSelectedId(result.data.id);
  };

  const archive = async () => {
    if (!selectedId) return;
    const { error } = await supabase.from("blog_posts").update({status:"archived"}).eq("id",selectedId);
    if (error) { setMessage(error.message); return; }
    setForm(prev=>({...prev,status:"archived"})); setMessage("Article archived."); await load();
  };

  return (
    <AdminShell title="Blog & SEO" subtitle="Create and manage TLH articles, publishing state and search metadata without seeding placeholder content.">
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.5fr]">
        <Card className="h-fit">
          <CardHeader><div className="flex items-center justify-between gap-3"><CardTitle>Articles</CardTitle><Button size="sm" onClick={startNew}><Plus />New</Button></div></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search title or slug"/></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="w-32"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem><SelectItem value="draft">Drafts</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></div>
            {filtered.length===0?<p className="py-8 text-center text-sm text-muted-foreground">No articles.</p>:filtered.map(p=><button key={p.id} type="button" onClick={()=>edit(p)} className={"w-full rounded-xl border p-3 text-left hover:bg-muted/30 "+(selectedId===p.id?"border-primary bg-primary/[0.04]":"border-border")}><div className="flex items-center justify-between gap-3"><span className="font-semibold">{p.title}</span><Badge variant="outline">{p.status}</Badge></div><p className="mt-1 text-xs text-muted-foreground">/{p.slug}</p></button>)}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="size-5 text-primary"/>{selectedId?"Edit article":"New article"}</CardTitle></CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Title<Input value={form.title} onChange={e=>set("title",e.target.value)} /></label>
              <label className="space-y-2 text-sm font-medium">Slug<Input value={form.slug} onChange={e=>set("slug",e.target.value)} placeholder="android-system-design-guide" /></label>
            </div>
            <label className="block space-y-2 text-sm font-medium">Excerpt<Textarea value={form.excerpt||""} onChange={e=>set("excerpt",e.target.value)} rows={3}/></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Category<Input value={form.category||""} onChange={e=>set("category",e.target.value)} /></label>
              <label className="space-y-2 text-sm font-medium">Tags (comma separated)<Input value={form.tags.join(", ")} onChange={e=>set("tags",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))} /></label>
            </div>
            <label className="block space-y-2 text-sm font-medium">Content (plain text / Markdown)<Textarea value={form.content} onChange={e=>set("content",e.target.value)} rows={14} placeholder="Write the article content here..." /></label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium">Cover image URL<Input value={form.cover_image_url||""} onChange={e=>set("cover_image_url",e.target.value)} /></label>
              <label className="space-y-2 text-sm font-medium">Status<Select value={form.status} onValueChange={v=>set("status",v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="published">Published</SelectItem><SelectItem value="archived">Archived</SelectItem></SelectContent></Select></label>
            </div>
            <div className="rounded-xl border p-4">
              <p className="font-heading font-semibold">SEO controls</p>
              <div className="mt-4 space-y-4">
                <label className="block space-y-2 text-sm font-medium">SEO title<Input value={form.seo_title||""} onChange={e=>set("seo_title",e.target.value)} /></label>
                <label className="block space-y-2 text-sm font-medium">SEO description<Textarea value={form.seo_description||""} onChange={e=>set("seo_description",e.target.value)} rows={3}/></label>
                <label className="block space-y-2 text-sm font-medium">SEO keywords (comma separated)<Input value={form.seo_keywords.join(", ")} onChange={e=>set("seo_keywords",e.target.value.split(",").map(x=>x.trim()).filter(Boolean))} /></label>
                <label className="block space-y-2 text-sm font-medium">Canonical URL<Input value={form.canonical_url||""} onChange={e=>set("canonical_url",e.target.value)} placeholder="https://techleaderhub.com/blog/..." /></label>
                <label className="block space-y-2 text-sm font-medium">Open Graph image URL<Input value={form.og_image_url||""} onChange={e=>set("og_image_url",e.target.value)} /></label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.noindex} onChange={e=>set("noindex",e.target.checked)} /> Keep this page out of search indexes</label>
              </div>
            </div>
            {message && <p className="rounded-lg border bg-muted/30 p-3 text-sm">{message}</p>}
            <div className="flex flex-wrap gap-2"><Button onClick={()=>void save()}><Save />Save</Button>{selectedId&&<Button variant="outline" onClick={()=>void archive()}><Archive />Archive</Button>}</div>
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
