import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, ArrowRight, CalendarDays } from "lucide-react";
import { PublicPageShell } from "@/components/public-site/public-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";

type BlogResult = {
  id: string; slug: string; title: string; excerpt: string | null; category: string | null;
  tags: string[]; cover_image_url: string | null; published_at: string | null; relevance: number;
};

export function BlogIndexPage() {
  const [query, setQuery] = useState("");
  const [posts, setPosts] = useState<BlogResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [tag, setTag] = useState("all");

  const load = async (q = "") => {
    setLoading(true);
    const { data } = await supabase.rpc("search_blog_posts", { p_query: q, p_limit: 24 });
    setPosts((data ?? []) as BlogResult[]);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const tags = useMemo(
    () => Array.from(new Set(posts.flatMap((post) => post.tags))).filter(Boolean).sort().slice(0, 12),
    [posts],
  );
  const visiblePosts = useMemo(
    () => tag === "all" ? posts : posts.filter((post) => post.tags.includes(tag)),
    [posts, tag],
  );

  return (
    <PublicPageShell
      eyebrow="TLH Blog"
      title="Practical ideas for Android engineers building toward technical leadership."
      description="Career strategy, Android architecture, interview preparation, system design and leadership insights from Tech Leader Hub."
    >
      <section className="border-b border-border py-8 sm:py-10">
        <div className="mx-auto flex max-w-5xl gap-3 px-5 sm:px-8 lg:px-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void load(query); }}
              placeholder="Search Android, system design, interviews, career..."
              className="pl-9"
              aria-label="Search blog"
            />
          </div>
          <Button onClick={() => void load(query)} disabled={loading}>Search</Button>
        </div>
      </section>

      <section className="py-14 sm:py-18">
        <div className="mx-auto max-w-5xl px-5 sm:px-8 lg:px-10">
          {tags.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2">
              <Button size="sm" variant={tag === "all" ? "secondary" : "outline"} onClick={() => setTag("all")}>All</Button>
              {tags.map((item) => (
                <Button key={item} size="sm" variant={tag === item ? "secondary" : "outline"} onClick={() => setTag(item)}>
                  {item}
                </Button>
              ))}
            </div>
          )}
          {loading ? <p className="text-muted-foreground">Loading articles…</p> :
            visiblePosts.length === 0 ? <Card><CardContent className="p-10 text-center"><h2 className="font-heading text-xl font-bold">No published articles yet</h2><p className="mt-2 text-sm text-muted-foreground">The TLH content library will appear here as articles are published.</p></CardContent></Card> :
            <div className="grid gap-5 md:grid-cols-2">
              {visiblePosts.map((post) => (
                <Card key={post.id} className="overflow-hidden border-border/80 bg-card/70">
                  {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="aspect-[16/9] w-full object-cover" loading="lazy" />}
                  <CardContent className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {post.category && <span className="rounded-full border px-2 py-1">{post.category}</span>}
                      {post.published_at && <span className="inline-flex items-center gap-1"><CalendarDays className="size-3" />{new Intl.DateTimeFormat("en-IN",{dateStyle:"medium",timeZone:"Asia/Kolkata"}).format(new Date(post.published_at))}</span>}
                    </div>
                    <h2 className="mt-4 font-heading text-xl font-bold leading-tight">{post.title}</h2>
                    {post.excerpt && <p className="mt-3 text-sm leading-6 text-muted-foreground">{post.excerpt}</p>}
                    <Button variant="ghost" className="mt-4 px-0" asChild><Link to="/blog/$slug" params={{ slug: post.slug }}>Read article <ArrowRight /></Link></Button>
                  </CardContent>
                </Card>
              ))}
            </div>}
          <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-bold">Want a structured path, not random advice?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Join the free TLH masterclass to understand the career acceleration framework and the next steps available to experienced Android engineers.</p>
            <Button asChild className="mt-5"><Link to="/masterclass">Join the Masterclass <ArrowRight /></Link></Button>
          </section>
        </div>
      </section>
    </PublicPageShell>
  );
}
