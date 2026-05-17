# Changelog

All notable changes to ui-modernizer will be documented here. Format inspired by [Keep a Changelog](https://keepachangelog.com).

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
