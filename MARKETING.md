# Marketing playbook — ui-modernizer

> 内部文档。所有发布文案候选都在这里。

---

## 🎬 GIF demo script (15 seconds, screen recording)

录制 ASCII：

```
[0:00] Terminal — clean state, dark theme, cursor blinking
[0:01] Type:  npx ui-modernizer
[0:03] Output:  ✨ ui-modernizer v0.1.0 installed.
[0:05] cd ~/my-saas-app && npm run dev  (briefly show ugly UI in browser)
[0:08] Switch to Claude Code, type:  "modernize this UI"
[0:09] Claude streams: "🔍 Detecting stack... ✓ React + Next.js + Tailwind"
[0:10]                "📋 Planning 14 files..."
[0:11]                "📸 Capturing before screenshots..."
[0:12]                "✏️ Modernizing app/page.tsx..."
[0:13]                "✨ Done. 14 files modernized. Report: .ui-modernizer/report.md"
[0:14] Cut to browser — refresh — new UI fades in (Vercel-grade)
[0:15] Cut to before/after side-by-side composite — hold 2s
```

Tools: OBS / asciinema for terminal; `cleanshot` for browser; `gifski` for compression.

Target file size: < 4 MB so GitHub README inlines it without "click to expand".

---

## 🐦 Twitter / X launch thread

### Tweet 1 (the hook — must work standalone as a quote-tweet bait)

```
i typed "modernize this UI" into claude code.

it diffed my whole frontend, turned 'bg-gray-100' into a
linear/vercel-grade dashboard, and screenshot'd the before/after
without me lifting a finger.

open source. one prompt. 1 npx command.

🧵👇
```

(Attach the **before/after composite** as the first image — the entire thread lives or dies on this image.)

### Tweet 2 (proof)

```
zero business logic touched.

it edits only className strings, your tailwind config,
and your globals.css. every modified file is backed up.
rollback in one command.

it's a Claude Code Skill — runs locally, no API calls.
```

(Attach the **report.md screenshot** — looks audit-trail-professional.)

### Tweet 3 (variety / pick-a-vibe)

```
> modernize this UI like Linear
> modernize this UI like Vercel
> modernize this UI like Stripe
> modernize this UI like shadcn

every aesthetic is a markdown file. fork it, edit it, ship your
own brand modernizer in one PR.
```

(Attach a **4-up image** of the same dashboard rendered in each style.)

### Tweet 4 (the close)

```
ui-modernizer — MIT, no signup, no API key, no telemetry

  npx ui-modernizer

⭐ github.com/Rosalina7515/ui-modernizer

every star convinces me to push the Vue version sooner.
```

### One-shot fallback tweet (if you only have one shot)

```
you've been writing `bg-gray-100` for 6 years. claude can fix that in 30 seconds:

  npx ui-modernizer

then in claude code: "modernize this UI"

[before / after image]

MIT · runs locally · github.com/Rosalina7515/ui-modernizer
```

---

## 🟧 Hacker News title candidates

Pick **one**. Rank-tested patterns: concrete, unhyped, slightly self-deprecating.

1. **Show HN: ui-modernizer – a Claude Code Skill that upgrades old Tailwind UIs**
   *(Safe, clear, hits the right tribe. Recommended.)*
2. **Show HN: One prompt to modernize a React + Tailwind app to 2026 design**
3. **Show HN: I taught Claude to turn `bg-gray-100` into Linear-grade UI**
   *(Spicier. Higher variance.)*
4. **Show HN: A Markdown-only rules engine for AI-driven UI modernization**
   *(For the architecture-curious crowd.)*

**Top comment to plant** (reply from second account is bad form — instead, prepare a reply to the inevitable "isn't this just sed?" comment):

> Honest question. Two reasons it's not: (1) JSX className strings are often computed via `cn()` / `clsx()`, so static regex misses them; (2) the *interesting* decisions are context-dependent — a `<button>` and a `<a>` styled as a button need different focus rings, an `<input>` inside `<form>` needs different spacing than free-floating. That judgement is where the LLM earns its keep. The deterministic stuff (backup, diff, screenshots) is plain Node. Happy to walk through specific cases.

---

## 🐙 Product Hunt launch copy

### Tagline (60 char max)

`Modernize any React + Tailwind UI with one Claude prompt.`

### Description (260 char)

