-- Blog CMS, SEO metadata and relevance-ranked public search.
create extension if not exists pg_trgm;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null default '',
  category text,
  tags text[] not null default '{}',
  cover_image_url text,
  author_id uuid references public.profiles(id) on delete set null,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  seo_keywords text[] not null default '{}',
  canonical_url text,
  og_image_url text,
  noindex boolean not null default false,
  search_vector tsvector generated always as (
    to_tsvector('english',
      coalesce(title,'') || ' ' ||
      coalesce(excerpt,'') || ' ' ||
      coalesce(content,'') || ' ' ||
      coalesce(category,'') || ' ' ||
      coalesce(array_to_string(tags,' '),'')
    )
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists blog_posts_search_vector_idx on public.blog_posts using gin(search_vector);
create index if not exists blog_posts_status_published_idx on public.blog_posts(status, published_at desc);
create index if not exists blog_posts_category_idx on public.blog_posts(category);
create index if not exists blog_posts_slug_idx on public.blog_posts(slug);
create index if not exists blog_posts_title_trgm_idx on public.blog_posts using gin(title gin_trgm_ops);

create or replace function public.touch_blog_posts_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  if new.status = 'published' and new.published_at is null then
    new.published_at = now();
  elsif new.status <> 'published' then
    new.published_at = null;
  end if;
  return new;
end;
$$;

drop trigger if exists blog_posts_updated_at on public.blog_posts;
create trigger blog_posts_updated_at
before update on public.blog_posts
for each row execute function public.touch_blog_posts_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "Public read published blog posts" on public.blog_posts;
drop policy if exists "Admins manage blog posts" on public.blog_posts;

create policy "Public read published blog posts"
  on public.blog_posts for select
  to anon, authenticated
  using (status = 'published');

create policy "Admins manage blog posts"
  on public.blog_posts for all
  to authenticated
  using (public.has_role(auth.uid(),'admin'::public.app_role))
  with check (public.has_role(auth.uid(),'admin'::public.app_role));

create or replace function public.search_blog_posts(
  p_query text default '',
  p_limit integer default 24
)
returns table (
  id uuid,
  slug text,
  title text,
  excerpt text,
  category text,
  tags text[],
  cover_image_url text,
  published_at timestamptz,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_image_url text,
  noindex boolean,
  relevance real
)
language sql
stable
security invoker
set search_path = public
as $$
  with q as (
    select nullif(trim(coalesce(p_query,'')), '') as query_text
  )
  select
    p.id, p.slug, p.title, p.excerpt, p.category, p.tags, p.cover_image_url,
    p.published_at, p.seo_title, p.seo_description, p.canonical_url, p.og_image_url,
    p.noindex,
    case
      when q.query_text is null then 0::real
      else ts_rank_cd(p.search_vector, websearch_to_tsquery('english', q.query_text))
    end as relevance
  from public.blog_posts p
  cross join q
  where p.status = 'published'
    and (
      q.query_text is null
      or p.search_vector @@ websearch_to_tsquery('english', q.query_text)
      or p.title ilike '%' || q.query_text || '%'
      or coalesce(p.excerpt,'') ilike '%' || q.query_text || '%'
    )
  order by
    case when q.query_text is null then 0 else ts_rank_cd(p.search_vector, websearch_to_tsquery('english', q.query_text)) end desc,
    p.published_at desc nulls last
  limit greatest(1, least(coalesce(p_limit,24), 100));
$$;

revoke execute on function public.search_blog_posts(text,integer) from public;
grant execute on function public.search_blog_posts(text,integer) to anon, authenticated;
