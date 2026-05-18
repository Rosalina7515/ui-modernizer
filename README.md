<div align="center">

**English** · [简体中文](./README.zh-CN.md)

# ✨ ui-modernizer

### One prompt. Modern UI.

**A Claude Code Skill that turns your tired React / Vue / Svelte + Tailwind UI into a 2026 SaaS product.**
Linear · Vercel · Stripe · shadcn — pick a vibe, get the look.

```
"modernize this UI"
```

<br />

<img src="./assets/before-after.png" alt="ui-modernizer · before / after demo" width="100%" />

<br />
<br />

[![npm](https://img.shields.io/npm/v/ui-modernizer.svg?style=flat&color=000)](https://www.npmjs.com/package/ui-modernizer)
[![license](https://img.shields.io/badge/license-MIT-000.svg?style=flat)](./LICENSE)
[![claude code](https://img.shields.io/badge/Claude%20Code-Skill-D97757?style=flat)](https://claude.com/claude-code)
[![stars](https://img.shields.io/github/stars/Rosalina7515/ui-modernizer?style=flat&color=000)](https://github.com/Rosalina7515/ui-modernizer/stargazers)

</div>

---

## 🚀 Install in 10 seconds

```bash
npx ui-modernizer
```

That's it. The Skill is now available in any project you open with Claude Code.

Then in Claude Code, in any React/Vue/Svelte + Tailwind project:

```
modernize this UI
```

Claude takes it from there.

---

## 🎯 What you get

| | Before | After |
|---|---|---|
| Spacing | `p-2 m-2` everywhere | systematic 4 / 6 / 8 rhythm |
| Color | `gray-*` + `blue-500` | zinc + indigo + brand-aware |
| Radius | `rounded` | `rounded-md` / `rounded-xl` per element |
| Shadow | `shadow` | `shadow-sm` + `ring-1 ring-zinc-200` |
| Hover | none | `transition-colors hover:bg-zinc-50` everywhere |
| Focus | invisible | `focus-visible:ring-2 ring-indigo-500` |
| Dark mode | doesn't exist | every color has a `dark:` variant |
| Motion | nope | `animate-in fade-in slide-in-from-bottom-2` |
| Typography | `font-bold` shouting | `font-semibold tracking-tight` whispering |

Pick a vibe:

```
modernize this UI like Linear      # ultra-tight, mono-ish, soft purples (dark-first)
modernize this UI like Vercel      # monochrome, brutalist, hero gradients
modernize this UI like Stripe      # trust + precision, layered gradients, premium
modernize this UI like shadcn      # semantic CSS vars, the de-facto modern default
modernize this UI like Notion      # warm, calm, generous whitespace
modernize this UI like Raycast     # dark, dense, command-bar energy
modernize this UI like Apple       # premium pills, soft shadows, glass
```

Or **bring your own profile** — point at any local Markdown file matching the spec:

```
modernize this UI using ./design/our-brand.md
```

See [Pluggable style profiles](./references/profile-pluggability.md) and [the profile format spec](./references/style-references/_PROFILE_FORMAT.md).

### 🧱 Want shadcn primitives? Just ask.

```
modernize this UI and use shadcn components
```

ui-modernizer scans your project for hand-rolled `<button>` / `<input>` / `<span class="badge-shape">` / card patterns, runs `npx shadcn@latest add ...` for what it needs, then rewrites them to `<Button>` / `<Input>` / `<Badge>` / `<Card>` — preserving every event handler, ref, and `aria-*` along the way.

Read [`references/component-substitution.md`](./references/component-substitution.md) for the full workflow and safety rules.

---

## 🛡️ Safe by design

ui-modernizer **only touches your visual layer**:

- ✅ `className` string contents
- ✅ Layout wrapper `<div>`s (additive only)
- ✅ `globals.css`, `tailwind.config`
- ❌ Event handlers
- ❌ State, effects, fetches, server actions
- ❌ Props or component signatures
- ❌ Anything that could break your app

Every run is:

1. **Planned** — you see exactly what it'll change, before it changes.
2. **Backed up** — full copy of every modified file in `.ui-modernizer-backup/<timestamp>/`.
3. **Diffed** — a `report.md` with file-by-file `+/-` counts.
4. **Reversible** — one command:

```bash
npx ui-modernizer rollback
```

---

## ⚙️ How it works

```
┌──────────┐   ┌──────────┐   ┌──────────┐
│ DETECT   │ → │ PLAN     │ → │ BACKUP   │
│ stack    │   │ files    │   │ originals│
└──────────┘   └──────────┘   └──────────┘
                                    ↓
┌──────────┐   ┌──────────┐   ┌──────────┐
│ DONE ✨  │ ← │ REPORT   │ ← │ APPLY    │
│          │   │ .md      │   │ rules    │
└──────────┘   └──────────┘   └──────────┘
```

Knowledge is split into Markdown files that Claude reads on demand — so you can:

- **Fork** the skill, edit `references/style-references/<your-brand>.md`, get a custom modernizer for your design system.
- **Audit** every rule the AI applies, in plain English, in `references/tailwind-modernization.md`.

---

## 📦 Supported stacks

| | Status |
|---|---|
| React + Next.js (App Router) | ✅ |
| React + Next.js (Pages Router) | ✅ |
| Vue 3 + Nuxt 3 | ✅ |
| Vue 3 + Vite | ✅ |
| Svelte 5 + SvelteKit | ✅ |
| Svelte 5 + Vite | ✅ |
| Tailwind CSS v3 | ✅ |
| Tailwind CSS v4 | ✅ |
| styled-components | ❌ out of scope |
| CSS Modules | ❌ out of scope |

---

## 🧪 Try it on the included demo

```bash
git clone https://github.com/Rosalina7515/ui-modernizer
cd ui-modernizer/examples/before && npm install && npm run dev
# → http://localhost:3000  (looks dated on purpose)

cd ../after && npm install && npm run dev
# → http://localhost:3001  (what ui-modernizer produces)
```

---

## 🗺️ Roadmap

### Released

- [x] **v0.1** — MVP: React + Next.js + Tailwind v3, 10 modernization rules, backup/rollback
- [x] **v0.2** — Tailwind v4 support + custom brand color detection
- [x] **v0.3** — Vue 3 (Nuxt / Vite) + Svelte 5 (SvelteKit / Vite) support
- [x] **v0.4** — Pluggable style profiles (7 built-in + bring-your-own Markdown)
- [x] **v0.5** — Component substitution (auto-install shadcn primitives)
- [x] **v0.6** — Visual regression checks (diff DOM + computed styles before/after)
- [x] **v0.7** — AST safety net (`@babel/parser` for JSX/TSX; tightened scanners for Vue/Svelte)
- [x] **v0.8** — `.ui-modernizer.json` config + `--dry-run` mode
- [x] **v0.9** — Polish: `UMD-NNN` error codes, unified JSON output, Vitest tests, "did you mean?" suggestions

### Upcoming

- [ ] **v1.0** — Stable API, docs site at ui-modernizer.dev, big-bang launch
- [ ] **v1.1** — Tests & stability hardening (90%+ coverage)
- [ ] **v1.2** — Docs site polish (interactive playground, profile gallery)
- [ ] **v1.3** — AI reverse generation — "create a settings page like Linear"
- [ ] **v1.4** — A11y audit + auto-fix
- [ ] **v1.5** — Performance audit (images, fonts, hydration)
- [ ] **v1.6** — VS Code + JetBrains plugins
- [ ] **v1.7** — Figma → code
- [ ] **v1.8** — More design systems (Material 3, Fluent, Carbon, Ant)
- [ ] **v1.9** — React Native + Expo (via NativeWind)
- [ ] **v2.0** — Full plugin system (ESLint-style ecosystem)

Full reasoning, strategic notes, and explicit non-goals → **[ROADMAP.md](./ROADMAP.md)**.

---

## 🤝 Contributing

ui-modernizer is mostly **prompt + Markdown rules**. Adding a new aesthetic is one PR:

1. Copy [`references/style-references/notion.md`](./references/style-references/notion.md) as a starting template.
2. Edit the frontmatter (`name` must match your filename) and fill in `## Tokens`, `## Patterns`, `## Don'ts`.
3. Validate locally: `node scripts/validate-profile.mjs references/style-references/<your>.md` — must exit 0.
4. Open a PR. CI re-runs the validator on every push.

Read the [profile format spec](./references/style-references/_PROFILE_FORMAT.md) before you start. It's short.

### Running tests

```bash
npm install
npm test
```

(Uses Vitest — `npm test` runs once, `npm run test:watch` watches.)

---

## ❓ FAQ

**Does it call an external API?**
No. It runs entirely inside your local Claude Code. Your code never leaves your machine.

**Will it change my business logic?**
By design, no. Hard rules in `SKILL.md` forbid it, and every run produces an auditable diff.

**What if I hate the result?**
`npx ui-modernizer rollback` — every modified file is restored from a timestamped backup.

**Does it work without Tailwind?**
Not in MVP. CSS Modules and styled-components are on the roadmap (`v0.4+`).

**Why "Skill" and not a CLI?**
The visual judgement here needs an LLM. A CLI would be doing dumb regex replaces; the Skill leverages Claude's design taste while keeping side effects (backups, diffs, rollback) deterministic.

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Rosalina7515/ui-modernizer&type=Date)](https://star-history.com/#Rosalina7515/ui-modernizer&Date)

---

<div align="center">

**An open-source project for developers who care about UI craft.**

[MIT](./LICENSE)

</div>