```
ui-modernizer is a Claude Code Skill that turns dated React + Next.js + Tailwind UIs into 2026 SaaS-grade design (Linear / Vercel / Stripe / shadcn vibes). One npx, one prompt. Runs locally. Auto before/after screenshots. Full backup + rollback. MIT.
```

### Maker comment (post within 1 minute of launch)

```
Hey PH 👋

I built this because I keep starting weekend projects, ship something functional, and then spend 4× longer trying to make it look like it belongs on a Vercel screenshot. ui-modernizer is the part of the brain that already knows "spacing should be 6 not 2, accent should be indigo not blue, every interactive element needs a focus ring" — externalized into a Claude Code Skill.

A few things that make it not-a-toy:

- It refuses to touch business logic. Only className strings, globals.css, tailwind.config.
- Every run produces a diff report and a before/after composite — so you can post it on Twitter without rerunning anything.
- Rollback is one command.
- It's mostly markdown + a handful of node scripts. Forking it to encode your own brand is a 10-minute job.

Eternal thanks if you star, but the real ask: tell me which framework I should support next. Vue and Svelte are tied at 50/50 in my head.
```

### First-day responses you should prepare

| Question | Reply |
|---|---|
| "Is it open source?" | MIT. Link to repo. |
| "Does it leak my code?" | No. Runs entirely in your local Claude Code; nothing leaves your machine except the screenshots you take locally. |
| "What about Vue/Svelte?" | On the roadmap as v0.3. Want it sooner — star + 👍 on issue #1. |
| "I don't use Tailwind." | MVP is Tailwind-only. CSS Modules / styled-components are v0.4. |

---

## 🐦 Reddit submissions

**r/nextjs:**
> Title: `[OSS] One Claude Code prompt to modernize a Next.js + Tailwind app`
> Body: Link + before/after image. Don't oversell — Reddit smells marketing.

**r/SideProject:**
> Title: `built a Claude Code skill that modernizes dated React UIs in one prompt`
> Body: Personal story (the "weekend project that looks bad" angle). PH and Twitter links.

**r/tailwindcss:**
> Title: `i externalized my "make this look modern" tailwind class-replacement instincts into a forkable skill`
> Body: Focus on the `tailwind-modernization.md` mapping table — that's catnip for this sub.

Avoid:
- r/programming (kills small projects, low ROI)
- r/javascript (too broad)

---

## 📈 GitHub Trending strategy

GitHub Trending sorts by **stars-per-day** within a language/topic.

To land on Trending → **JavaScript** or **TypeScript** (whichever the repo's primary lang reports), you typically need **150–300 stars in 24h** (varies by season).

Day-0 launch sequence (Friday morning Pacific is optimal):

1. **T-7 days:** repo published privately. README polished. assets/ has the real GIF + before/after PNG.
2. **T-1 day:** repo flipped public. README rev'd one final time. `topics:` set to `claude-code-skill`, `tailwindcss`, `nextjs`, `ai-developer-tools`, `design-system`.
3. **T-0 morning:**
   - 09:00 PT — Tweet the thread.
   - 09:15 PT — Post to HN.
   - 09:30 PT — Post to PH (if it's a Tuesday/Wednesday — those rank best on PH).
   - 09:45 PT — Reddit posts staggered (r/SideProject first, others +60min).
   - 10:00 PT — DM 5–10 dev-tool friends who care about UI; ask honest opinions (not for stars).
4. **T+1:** reply to every comment on every platform within 2 hours. This is the single biggest predictor of sustained growth.
5. **T+3:** ship a small follow-up — usually one new style profile based on what people asked for. Tweet a 1-liner with the new pattern. Re-engages without a relaunch.

---

## 🧲 Long-tail (after launch week)

- **Weekly:** Tweet one "Friday modernization" — show one open-source project's UI before/after (ask the maintainer first if it's small).
- **Monthly:** Blog post or thread breaking down one design system (Linear, Vercel, Stripe) → the literal rules go in `references/style-references/`. Content == product.
- **Issue triage:** Treat every "could it do X?" issue as a content prompt. Convert ideas into rules; rules into PRs.

---

## ⚠️ Don't

- Don't compare to v0.dev / lovable / shadcn-ui directly — different problems. Position as "the upgrade path for code you already wrote."
- Don't say "AI" more than necessary. Say "Claude Code Skill" — it's the more specific, more trustworthy term in dev-tools twitter.
- Don't ask for stars in tweet 1. Ask in tweet 4 (or the equivalent late position).
- Don't post the same exact text on Twitter, HN, PH. Algorithms (and humans) flag cross-posters.
