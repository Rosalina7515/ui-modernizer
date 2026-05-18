<div align="center">

**English** · [简体中文](./ROADMAP.zh-CN.md)

</div>

# 🗺️ Roadmap

> This is a living document. Plans may shift based on community feedback. Open an [issue](https://github.com/Rosalina7515/ui-modernizer/issues) or [discussion](https://github.com/Rosalina7515/ui-modernizer/discussions) if you want to weigh in.

**Today: v0.5 shipped.** Multi-framework (React/Vue/Svelte), Tailwind v3+v4, brand-color detection, 7 pluggable style profiles, opt-in shadcn component substitution.

The path to v1.0 is deliberately broken into focused minor versions — each one a small, testable, shippable improvement. v1.0 itself is the "production-ready promise", not another feature drop.

---

## 🎯 Path to v1.0

### v0.6 — Visual regression checks

**Goal:** Catch accidental visual breakage before the user sees it.

- Capture pre-modernization DOM structure + computed styles for each detected route.
- Re-capture after modernization; diff against the baseline.
- Surface structural deltas (missing elements, swapped tags) and computed-style deltas (color contrast drops, font-size changes > N%) in `report.md` under a new `Risks` section.
- Pure detection — never auto-revert. The user decides what's intentional vs. accidental.

### v0.7 — AST safety net

**Goal:** Replace regex-based class detection with a real parser. This is the single change that makes "we never touch your logic" *provable*.

- React/JSX: `@babel/parser` + `@babel/traverse` for `className=` only edits.
- Vue: `vue-eslint-parser` for `class=` + `:class=` in `<template>`.
- Svelte: `svelte/compiler` parser for `class=` (skip `class:foo={bool}` directives).
- Edge cases handled: template literals, `cn()`/`clsx()` calls, conditional expressions, dynamic spreads.
- Fallback to regex only when AST parsing fails (e.g. .mdx files).

### v0.8 — Project-level config + dry-run

**Goal:** Let teams encode policy. Let CI preview changes without applying them.

- `.ui-modernizer.json` schema: default profile, ignore globs, max files per run, strict mode (refuse if any file would be skipped).
- `node scripts/dry-run.mjs` — outputs the full plan in JSON, exits with non-zero count if changes would apply. Drop-in for `pre-commit` / CI.
- Loader respects `.ui-modernizer.json` at the project root.

### v0.9 — Polish, tests, error UX

**Goal:** No "WTF" moments for first-time users.

- Vitest unit tests for every script in `scripts/` (target ~80% coverage).
- Error codes (`UMD-001`…`UMD-NNN`), each with a one-paragraph remedy + docs link.
- Unified JSON output shape: `{ ok, command, version, timestamp, payload, errors }` for every script.
- Progress indicators during long operations (substitution, screenshots).
- "Did you mean?" suggestions for typo'd profile names.

### v1.0 — Stable, documented, marketed

**Goal:** The production-ready promise + the big-bang relaunch.

- Lock the API surface. No breaking changes until v2.0.
- Documentation site (likely VitePress / Astro Starlight) at `ui-modernizer.dev`.
  - Search via Algolia DocSearch (free for OSS).
  - Profile gallery with real screenshots.
  - Live playground showing before/after code for each rule.
- Self-improvement: use ui-modernizer to modernize its own docs site. Meta + great demo.
- Launch sequence: HN Show, Product Hunt, dev-tools newsletters. Target: 1k+ stars on launch day, first paying enterprise inquiry.

---

## 🚀 Post-1.0 (the v1.x series)

Each v1.x minor opens a new audience. They are independent and can ship in any order based on demand.

### v1.1 — Tests & stability hardening

Vitest coverage to 90%+, E2E fixtures from 10+ real OSS projects, badge it everywhere. Goal: contributor confidence — "I can submit a PR without fear of breaking things."

### v1.2 — Docs site polish

If v1.0 ships a basic docs site, v1.2 makes it shine: searchable profile gallery, interactive playground, contributor leaderboard, sponsor wall. Self-modernizes again on each release as a meta-demo.

### v1.3 — AI generation (reverse direction)

The mirror feature: instead of modernizing existing UI, **generate** new UI from a description, using the project's detected style + chosen profile.

> "create a settings page like Linear"

Combines style profiles + shadcn substitution to scaffold complete components. Largest market-expansion lever in the entire roadmap.

### v1.4 — A11y audit + auto-fix

Detect missing `aria-*`, `alt`, semantic roles, low color-contrast pairs. Auto-add `aria-label`s, focus rings, skip-links, keyboard semantics. Opens the door to compliance-sensitive enterprises (the buyers with real budgets).

### v1.5 — Performance audit

Same idea, different axis: oversized images, unoptimized fonts, hydration blockers, layout shift triggers. Lighthouse-style report appended to `report.md`. Suggests `next/image` / `nuxt-image` / `enhanced-img` replacements.

### v1.6 — IDE extensions

VS Code first; JetBrains second. Inline "modernizable" highlights, code lenses, right-click "Modernize this component". Bridges chat-based usage and in-editor usage.

### v1.7 — Figma → code

Read Figma API, translate selected frame into project-style code (using current profile + shadcn substitution). Captures the designer audience and the design-handoff workflow that bigger orgs care about.

### v1.8 — More design systems

shadcn is the default in v0.5. v1.8 adds substitution flavors for: Material 3 / MUI, Fluent UI, Carbon, Ant Design / Arco. Each one is mostly a new rule file in `references/shadcn-component-map.md`-style format.

### v1.9 — React Native + Expo

NativeWind is React Native's Tailwind. Most className modernization logic transfers. Different audience (RN devs), reuses ~70% of the existing engine.

### v2.0 — Full plugin system

Style profiles in v0.4 were a *taste* of plugin extensibility. v2.0 generalizes: detector plugins, rule plugins, reporter plugins, installer plugins — modeled on ESLint's plugin ecosystem.

When a community plugin marketplace exists, the project becomes self-sustaining. This is the long-term moat.

---

## 🧭 Strategic notes

- **Each v0.x release is a separate marketing window.** Don't rush to 1.0.
- **The real moat isn't code, it's the profile library, the rule precision, and the ecosystem bindings** (Claude Code, Tailwind, shadcn). Every release should reinforce one of these three.
- **Roadmap order is suggestive, not fixed.** If v1.3 (AI generation) suddenly has 5× the demand of v1.2 (docs polish), swap them.
- **No v0.x ships without an updated `references/` doc.** Knowledge is product here, not just code.

---

## ⛔ Explicit non-goals

We will **not** pursue these directions:

- Full IDE rewrite (Cursor / Windsurf clones).
- Hosted SaaS version. ui-modernizer stays local-first.
- Closed-source / paid premium tiers. Keep it MIT, build the moat in profile contributions.
- Direct competition with v0.dev / Lovable / bolt.new. They are *generation tools*. ui-modernizer is a *modernization tool* — the upgrade path for code that already exists.

---

## 🗳 Want to influence the roadmap?

- 👍 a [GitHub issue](https://github.com/Rosalina7515/ui-modernizer/issues) to vote.
- Start a [discussion](https://github.com/Rosalina7515/ui-modernizer/discussions) for big-picture proposals.
- Submit a profile PR — fastest way to ship something this week.
