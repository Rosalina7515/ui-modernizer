# Design System 2026 — canonical tokens

Use these tokens as the source of truth when modernizing. They reflect what the top SaaS UIs (Linear, Vercel, Stripe, Raycast, shadcn/ui) actually ship in 2026.

## 1 · Color palette

**Replace generic grays with zinc/neutral and use indigo/violet as accent unless the project has its own brand color.**

| Old | New |
|---|---|
| `bg-gray-*`, `text-gray-*` | `bg-zinc-*`, `text-zinc-*` |
| `bg-white` (cards) | `bg-white dark:bg-zinc-950` |
| `bg-blue-500` (CTA) | `bg-indigo-600 hover:bg-indigo-500` |
| `text-red-500` (error) | `text-rose-600 dark:text-rose-400` |
| `text-green-500` (success) | `text-emerald-600 dark:text-emerald-400` |

Brand override: if `tailwind.config` defines a `brand.*` palette, use `brand-600` for CTAs instead of `indigo-600`.

## 2 · Typography

```
Hero:       text-4xl md:text-5xl font-semibold tracking-tight
Page title: text-2xl font-semibold tracking-tight
Section:    text-lg font-medium
Body:       text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed
Muted:      text-sm text-zinc-500 dark:text-zinc-400
Code/mono:  font-mono text-[13px]
```

**Always** add `tracking-tight` to headings ≥ `text-xl`. Default `font-sans` should map to Inter or Geist; if neither is loaded, add Inter via `next/font`.

## 3 · Spacing scale

| Context | Class |
|---|---|
| Inline padding (buttons, inputs) | `px-3 py-2` (sm) / `px-4 py-2.5` (md) / `px-5 py-3` (lg) |
| Card padding | `p-6` (md), `p-8` (lg) |
| Section vertical | `py-16 md:py-24` |
| Stack gap (vertical) | `space-y-4` (tight), `space-y-6` (default), `space-y-8` (loose) |
| Grid gap | `gap-6` default, `gap-8` for cards |

**Rule:** never use `p-2 m-2` mixed with `p-4`. Pick one rhythm per region.

## 4 · Border radius

| Element | Class |
|---|---|
| Button | `rounded-md` |
| Input | `rounded-md` |
| Card | `rounded-xl` |
| Modal | `rounded-2xl` |
| Avatar | `rounded-full` |
| Badge | `rounded-full` or `rounded-md` |

## 5 · Shadows & borders

```
Card resting:   shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800
Card hover:     shadow-md
Modal:          shadow-xl ring-1 ring-zinc-900/5
Floating:       shadow-lg
Subtle divider: border-t border-zinc-200/60 dark:border-zinc-800/60
```

**Modern signature:** prefer `ring-1 ring-zinc-200` over plain `border` for cards — it stays crisp at any zoom and pairs naturally with `shadow-sm`.

## 6 · Interactive states

Every interactive element gets these three states:

```
transition-colors duration-150
hover:bg-zinc-50 dark:hover:bg-zinc-900
focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
```

Buttons additionally get `active:scale-[0.98] transition-transform duration-100`.

## 7 · Glassmorphism (use sparingly — top nav and modals only)

```
backdrop-blur-md bg-white/70 dark:bg-zinc-950/70 ring-1 ring-zinc-200/60 dark:ring-zinc-800/60
```

## 8 · Motion

```
Entrance:  animate-in fade-in slide-in-from-bottom-2 duration-300
Modal:     animate-in fade-in zoom-in-95 duration-200
Skeleton:  animate-pulse bg-zinc-200 dark:bg-zinc-800 rounded
```

Requires `tailwindcss-animate`. If not installed, ask the user before adding.

## 9 · Dark mode

- All colors must include a `dark:` variant.
- Default body: `bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100`.
- Enable in `tailwind.config`: `darkMode: 'class'`. Add `<html class="dark">` toggling via `next-themes` if user opts in.

## 10 · Layout rhythm

- Page max width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Reading max width: `max-w-2xl mx-auto`
- Sidebar: `w-64 shrink-0`
- Top nav height: `h-14` (compact) or `h-16` (standard)
