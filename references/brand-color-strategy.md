# Brand color strategy

The modernizer wants the project's UI to feel like *itself*, not like a generic indigo template. That means: if the project already has a brand color, **use it as the accent** instead of `indigo-600`.

## 1 · How detection works

`scripts/detect-brand.mjs` returns one of three states:

| `classPrefix` | What it means | What the modernizer should do |
|---|---|---|
| `brand` / `primary` / `accent` | Project has a named scale | Use `bg-<prefix>-600`, `text-<prefix>-600` etc. throughout |
| `indigo` (fallback) | Nothing detected | Use `indigo` as the default accent (no change from v0.1 behaviour) |

The detector reports `shape`:
- `full-scale` → 6+ shades defined (50, 100, …, 900). Modernizer can use freely.
- `partial-scale` → 2–5 shades defined. Stick to defined shades; fall back to indigo for missing ones.
- `single-value` → just one hex/oklch value. Use it for `-600` only; use neutral grays for hovers/rings.

## 2 · Applying the brand color in class strings

Wherever the v0.1 rules said `indigo`, branch on `classPrefix`:

| v0.1 (indigo only) | v0.2 (brand-aware) |
|---|---|
| `bg-indigo-600 hover:bg-indigo-500` | `bg-<classPrefix>-600 hover:bg-<classPrefix>-500` |
| `text-indigo-600 dark:text-indigo-400` | `text-<classPrefix>-600 dark:text-<classPrefix>-400` |
| `ring-indigo-500` (focus) | `ring-<classPrefix>-500` |
| `bg-indigo-50 dark:bg-indigo-500/10` (badge) | `bg-<classPrefix>-50 dark:bg-<classPrefix>-500/10` |

If `shape === 'single-value'`, only `-600` is safe. For hover, use `-700` only if it can be derived — otherwise use `opacity-90`:
```
bg-brand-600 hover:bg-brand-600/90
```

## 3 · Don't touch what the user already chose

If a button is currently `bg-emerald-600` and the brand is `brand`, **don't override** — leave the deliberate accent. Only replace generic blue/indigo with brand. The rule is:

| Original accent | Brand exists? | Action |
|---|---|---|
| `blue-*`, `indigo-*` (generic) | yes | Replace with brand |
| `blue-*`, `indigo-*` (generic) | no | Keep, but bump shade per `tailwind-modernization.md` |
| `emerald-*`, `rose-*`, `amber-*`, etc. (semantic) | either | Keep — it likely means status (success / error / warning) |
| Already brand-named (`brand-*`) | either | Keep |

## 4 · Edge cases

- **No brand color in any file** → fallback to indigo, no warning.
- **Two competing names** (e.g. both `brand` and `primary` defined) → prefer `brand`. Note both in the report.
- **Detected name conflicts with a Tailwind built-in palette name** (e.g. `red`, `blue`) → the project's custom palette wins (Tailwind extend semantics). Log this clearly in the report.
- **Tailwind v4 + brand detected from CSS vars** → append/merge `@theme { --color-<name>-*: ... }` rather than touching a JS config.
