import { useEffect, useState } from "react";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays } from "lucide-react";
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

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("blog_posts").select("*").eq("slug", slug).eq("status", "published").maybeSingle();
      if (!data) setMissing(true); else setPost(data as Post);
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
      <section className="py-8">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Button asChild variant="ghost" className="mb-5 px-0"><Link to="/blog"><ArrowLeft />Back to Blog</Link></Button>
          {post.published_at && <p className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays className="size-4" />{new Intl.DateTimeFormat("en-IN",{dateStyle:"long",timeZone:"Asia/Kolkata"}).format(new Date(post.published_at))}</p>}
          {post.cover_image_url && <img src={post.cover_image_url} alt="" className="mb-10 aspect-[16/9] w-full rounded-2xl object-cover" />}
          <article className="prose prose-slate max-w-none dark:prose-invert">
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </article>
          {post.tags.length > 0 && <div className="mt-10 flex flex-wrap gap-2">{post.tags.map(tag => <span key={tag} className="rounded-full border px-3 py-1 text-xs text-muted-foreground">{tag}</span>)}</div>}
        </div>
      </section>
    </PublicPageShell>
  );
}
