---
name: notion
displayName: Notion
version: 1.0
vibe: warm, calm, generous whitespace — a workspace, not an app
darkFirst: false
recommendedFonts:
  - "Inter"
  - "ui-sans-serif"
  - "system-ui"
authors:
  - ui-modernizer
references:
  - https://www.notion.com
tags:
  - workspace
  - reading
  - long-form
---

## When to use

Pick Notion when the project is content-heavy — docs, wikis, knowledge bases, long-form dashboards. Notion's aesthetic optimizes for *reading*, not *scanning*. Avoid for dense data UIs (use Linear instead).

## Tokens

- Background: `bg-white dark:bg-[#191919]`
- Surface: `bg-[#f7f6f3] dark:bg-[#202020]` (warm off-white, never pure)
- Border: `border-[#e9e9e7] dark:border-white/[0.08]` (very soft)
- Text body: `text-[#37352f] dark:text-[#dcdcdc]` (warm near-black, not zinc)
- Text muted: `text-[#787774] dark:text-[#9b9b9b]`
- Accent: `bg-[#2eaadc] hover:bg-[#1b9bd0]` (Notion blue), used sparingly
- Selection: `bg-[#2eaadc]/20`

## Patterns

- **Button (primary):**
  `inline-flex items-center justify-center rounded-md bg-[#2eaadc] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#1b9bd0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2eaadc] focus-visible:ring-offset-2`
- **Button (default, the workhorse — borderless, hover-bg):**
  `inline-flex items-center justify-center rounded-md px-2 py-1 text-sm text-[#37352f] dark:text-[#dcdcdc] hover:bg-[#efefee] dark:hover:bg-white/[0.05] transition-colors`
- **Card:**
  `rounded-md bg-white dark:bg-[#191919] p-4 ring-1 ring-[#e9e9e7] dark:ring-white/[0.08] hover:bg-[#fbfbfa] dark:hover:bg-white/[0.02] transition-colors`
- **Input:**
  `block w-full rounded-md border-0 ring-1 ring-inset ring-[#e9e9e7] dark:ring-white/[0.08] bg-white dark:bg-[#191919] px-3 py-1.5 text-sm placeholder:text-[#787774] focus:ring-2 focus:ring-inset focus:ring-[#2eaadc]`

## Sample composition

```tsx
<section className="mx-auto max-w-3xl px-6 py-16">
  <h1 className="text-4xl font-semibold tracking-tight text-[#37352f] dark:text-[#dcdcdc]">
    {title}
  </h1>
  <p className="mt-3 text-base text-[#787774] dark:text-[#9b9b9b] leading-relaxed">
    {subtitle}
  </p>
</section>
```

## Don'ts

- **No ring + shadow combos** — Notion uses one or the other, never both stacked.
- **No vibrant accent palette** — the only color is Notion blue, used for links and primary CTAs only. Everything else is grayscale.
- **No tight density** — minimum `p-4` on cards, `space-y-4` on stacks. Notion is generous.
- **No serif fonts** — Notion is sans-only despite being reading-focused.
- **No animated entrances on every list item** — feels jittery, not calm.
