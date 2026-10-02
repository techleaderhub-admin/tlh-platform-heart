import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPage } from "@/components/blog/blog-post-page";

export const Route = createFileRoute("/blog/$slug")({
  head: () => ({
    meta: [
      { title: "Article | Tech Leader Hub" },
      { name: "description", content: "Tech Leader Hub article." },
    ],
  }),
  component: BlogPostPage,
});
