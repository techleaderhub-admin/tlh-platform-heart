import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublicPageShell } from "@/components/public-site/public-page-shell";
import { supabase } from "@/integrations/supabase/client";
import { SITE_URL } from "@/components/home/home-content";

type Post = {
  id: string; slug: string; title: string; excerpt: string | null; content: string;
  category: string | null; tags: string[]; cover_image_url: string | null; published_at: string | null;
  seo_title: string | null; seo_description: string | null; canonical_url: string | null; og_image_url: string | null; noindex: boolean;
};

export function BlogPostPage() {
  const { slug } = useParams({ from: "/blog/$slug" });
  const [post, setPost] = useState<Post | null>(null);
  const [missing, setMissing] = useState(false);
  const [related, setRelated] = useState<Array<{ id: string; slug: string; title: string; excerpt: string | null; cover_image_url: string | null }>>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      if (!data) {
        setMissing(true);
      } else {
        const current = data as Post;
        setPost(current);
        const { data: relatedRows } = await supabase
          .from("blog_posts")
          .select("id,slug,title,excerpt,cover_image_url")
          .eq("status", "published")
          .eq("category", current.category ?? "")
          .neq("id", current.id)
          .order("published_at", { ascending: false })
          .limit(3);
        setRelated((relatedRows ?? []) as typeof related);
      }
    };
    void load();
  }, [slug]);

  if (missing) {
    return <PublicPageShell eyebrow="TLH Blog" title="Article not found" description="This article is not published or the URL is no longer available."><section className="py-16"><div className="mx-auto max-w-5xl px-5 sm:px-8"><Button asChild variant="outline"><Link to="/blog"><ArrowLeft />Back to Blog</Link></Button></div></section></PublicPageShell>;
  }

  if (!post) return <PublicPageShell eyebrow="TLH Blog" title="Loading article…" description="Loading the selected Tech Leader Hub article."><section className="py-16" /></PublicPageShell>;

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt || "Tech Leader Hub article.";
  const canonical = post.canonical_url || `${SITE_URL}/blog/${post.slug}`;
  const paragraphs = post.content.split(/\n\s*\n/).filter(Boolean);
  const structuredData = {
    "@context": "https://schema.org", "@type": "Article", headline: post.title, description,
    datePublished: post.published_at || undefined, dateModified: post.published_at || undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": canonical },
    image: post.og_image_url || post.cover_image_url || undefined,
    author: { "@type": "Organization", name: "Tech Leader Hub", url: SITE_URL },
    publisher: { "@type": "Organization", name: "Tech Leader Hub", url: SITE_URL },
  };

  return (
    <PublicPageShell eyebrow={post.category || "TLH Blog"} title={post.title} description={description}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Button asChild variant="ghost" className="mb-5 px-0"><Link to="/blog"><ArrowLeft />Back to Blog</Link></Button>
          {post.published_at && <p className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />{new Intl.DateTimeFormat("en-IN",{dateStyle:"long",timeZone:"Asia/Kolkata"}).format(new Date(post.published_at))}</p>}
          {post.cover_image_url && <img src={post.cover_image_url} alt={post.title} className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover" />}
          <article className="prose prose-slate max-w-none dark:prose-invert">
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </article>
          {post.tags.length > 0 && <div className="mt-10 flex flex-wrap gap-2">{post.tags.map(tag => <span key={tag} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{tag}</span>)}</div>}
          {related.length > 0 && (
            <section className="mt-12 border-t border-border pt-10">
              <h2 className="font-heading text-2xl font-bold">Related articles</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {related.map((item) => (
                  <Link key={item.id} to="/blog/$slug" params={{ slug: item.slug }} className="rounded-xl border p-4 transition-colors hover:bg-muted/30">
                    {item.cover_image_url && <img src={item.cover_image_url} alt={item.title} className="mb-4 aspect-[16/9] w-full rounded-lg object-cover" />}
                    <p className="font-semibold">{item.title}</p>
                    {item.excerpt && <p className="mt-2 text-xs leading-5 text-muted-foreground">{item.excerpt}</p>}
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">Read <ArrowRight className="size-4" /></span>
                  </Link>
                ))}
              </div>
            </section>
          )}
          <section className="mt-12 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8">
            <h2 className="font-heading text-2xl font-bold">Ready to turn learning into career progress?</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">Start with the free TLH masterclass and learn how the career acceleration journey fits together.</p>
            <Button asChild className="mt-5"><Link to="/masterclass">Join the Masterclass <ArrowRight /></Link></Button>
          </section>
        </div>
      </section>
    </PublicPageShell>
  );
}
