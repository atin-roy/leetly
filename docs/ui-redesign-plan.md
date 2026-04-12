# Editorial-Tech Demo Redesign for `apps/web`

## Summary
Rebuild the web app as a mock-driven design branch with a full editorial-tech art direction, keeping the current route map but replacing the generic shadcn look across public and authenticated surfaces. The branch will bypass auth for review, render curated dummy data on all app routes, and expose a tokenized theme system with three presets and a visible theme switcher.

## Key Changes
### Theme and visual system
- Replace the current neutral shadcn token set in `app/globals.css` with a layered design-token system based on CSS variables.
- Keep `data-theme` as the selector mechanism, but expand tokens beyond color:
  `--bg-*`, `--surface-*`, `--text-*`, `--accent-*`, `--border-*`, `--ring-*`, `--shadow-*`, `--gradient-*`, `--radius-*`, `--font-display`, `--font-body`, `--font-mono`, `--pattern-*`.
- Ship exactly 3 presets with a switcher:
  `index` as the default editorial-tech flagship,
  `paper-signal` as a warm print-tech variant,
  `night-grid` as a darker high-contrast variant.
- Load fonts centrally in `app/layout.tsx` with `next/font`; use one display face, one body face, one mono face, and map them into variables so theme changes remain CSS-driven.
- Re-skin the existing reusable primitives first instead of introducing a second component library. `Button`, `Card`, `Badge`, `Input`, `Textarea`, `Dialog`, `Tabs`, `Table`, `Select`, `Popover`, and `DropdownMenu` keep their current React APIs where possible but get new class contracts and stronger visual states.
- Add a small set of layout utilities/components for the new language:
  hero panel, stat tile, section header, theme switcher, metric strip, insight card, and empty-state block.

### Demo mode and data flow
- Convert this branch to full demo mode for the frontend only.
- Bypass the auth redirect in the `(app)` area and use a mock session/provider path so reviewers can open `/dashboard` directly.
- Replace live data hooks on redesigned routes with a centralized mock data module that returns stable typed data matching current UI needs.
- Create a single demo-data source for:
  user profile,
  stats/activities,
  problems and filters,
  review queue,
  lists and list detail,
  notes,
  account/settings values.
- Keep route URLs and page entrypoints unchanged, but each page should consume demo-facing helpers instead of network queries for this branch.
- Theme persistence becomes local-only for this branch via `localStorage`; do not call backend theme persistence while demo mode is active.

### Page redesign scope
- Public pages:
  redesign `/`, `/about`, `/privacy`, and `/terms` to match the new brand system, with the legal pages remaining readable and calmer than the dashboard surfaces.
- Auth/demo shell:
  replace the current sidebar/header shell with a more intentional composition: branded rail, richer page headers, contextual metadata, better spacing rhythm, and responsive mobile navigation.
- App pages:
  `/dashboard` becomes the flagship showcase page with editorial hero metrics, charts, streak/activity storytelling, and stronger hierarchy.
  `/problems` becomes a visually designed data workspace using mock problems, improved filters, and a less generic table/list treatment.
  `/problems/[id]` becomes a richer case-study page with attempt timeline, notes, tags, related problems, and review state from demo data.
  `/review`, `/lists`, `/lists/[id]`, `/notes`, and `/account` all get full visual redesigns using the same system and mock data.
- Redirect-only routes stay semantically the same:
  `/settings` still forwards to `/account`,
  `/profile` still forwards to `/account`.
- `sign-in` should no longer bounce immediately into auth during this branch; convert it into a branded demo entry page with a CTA into `/dashboard`.

## Interfaces and Types
- Update `ThemeId` in `lib/themes.ts` to the new 3-theme set and expand `Theme` metadata to include typography and surface/gradient preview info.
- Add a typed demo-data contract in a dedicated module such as `lib/demo-data.ts` or `lib/demo/*`:
  `DemoSession`, `DemoDashboard`, `DemoProblem`, `DemoProblemDetail`, `DemoReviewItem`, `DemoList`, `DemoNote`, `DemoAccountSettings`.
- Keep existing page/component prop shapes stable where practical so the redesign remains swappable later; adapt data at the mock layer rather than rewriting every component contract.
- Do not change backend APIs or shared server contracts in this branch.

## Test Plan
- Run `pnpm --filter web lint`.
- Run `pnpm --filter web build`.
- Manually verify desktop and mobile layouts for:
  `/`,
  `/dashboard`,
  `/problems`,
  `/problems/[id]`,
  `/review`,
  `/lists`,
  `/notes`,
  `/account`,
  `/about`,
  `/privacy`,
  `/terms`.
- Manually verify:
  theme switching persists locally,
  auth is bypassed only for this branch’s demo flow,
  navigation still reaches all current routes,
  empty states and long-content states render cleanly,
  charts/cards/tables remain legible in all 3 themes.

## Assumptions and Defaults
- Keep the current route map and navigation categories; this is a visual and experience rewrite, not an IA rewrite.
- This branch is intentionally mock-first and frontend-only; broken parity with live API data is acceptable for now.
- Use local demo session data instead of real authentication on app routes.
- Preserve shadcn/Radix packages only as implementation primitives where helpful, but remove the generic shadcn visual language entirely.
- Prioritize a premium editorial-tech look over density-minimalism; avoid purple-default aesthetics and generic SaaS styling.
