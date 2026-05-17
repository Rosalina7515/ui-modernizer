# Changelog

All notable changes to ui-modernizer will be documented here. Format inspired by [Keep a Changelog](https://keepachangelog.com).

## [0.5.0] — 2026-05-17

### Added
- **Component substitution.** Opt-in via *"modernize this UI **and use shadcn**"* (or *"with shadcn components"*, *"replace primitives"*, *"auto-install shadcn"*). The Skill now:
  1. Scans every UI file via `scripts/detect-substitutions.mjs` (new) for hand-rolled native elements that match shadcn primitive shapes.
  2. Shows a plan: which shadcn components will be installed, how many candidates, which files.
  3. Asks the user to confirm.
  4. Initializes shadcn (interactively) if `components.json` is missing.
  5. Runs `npx shadcn@latest add <list>`.
  6. Rewrites the candidate elements, adds imports, preserves every event handler / ref / `aria-*` / `data-*`.
  7. Type-checks afterward (if TypeScript present); on failure, rolls back substitution edits while preserving the className modernization.
- **7 substitution rules** in MVP — Button, Input, Textarea, Label, Badge, Separator, Avatar — with variant + size inference from class signatures.
- **Card pattern recognition** documented in `references/shadcn-component-map.md` — multi-child cards are rewritten to `<Card>` + `<CardHeader>` + `<CardContent>`.
- New reference: `references/component-substitution.md` — opt-in trigger, 5-stage workflow, safety rules, framework notes (shadcn-vue / shadcn-svelte for non-React projects).
- New reference: `references/shadcn-component-map.md` — per-pattern rewriting guide, variant detection table, universal preserve / drop lists.
- New script: `scripts/detect-substitutions.mjs` — read-only detector; outputs JSON plan or `--pretty` table; supports `--files a.tsx,b.tsx` override.

### Changed
- `SKILL.md` — inserted Step 5b (COMPONENT SUBSTITUTION) between APPLY and SCREENSHOT-AFTER, gated on user opt-in language. Added 3 new failure-mode rows.
- README × 2 — added a "Want shadcn primitives? Just ask." subsection under "Pick a vibe".

### Not changed
- All previous-version detectors (stack / brand / profiles) — unchanged.
- Backup / rollback / report flow — unchanged. The new substitution layer is *additionally* rolled back if typecheck fails.
- Vue / Svelte path: substitution runs against `shadcn-vue` / `shadcn-svelte` ports; if those aren't set up, the step is skipped (not failed).

---

## [0.4.0] — 2026-05-17

### Added
- **Pluggable style profiles.** Style references are now formal, validated, pluggable extensions:
  - Profile **format spec** at `references/style-references/_PROFILE_FORMAT.md` (v1.0): required YAML frontmatter (`name`, `displayName`, `version`, `vibe`, `darkFirst`, `recommendedFonts`, `authors`) + required body sections (`## Tokens`, `## Patterns`, `## Don'ts`).
  - **Bring-your-own profile**: users can now say *"modernize this UI using `./our-brand.md`"* and ui-modernizer will load any local Markdown file conforming to the spec.
  - **Validation script** `scripts/validate-profile.mjs` — checks frontmatter and required sections. CI runs it on every PR via `--all`.
  - **Listing script** `scripts/list-profiles.mjs` — outputs JSON or a pretty table of every available profile. Run when the user asks "what styles are available?".
- **3 new built-in profiles** seeded the system:
  - `notion` — warm, calm, generous whitespace.
  - `raycast` — dark-first, dense, command-bar energy.
  - `apple` — premium pill buttons, soft shadows, glass.
- New reference: `references/profile-pluggability.md` — the full override hierarchy (brand color > profile > design-system default), profile resolution rules, contribution workflow.

### Changed
- All 4 existing built-in profiles (`linear`, `vercel`, `stripe`, `shadcn`) — added required frontmatter and re-shaped to include `## Tokens`, `## Patterns`, `## Don'ts` sections. `shadcn` profile expanded with explicit pattern snippets.
- `SKILL.md` Section 3 — rewrote "Sub-modes" into a formal "Style profiles" sub-section: resolution table, validation step, override-hierarchy pointer.
- README "Pick a vibe" code block — now lists all 7 built-in profiles with one-line descriptions plus the bring-your-own syntax.
- README "Contributing" — updated to the 4-step profile-contribution flow with local validation command.
- CI workflow — added `node scripts/validate-profile.mjs --all` step.

### Not changed
- Detection / brand-color / framework workflow — unchanged.

---

## [0.3.0] — 2026-05-17

### Added
- **Vue 3 support** — Nuxt 3 *and* Vue + Vite both supported. Detector recognizes Nuxt by the `nuxt` dependency and walks `pages/`, `components/`, `layouts/`, `app.vue`. Globals CSS is located at the Nuxt-conventional `assets/css/main.css` (or fall-throughs).
- **Svelte 5 support** — SvelteKit *and* Svelte + Vite both supported. Detector recognizes SvelteKit by `@sveltejs/kit` and walks `src/routes/`, `src/lib/`, `src/components/`. Globals CSS is located at `src/app.css` / `src/app.postcss`.
- **Runtime + framework abstraction.** `detect-stack.mjs` now reports:
  - `runtime`: `'react' | 'vue' | 'svelte'`
  - `framework`: `'next' | 'nuxt' | 'sveltekit' | 'vite'`
  - `classAttr`: `'className'` (React) or `'class'` (Vue/Svelte)
  - `fileExtensions`: `['.tsx', '.jsx']` / `['.vue']` / `['.svelte']`
- New reference: `references/frameworks/vue.md` — `class=` vs `:class=` array/object syntax, `<script setup>` boundaries, Nuxt conventions, auto-imports.
- New reference: `references/frameworks/svelte.md` — `class=` vs `class:foo={bool}` directives, SvelteKit `+layout.svelte` / `+page.svelte` conventions, scoped `<style>` blocks.

### Changed
- `SKILL.md` Step 1 now announces detected runtime, framework, Tailwind flavor, and accent in one line.
- `SKILL.md` Step 2 PLAN now uses `uiFiles[]` from the detector (which uses the right roots + extensions per runtime).
- `SKILL.md` Step 5 APPLY now references the framework guide and re-states the framework-specific skip lists.
- `references/tailwind-modernization.md` — added a v0.3 framework-agnostic note clarifying that all examples are JSX but class strings work identically in `class=` for Vue/Svelte.
- `package.json` — added `vue`, `nuxt`, `svelte`, `sveltekit` to keywords; description now lists all three runtimes.

### Not changed (deliberate)
- All visual rules in `design-system-2026.md`, `tailwind-modernization.md`, `component-patterns.md` — class names are framework-agnostic, so no edits needed.
- Backup / rollback / report behavior — fully framework-agnostic, kept stable.

---

## [0.2.0] — 2026-05-17

### Added
- **Tailwind v4 support.** `detect-stack.mjs` now reports `tailwind.flavor` (`v3 | v4`) by parsing both the `tailwindcss` dependency version and the `@import "tailwindcss"` / `@theme` directives in `globals.css`. The Skill workflow branches on this:
  - v3 projects continue to use `templates/globals.css.tpl` + `tailwind.config.tpl`.
  - v4 projects use the new `templates/globals.v4.css.tpl` and **skip** the JS config entirely (CSS-first).
- **Custom brand color detection.** New `scripts/detect-brand.mjs` looks for an existing `brand` / `primary` / `accent` color across:
  - `tailwind.config.{js,ts,mjs}` — object form and string form.
  - `globals.css` — plain CSS variables (`--brand`, `--primary-600`).
  - `globals.css` v4 `@theme` blocks (`--color-brand-600`).
  Output classPrefix (one of `brand` / `primary` / `accent` / `indigo` fallback) is substituted everywhere the Skill would otherwise hard-code indigo.
- New reference: `references/tailwind-v4.md` — v3 → v4 class deltas and the v4 idioms.
- New reference: `references/brand-color-strategy.md` — exact rules for when to substitute, when to preserve, edge cases.
- New template: `templates/globals.v4.css.tpl` — v4-flavor globals.

### Changed
- `SKILL.md` step 1 now runs two detection scripts in sequence and announces both results.
- `SKILL.md` step 5 branches on `tailwind.flavor` and always reads `brand-color-strategy.md` before emitting any `indigo` class.
- `references/tailwind-modernization.md` — added a top-of-file note declaring `indigo` as a placeholder for the detected `classPrefix`, and a pointer to the v4 reference.
- README roadmap and "supported stacks" table updated to reflect v4 support.

### Not changed (deliberate)
- Backup / rollback / report behavior — stable.
- Existing v0.1 class-mapping rules — they still apply; only the accent name is parameterized.

---

## [0.1.0] — 2026-05-17

### Added
- Initial public release.
- Claude Code Skill (`SKILL.md`) with 8-step workflow (detect → plan → backup → apply → report → done).
- Knowledge base: `design-system-2026.md`, `tailwind-modernization.md`, `component-patterns.md`, `animation-motion.md`, `dark-mode.md`.
- Style profiles: `linear`, `vercel`, `stripe`, `shadcn`.
- Scripts: `detect-stack`, `backup` (with `--restore-latest`), `report`. Optional `screenshot` + `compose-before-after` (Playwright).
- Templates: `globals.css`, `tailwind.config`, `design-tokens.css`.
- `npx ui-modernizer` installer.
- Bilingual README (English + 简体中文).
- MIT license.
