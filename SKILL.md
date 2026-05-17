---
name: ui-modernizer
description: Modernize a React + Next.js + Tailwind UI to 2026 SaaS-grade design (Linear / Vercel / Stripe / shadcn aesthetic). Trigger when the user says "modernize this UI", "modernize the UI", "upgrade the design", "make this look modern", "make the UI look like Linear/Vercel/Stripe", or otherwise asks to refresh / level-up the visual design of a frontend codebase. Do NOT use for new feature work, bug fixes, or business logic changes.
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

Run `node scripts/detect-stack.mjs` (relative to this skill's directory). Confirm:
- React present
- Next.js present (App Router preferred; Pages Router supported)
- Tailwind CSS v3+ configured

If any check fails: STOP and tell the user which prerequisite is missing. Do not proceed.

### Step 2 — PLAN

Walk the project's UI files (`app/**/*.{tsx,jsx}`, `components/**/*.{tsx,jsx}`, `src/**/*.{tsx,jsx}`). Build a short plan listing:
- Files to modify (max 30 in MVP — if more, focus on `app/` and shared `components/`)
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

For each planned file, edit ONLY `className` strings and styling files, applying rules from:
- `references/design-system-2026.md` — palette, scale, radius, shadow tokens
- `references/tailwind-modernization.md` — exhaustive old→new class mapping
- `references/component-patterns.md` — Button / Card / Input / Modal / Nav templates
- `references/animation-motion.md` — transitions and entrance animations
- `references/dark-mode.md` — dark variant strategy

Also apply globally:
- Replace `app/globals.css` body styles with `templates/globals.css.tpl` (preserving any user-specific imports).
- Ensure `tailwind.config.{js,ts}` extends `templates/tailwind.config.tpl` — merge, don't overwrite.
- Add `templates/design-tokens.css.tpl` content to globals (CSS variables for light/dark).

**Per file, before saving, mentally diff:** "Did I touch anything besides `className`, wrappers, or styling files?" If yes — revert that change.

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

- "modernize this UI like **Linear**" → load `references/style-references/linear.md` and prefer its tokens.
- Same for `vercel`, `stripe`, `shadcn`. Default style is a blend.

## 4 · Failure modes & recovery

| Symptom | Action |
|---|---|
| `next dev` won't start | Skip screenshots, continue, note in report |
| Tailwind config is JS but uses ESM exports | Detect, adapt accordingly |
| File uses `styled-components` or CSS Modules | Skip that file, list it in report as "out of MVP scope" |
| Git working tree is dirty | Warn the user once; proceed if they confirm |
| `@babel/parser` not available | Fall back to regex-guarded className edits (only edit lines containing `className=`) |
