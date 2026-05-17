<div align="center">

**English** · [简体中文](./README.zh-CN.md)

# ✨ ui-modernizer

### One prompt. Modern UI.

**A Claude Code Skill that turns your tired React + Tailwind UI into a 2026 SaaS product.**
Linear · Vercel · Stripe · shadcn — pick a vibe, get the look.

```
"modernize this UI"
```

<br />

<!-- Replace once recorded -->
![demo](./assets/demo.gif)

<br />

[![npm](https://img.shields.io/npm/v/ui-modernizer.svg?style=flat&color=000)](https://www.npmjs.com/package/ui-modernizer)
[![license](https://img.shields.io/badge/license-MIT-000.svg?style=flat)](./LICENSE)
[![claude code](https://img.shields.io/badge/Claude%20Code-Skill-D97757?style=flat)](https://claude.com/claude-code)
[![stars](https://img.shields.io/github/stars/Rosalina7515/ui-modernizer?style=flat&color=000)](https://github.com/Rosalina7515/ui-modernizer/stargazers)

</div>

---

## 🤯 Before / After

<div align="center">

![before-after](./assets/before-after.png)

*Same component tree. Same business logic. Zero touched handlers.*
*Only `className` strings, design tokens, and globals.*

</div>

---

## 🚀 Install in 10 seconds

```bash
npx ui-modernizer
```

That's it. The Skill is now available in any project you open with Claude Code.

Then in Claude Code, in any React + Next.js + Tailwind project:

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
modernize this UI like Linear
modernize this UI like Vercel
modernize this UI like Stripe
modernize this UI like shadcn
```

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
3. **Diffed** — a `report.md` with file-by-file `+/-` counts + before/after screenshots.
4. **Reversible** — one command:

```bash
npx ui-modernizer rollback
```

---

## 📸 Screenshots (automatic)

If you have [Playwright](https://playwright.dev) installed, ui-modernizer spins up your dev server, captures every detected route, and produces a side-by-side composite. README-grade, no work.

```bash
npm install -D playwright sharp
npx playwright install chromium
```

Don't have it? No problem — modernization still runs, screenshots are skipped.

---

## ⚙️ How it works

```
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ DETECT   │ → │ PLAN     │ → │ BACKUP   │ → │ SHOOT #1 │
│ stack    │   │ files    │   │ originals│   │ before   │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                   ↓
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│ DONE     │ ← │ REPORT   │ ← │ SHOOT #2 │ ← │ APPLY    │
│ ✨        │   │ .md      │   │ after    │   │ rules    │
└──────────┘   └──────────┘   └──────────┘   └──────────┘
```

Knowledge is split into Markdown files that Claude reads on demand — so you can:

- **Fork** the skill, edit `references/style-references/<your-brand>.md`, get a custom modernizer for your design system.
- **Audit** every rule the AI applies, in plain English, in `references/tailwind-modernization.md`.

---

## 📦 Supported stacks (MVP)

| | Status |
|---|---|
| React | ✅ |
| Next.js (App Router) | ✅ |
| Next.js (Pages Router) | ✅ |
| Tailwind CSS v3+ | ✅ |
| Tailwind CSS v4 | 🛠 soon |
| Vue + Tailwind | 🛠 v0.3 |
| Svelte + Tailwind | 🛠 v0.3 |
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

- [ ] **v0.2** — Tailwind v4 support, custom brand color detection
- [ ] **v0.3** — Vue 3 + Svelte 5 support
- [ ] **v0.4** — Pluggable style profiles (community brands)
- [ ] **v0.5** — Component substitution (auto-install shadcn primitives)
- [ ] **v1.0** — Visual regression checks against design-system specs

---

## 🤝 Contributing

ui-modernizer is mostly **prompt + Markdown rules**. Adding a new aesthetic is one PR:

1. Create `references/style-references/<your-style>.md`
2. Add a small "When this style?" paragraph
3. Optional: contribute before/after screenshots to `assets/`

No build, no tests, no TypeScript ceremony. Open a PR.

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
The visual judgement here needs an LLM. A CLI would be doing dumb regex replaces; the Skill leverages Claude's design taste while keeping side effects (screenshots, backups, diffs) deterministic.

---

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Rosalina7515/ui-modernizer&type=Date)](https://star-history.com/#Rosalina7515/ui-modernizer&Date)

---

<div align="center">

**An open-source project for developers who care about UI craft.**

[MIT](./LICENSE)

</div>
