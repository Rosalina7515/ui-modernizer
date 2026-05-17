---
name: apple
displayName: Apple (HIG)
version: 1.0
vibe: clean, premium, larger radii, soft shadows, glass everywhere
darkFirst: false
recommendedFonts:
  - "-apple-system"
  - "SF Pro Text"
  - "Inter"
  - "system-ui"
authors:
  - ui-modernizer
references:
  - https://developer.apple.com/design/human-interface-guidelines
tags:
  - premium
  - consumer
  - hardware
---

## When to use

Pick Apple HIG when the project targets **consumers** (not developers), **hardware-adjacent products** (apps for devices), or anything that wants a **premium, slightly aspirational** feel. Avoid for dense data dashboards (will feel toy-like at high density).

## Tokens

- Background: `bg-[#f5f5f7] dark:bg-black` (Apple's signature off-white, not pure)
- Surface: `bg-white dark:bg-[#1d1d1f]` (warm dark-mode card, not pure zinc)
- Border: `border-black/[0.08] dark:border-white/[0.08]`
- Text: `text-[#1d1d1f] dark:text-white`
- Text muted: `text-[#6e6e73] dark:text-[#a1a1a6]`
- Accent: `bg-[#0071e3] hover:bg-[#0077ed]` (Apple blue)
- Hero ambient: `bg-gradient-to-b from-white via-[#f5f5f7] to-white`

## Patterns

- **Button (primary, pill-shaped — Apple signature):**
  `inline-flex items-center justify-center rounded-full bg-[#0071e3] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0077ed] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0071e3] focus-visible:ring-offset-2`
- **Button (secondary):**
  `inline-flex items-center justify-center rounded-full border border-[#0071e3] px-5 py-2.5 text-sm font-medium text-[#0071e3] transition-colors hover:bg-[#0071e3]/[0.04]`
- **Card:**
  `rounded-2xl bg-white dark:bg-[#1d1d1f] p-8 shadow-[0_4px_24px_-2px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] dark:ring-white/[0.06]`
- **Glass nav (Apple loves these):**
  `sticky top-0 z-40 backdrop-blur-xl bg-white/72 dark:bg-black/72 border-b border-black/[0.04] dark:border-white/[0.06]`

## Sample composition

```tsx
<section className="bg-[#f5f5f7] dark:bg-black py-24">
  <div className="mx-auto max-w-5xl text-center">
    <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-[#1d1d1f] dark:text-white">
      {title}
    </h1>
    <p className="mx-auto mt-4 max-w-2xl text-xl text-[#6e6e73] dark:text-[#a1a1a6]">
      {subtitle}
    </p>
    <div className="mt-8 flex items-center justify-center gap-4">
      <button className="rounded-full bg-[#0071e3] px-6 py-3 text-base font-medium text-white hover:bg-[#0077ed]">
        Buy
      </button>
      <button className="text-base font-medium text-[#0071e3] hover:underline">
        Learn more &rarr;
      </button>
    </div>
  </div>
</section>
```

## Don'ts

- **No `rounded-md` on hero CTAs** — Apple uses pill (`rounded-full`) for primary actions and `rounded-2xl` for cards. Anything smaller looks generic.
- **No tight typography** — body is `text-base` or `text-lg`. Headlines are huge (`text-5xl` minimum).
- **No flat backgrounds in hero sections** — at minimum a gentle vertical gradient, often `from-white via-[#f5f5f7] to-white`.
- **No 90° corners anywhere** — even badges are pill-shaped.
- **No dense lists** — Apple is generous: `space-y-6` minimum.
