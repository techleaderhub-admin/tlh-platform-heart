# Phase 1 Public Home Page

## Scope
- Replace `/` with a public, dark-first Tech Leader Hub home page.
- Add only a minimal `/get-started` placeholder so every CTA has a valid destination.
- Preserve `/login`, `/signup`, `/dashboard`, `/admin`, and all existing authentication behavior.

## Home page structure
- Responsive header using the existing official TLH mark, desktop navigation, mobile menu, Sign In, and Get Started.
- Premium hero focused on technology career acceleration and leadership, with restrained technical depth and clear CTAs.
- TLH overview and audience sections.
- Nine-stage framework: Diagnose, Position, Upgrade, Prove, Prepare, Activate, Convert, Negotiate, Advance.
- Platform capabilities with explicit availability labels and no unsupported claims.
- TLH positioning section, final Get Started call to action, and footer.

## Design and accessibility
- Use the existing TLH semantic color tokens, Manrope headings, and Inter body text.
- Build mobile-first layouts with visible focus states, semantic landmarks, keyboard-accessible navigation, and no text overlap.
- Add subtle entrance and interaction motion while honoring reduced-motion preferences.
- Use the existing official favicon/brand mark as the available TLH logo asset; do not redraw it.

## Technical details
- Keep page content modular with focused home-page components and data arrays.
- Add route-specific metadata for `/` and `/get-started`.
- Use TanStack Router links and existing button components for all navigation actions.
- Verify build health, public and authentication routes, CTA links, mobile menu keyboard behavior, and desktop/mobile layouts.
