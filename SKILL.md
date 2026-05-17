---
name: ui-modernizer
description: Modernize a React/Vue/Svelte + Tailwind UI to 2026 SaaS-grade design (Linear / Vercel / Stripe / shadcn aesthetic). Supports Next.js, Nuxt 3, SvelteKit, and Vite. Trigger when the user says "modernize this UI", "modernize the UI", "upgrade the design", "make this look modern", "make the UI look like Linear/Vercel/Stripe", or otherwise asks to refresh / level-up the visual design of a frontend codebase. Do NOT use for new feature work, bug fixes, or business logic changes.
---

# UI Modernizer

You are a top-tier 2026 SaaS product designer **and** a senior frontend engineer.
Your job: take the current project's UI from "ok-looking" to **Linear / Vercel / Stripe / shadcn** territory — **without touching any business logic**.

## 0 · Hard rules (read first, never violate)

1. **NEVER modify business logic.** Do not touch: event handlers, state, effects, fetch / API calls, router, server actions, business utilities, types of props.
2. **Only touch visual surface.** Allowed edits:
   - `className` string contents on JSX elements
   - Adding non-semantic wrapper `<div>`s purely for visual layout
   - `app/globals.css`, `tailwind.config.{js,ts}`, design-token files
   - New CSS files imported only for styling
3. **Always back up first.** If `scripts/backup.mjs` has not been run for this session, run it before any edit.
4. **Don't add runtime dependencies** without asking. Tailwind plugins (`@tailwindcss/forms`, `tailwindcss-animate`) require explicit user confirmation.
5. **Don't break the build.** After edits, verify the project still type-checks / builds if the user has TypeScript or a build step.
6. **Don't invent design tokens.** Pull from `references/design-system-2026.md` or `templates/design-tokens.css.tpl`.

## 1 · Workflow (8 steps, in order)

Execute these steps sequentially. Announce each step in one short sentence before running it.

### Step 1 — DETECT

Run **two** detection scripts in this order:

1. `node scripts/detect-stack.mjs` — confirms a supported runtime + framework + Tailwind. Key output fields you must read:
   - `runtime` — `'react' | 'vue' | 'svelte'`
   - `framework` — `'next' | 'nuxt' | 'sveltekit' | 'vite'`
   - `classAttr` — `'className'` for React, `'class'` for Vue/Svelte
   - `fileExtensions` — `['.tsx', '.jsx']` / `['.vue']` / `['.svelte']`
   - `tailwind.flavor` — `'v3' | 'v4'`
2. `node scripts/detect-brand.mjs` — looks for an existing brand / primary / accent color so we use *that* instead of forcing indigo. Output includes `classPrefix` (`'brand' | 'primary' | 'accent' | 'indigo'`). **Remember this value** — every later step substitutes it into class strings.

Supported runtime + framework combinations:
- **React + Next.js** (App Router preferred; Pages Router supported)
- **Vue 3 + Nuxt 3** *or* **Vue 3 + Vite**
- **Svelte 5 + SvelteKit** *or* **Svelte 5 + Vite**

Tailwind CSS v3 **or v4** must be configured.

If any required check fails: STOP and tell the user which prerequisite is missing. Do not proceed.

Once detection succeeds, announce: "Detected **{runtime}** + **{framework}** + Tailwind **{flavor}**, accent: **{classPrefix}**."

Based on `runtime`, load the appropriate framework reference for Step 5:
- `react` → no extra file (default behavior)
- `vue` → `references/frameworks/vue.md`
- `svelte` → `references/frameworks/svelte.md`

### Step 2 — PLAN

Walk the project's UI files. The roots and extensions depend on `runtime`:
- **React:** `app/**`, `components/**`, `src/**` with extensions `.tsx`, `.jsx`
- **Vue:** `pages/**`, `components/**`, `layouts/**`, `app.vue`, `src/**` with extension `.vue`
- **Svelte:** `src/routes/**`, `src/lib/**`, `src/components/**` with extension `.svelte`

`detect-stack.mjs` already returns `uiFiles[]` — use that list as the starting set.

Build a short plan listing:
- Files to modify (max 30 in MVP — if more, focus on layouts and shared components)
- Modernization dimensions per file (spacing / typography / color / radius / shadow / hover / dark mode / motion)
- Estimated visual impact (high / medium / low)

Present the plan, then ask: "Proceed? (y / pick specific files / no)". If the user already said "yes go ahead" or passed `--yes`, skip the confirmation.

### Step 3 — BACKUP

Run `node scripts/backup.mjs`. It copies all targeted files into `.ui-modernizer-backup/<ISO-timestamp>/`. Confirm backup path in your reply.

### Step 4 — SCREENSHOT BEFORE

Run `node scripts/screenshot.mjs before`. It:
- Starts `next dev` on a free port
- Loads up to 5 routes (default: `/`, plus any routes discoverable from `app/`)
- Saves PNGs to `.ui-modernizer/screenshots/before/`

If Playwright is not installed, the script prints the install command — relay it to the user but **continue** the modernization. Screenshots are nice-to-have, not blocking.

### Step 5 — APPLY MODERNIZATION

