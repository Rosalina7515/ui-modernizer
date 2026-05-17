---
name: raycast
displayName: Raycast
version: 1.0
vibe: dark-first, dense, command-bar energy, vibrant accents on near-black
darkFirst: true
recommendedFonts:
  - "Inter"
  - "SF Pro Text"
  - "ui-sans-serif"
authors:
  - ui-modernizer
references:
  - https://www.raycast.com
tags:
  - dense
  - developer-tools
  - command-bar
---

## When to use

Pick Raycast when the UI is **keyboard-driven**, **dense**, or **tool-like** — launcher, CLI dashboards, search interfaces, dev tools, AI playgrounds. Lean into dark mode and let one or two vibrant gradients carry the brand.

## Tokens

- Background: `bg-[#1a1a1a]` (true near-black, not zinc-950)
- Surface: `bg-[#222222]`
- Surface (hover/focus row): `bg-[#2a2a2a]`
- Border: `border-white/[0.06]`
- Text: `text-white`, muted `text-[#a0a0a0]`
- Accent (Raycast red): `bg-[#ff6363] hover:bg-[#ff5050]`
- Signature gradient (used once, hero only): `bg-[linear-gradient(135deg,_#ff6363,_#ff8c42,_#ffd93d)]`
- Kbd hint: `bg-white/[0.08] text-[#a0a0a0] rounded px-1.5 py-0.5 text-[10px] font-medium`

## Patterns

- **Button (primary):**
  `inline-flex items-center justify-center gap-2 rounded-md bg-[#ff6363] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#ff5050] active:scale-[0.98]`
- **List row (the workhorse — Raycast UI is rows):**
  `flex h-9 items-center gap-2 rounded-md px-2 text-sm text-white transition-colors hover:bg-white/[0.06] aria-[selected=true]:bg-white/[0.08]`
- **Card:**
  `rounded-lg bg-[#222222] p-4 ring-1 ring-white/[0.06]`
- **Input (command bar):**
  `block w-full rounded-md border-0 bg-[#222222] px-3 py-2 text-sm text-white placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#ff6363]/40`

## Sample composition

```tsx
<div className="bg-[#1a1a1a] min-h-screen text-white">
  <div className="mx-auto max-w-2xl pt-24">
    <input className="block w-full rounded-lg bg-[#222222] px-4 py-3 text-base placeholder:text-[#666] focus:outline-none focus:ring-2 focus:ring-[#ff6363]/40" placeholder="Search..." />
    <div className="mt-3 rounded-lg bg-[#222222] ring-1 ring-white/[0.06] divide-y divide-white/[0.04]">
      {/* rows */}
    </div>
  </div>
</div>
```

## Don'ts

- **No light-mode-first design** — Raycast lives in the dark. If light mode is required, treat it as an afterthought (zinc-50 surfaces, otherwise mirror).
- **No `rounded-xl` or larger** — Raycast UI tops out at `rounded-lg`. Tighter feels more tool-grade.
- **No large vertical padding** — row height is `h-8` / `h-9`. Density is the brand.
- **No shadow-heavy surfaces** — borders + subtle inner glow only. Drop shadows feel weakly skeuomorphic here.
- **No multiple gradient surfaces** — the signature gradient is used **once** per page, always in a hero or large icon. Spam ruins it.
