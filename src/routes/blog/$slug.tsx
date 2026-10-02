import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPage } from "@/components/blog/blog-post-page";
import { SITE_URL } from "@/components/home/home-content";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { data } = await supabase
      .from("blog_posts")
      .select("title,excerpt,seo_title,seo_description,seo_keywords,canonical_url,og_image_url,cover_image_url,published_at,slug,noindex")
      .eq("slug", params.slug)
      .eq("status", "published")
      .maybeSingle();
    return data;
  },
  head: ({ loaderData }) => {
    const post = loaderData;
    const title = post?.seo_title || post?.title || "Article | Tech Leader Hub";
    const description = post?.seo_description || post?.excerpt || "Tech Leader Hub article.";
    const canonical = post?.canonical_url || (post?.slug ? `${SITE_URL}/blog/${post.slug}` : `${SITE_URL}/blog`);
    const image = post?.og_image_url || post?.cover_image_url;
    const robots = post?.noindex ? "noindex, follow" : "index, follow, max-image-preview:large";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { name: "robots", content: robots },
        ...(post?.seo_keywords?.length ? [{ name: "keywords", content: post.seo_keywords.join(", ") }] : []),
        { property: "og:type", content: "article" },
        { property: "og:site_name", content: "Tech Leader Hub" },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:url", content: canonical },
        ...(image ? [{ property: "og:image", content: image }] : []),
        { name: "twitter:card", content: image ? "summary_large_image" : "summary" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        ...(image ? [{ name: "twitter:image", content: image }] : []),
      ],
      links: [{ rel: "canonical", href: canonical }],
    };
  },
  component: BlogPostPage,
});
