# Tech Leader Hub (TLH): project rules for Claude Code

## What this is
Marketing site and student platform for Tech Leader Hub, a career-acceleration brand for experienced
Android developers, founded by Nikhil Rai (also founder of Droid Skool). The public home page is the
priority. Its single goal is free masterclass registrations at /masterclass.

## Stack
- TanStack Start (React 19, server-rendered), Vite, Tailwind CSS v4, shadcn/ui, lucide-react icons
- Supabase (Lovable Cloud) for auth and masterclass registrations
- Built and hosted with Lovable. Lovable syncs from the GitHub `main` branch.
- Package manager: bun (use npm only if bun is unavailable)

## Key files
- src/components/home/home-page.tsx: home page layout and interactions
- src/components/home/home-content.ts: ALL home page text (FAQ, stories, steps, recognition). Edit copy here.
- src/routes/index.tsx: home SEO (title, description, Open Graph, JSON-LD structured data)
- src/routes/__root.tsx: site-wide head
- src/styles.css: home styles live under the "Home page (Apple-inspired, TLH brand)" section, scoped to .tlh-home
- public/: images, og-home.jpg, robots.txt, llms.txt, sitemap.xml

## Content rules (never break)
1. No pricing anywhere on the site: no prices, fees, discounts or "₹" amounts for any program.
2. No course or curriculum details: no modules, syllabus, week-by-week plans or the 9-stage framework breakdown.
3. Main call to action is always "Join the free masterclass" and links to /masterclass.
4. No unverifiable claims: no "India's #1", no user-count numbers (for example "100M+ users"), no job guarantees.
5. Testimonials are labelled as Droid Skool mentees. Never invent or edit their quotes.
6. Spelling: Ola, PayU, Gameskraft (not GamesKraft), Synchronoss, Droid Skool, Tech Leader Hub.
7. Neither brand is a registered company yet. Never write "Pvt Ltd", "LLP", "Registered" or the ® symbol.
   Copyright line: "© <year> Nikhil Rai. Tech Leader Hub and Droid Skool are brands founded by Nikhil Rai."

## Brand colours (CSS variables on .tlh-home)
- Night Navy #07111F (dark sections) | Paper #FFFFFF | Mist #F4F6F9 (alternate light sections)
- Ink #0E1726 (text on light) | Slate #56617A (secondary text) | Line #DDE2EA (borders)
- Signal Blue #0B63E5 (buttons, links) | Blue hover #0852C2 | Bright Blue #3B8BFF (blue text on dark)
- Leader Gold #F2B544 (accents on dark ONLY) | Deep Gold #8A6A2F (gold text on white)
- Text on dark: white, Muted #B3BDCD, Faint #8793A8
- Brand gradient: #3B8BFF -> #9FC3FF -> #F2B544
- Contrast: never put Leader Gold text on white, or Signal Blue text on Night Navy.

## Design rules
- Apple-inspired: generous white space, one idea per section, sentence-case headings (no ALL-CAPS labels).
- Fonts: -apple-system / SF Pro, with Inter as fallback.
- Motion: subtle and purposeful. Never animate the hero headline in. Every animation must respect
  prefers-reduced-motion. No splash or preloader screens.
- Page content must stay visible if JavaScript fails (scroll-reveal only hides content after the script runs).
- Mobile first. Tap targets at least 40px. No horizontal page scroll at 360px width.
- Accessibility: keyboard-usable controls, visible focus rings, aria labels on icon-only buttons.

## SEO rules
- Exactly one H1 on the home page. The page must be server-rendered with real text in the HTML.
- Keep the JSON-LD @graph (Organization, Droid Skool Organization, Person, WebSite, FAQPage) valid and in sync with
  the FAQ text in home-content.ts.
- Images: WebP, descriptive alt text, served from /public, not from other websites.

## Working rules
- Before finishing any task, run: type check (npx tsc --noEmit -p .), lint (bun run lint), build (bun run build).
  Fix every error in files you touched.
- Do not edit src/routeTree.gen.ts by hand, and do not change src/integrations/supabase/* or package versions
  unless asked.
- Do not delete pages or routes without asking.
- Never force-push. Keep commits small with clear messages.