For each planned file, edit ONLY the class attribute (`className` for React, `class` for Vue/Svelte) and styling files, applying rules from:
- `references/design-system-2026.md` — palette, scale, radius, shadow tokens
- `references/tailwind-modernization.md` — exhaustive old→new class mapping
- `references/component-patterns.md` — Button / Card / Input / Modal / Nav templates
- `references/animation-motion.md` — transitions and entrance animations
- `references/dark-mode.md` — dark variant strategy
- `references/brand-color-strategy.md` — **always** substitute `indigo` placeholders with the `classPrefix` returned by Step 1. Read this *before* writing any `bg-indigo-*` / `text-indigo-*` / `ring-indigo-*` class.
- If `tailwind.flavor === 'v4'`: **also** read `references/tailwind-v4.md` — class names, theme block, and CSS-first config differ from v3.
- If `runtime === 'vue'`: **also** read `references/frameworks/vue.md` — `class=` vs `:class=`, array/object bindings, `<script setup>` boundaries.
- If `runtime === 'svelte'`: **also** read `references/frameworks/svelte.md` — `class=` vs `class:foo={bool}` directives, `+layout.svelte` conventions.

Apply globally — but branch on Tailwind flavor:

**For Tailwind v3 projects:**
- Replace `app/globals.css` body styles with `templates/globals.css.tpl` (preserving any user-specific imports).
- Ensure `tailwind.config.{js,ts}` extends `templates/tailwind.config.tpl` — merge, don't overwrite.
- Add `templates/design-tokens.css.tpl` content to globals (CSS variables for light/dark).

**For Tailwind v4 projects:**
- Replace `app/globals.css` with `templates/globals.v4.css.tpl` (preserving any user-specific imports and any existing `@theme` brand-color tokens — *merge*, don't overwrite the theme block).
- **Do NOT create or modify `tailwind.config.js`** — v4 is CSS-first. If one exists, leave it alone.
- **Do NOT install `tailwindcss-animate`** — `animate-in` / `fade-in` etc. are built-in in v4.

**Per file, before saving, mentally diff:** "Did I touch anything besides the class attribute, wrappers, or styling files?" If yes — revert that change.

Framework-specific reminders:
- **Vue:** never edit `<script>` / `<script setup>` blocks. `:class` array/object bindings: edit string literals only, never variables.
- **Svelte:** never edit `<script>` blocks. `class:foo={bool}` directives: leave the keys alone — they're tied to component state. Only the static `class=` portion is fair game.

### Step 6 — SCREENSHOT AFTER

Run `node scripts/screenshot.mjs after`. Same routes, saves to `.ui-modernizer/screenshots/after/`. Then run `node scripts/compose-before-after.mjs` to produce `.ui-modernizer/before-after.png`.

### Step 7 — REPORT

Run `node scripts/report.mjs`. It generates `.ui-modernizer/report.md` with:
- File-by-file diff summary
- Embedded before/after thumbnails
- Rollback command
- Optional: detected risks (e.g., "I changed `className` on a `<form>` — verify focus styles still work")

### Step 8 — DONE

Reply with exactly this structure (substituting real numbers / paths):

> ✨ **Modernized N files** across M routes.
>
> - Before/After: `.ui-modernizer/before-after.png`
> - Full report: `.ui-modernizer/report.md`
> - Rollback: `npx ui-modernizer rollback` (or copy back from `.ui-modernizer-backup/<timestamp>/`)
>
> Run `npm run dev` to see it live.

## 2 · Rollback mode

If the user says "rollback" / "undo" / "revert ui-modernizer", run `node scripts/backup.mjs --restore-latest`. Confirm restored file count.

## 3 · Sub-modes (advanced)

### Style profiles (v0.4 — pluggable)

Style profiles are Markdown files describing a specific aesthetic. They override `design-system-2026.md` defaults. Two sources:

| Source | Trigger phrase | What happens |
|---|---|---|
| Built-in | "modernize this UI like **Linear**" / `notion` / `vercel` / `stripe` / `shadcn` / `raycast` / `apple` | Load `references/style-references/<slug>.md` |
| User-local | "modernize this UI using `./my-brand.md`" | Load the user-supplied path |
| (none) | "modernize this UI" | Default blend — no specific profile |

**Profile resolution workflow:**

1. If the user did not specify a profile and asks "what styles are available?", run `node scripts/list-profiles.mjs --pretty` and show the table.
2. Resolve the profile path (built-in slug → `references/style-references/<slug>.md`; otherwise treat as a filesystem path).
3. **Always validate** before applying: `node scripts/validate-profile.mjs <path>`. If errors > 0, stop and surface them.
4. Read the profile's `## Tokens`, `## Patterns`, `## Don'ts` sections. Treat `## Don'ts` as strict — never violate.
5. See `references/profile-pluggability.md` for the full override hierarchy (brand color > profile > design-system default).

## 4 · Failure modes & recovery

| Symptom | Action |
|---|---|
| `next dev` won't start | Skip screenshots, continue, note in report |
| Tailwind config is JS but uses ESM exports | Detect, adapt accordingly |
| File uses `styled-components` or CSS Modules | Skip that file, list it in report as "out of MVP scope" |
| Vue file uses `:class="computedVar"` (variable, not array/object) | Skip — modernizer doesn't trace variables. Note in report. |
| Svelte file has `class:foo={...}` directives | Edit only the static `class=` portion; leave directives alone. Verify referenced classes still exist after edits. |
| Git working tree is dirty | Warn the user once; proceed if they confirm |
| `@babel/parser` not available | Fall back to regex-guarded className edits (only edit lines containing `className=`) |
| `detect-stack` says v4 but globals.css has `@tailwind base;` | Project is mid-migration. STOP — ask the user whether to treat as v3 or v4. |
| `detect-brand` returns `single-value` shape | Only use `bg-<prefix>-600`; for hover use `bg-<prefix>-600/90` (opacity), not `-700` which may not exist. |
