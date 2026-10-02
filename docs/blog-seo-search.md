# Blog + SEO / Search System

## Scope
The TLH blog is an admin-managed publishing system with public SEO-ready article pages and relevance-ranked public search.

## Blog post model
- Draft / published / archived workflow.
- Stable unique slug.
- Markdown-style content stored as text.
- Category and tags.
- Cover, Open Graph and canonical URL fields.
- SEO title, SEO description and SEO keywords.
- Optional noindex flag.
- Author profile reference.
- Published timestamp.
- PostgreSQL full-text search vector with trigram title support.

## Public routes
- `/blog` — searchable published article index.
- `/blog/:slug` — article detail with title, description, canonical, Open Graph and Article JSON-LD metadata.

## Admin route
- `/admin/blog` — create, edit, publish, archive and manage SEO metadata.
- No article content is seeded by this feature.

## Search
The public search RPC uses PostgreSQL full-text relevance plus title/excerpt matching. This is intentionally implemented without inventing an AI provider or API key. A future semantic/AI search layer can reuse the same post corpus without changing the public CMS contract.

## Security
- Anonymous/authenticated users can only read published posts.
- Admins can create/update/archive blog posts.
