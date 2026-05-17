---
name: shadcn
displayName: shadcn/ui
version: 1.0
vibe: the de-facto modern Tailwind look, zinc grays, semantic CSS variables
darkFirst: false
recommendedFonts:
  - "Inter"
  - "ui-sans-serif"
  - "system-ui"
authors:
  - ui-modernizer
references:
  - https://ui.shadcn.com
tags:
  - default
  - ergonomic
  - component-library
---

# shadcn/ui style

**Signature:** the de-facto modern Tailwind aesthetic. Zinc grays, CSS variables, semantic color naming.

## Tokens

CSS variables — drop into `globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --card: 0 0% 100%;
  --card-foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5% 64.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

## Patterns

Use **semantic** class names everywhere — they resolve to the CSS vars above and flip light/dark automatically.

- **Button (primary):** `bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 text-sm font-medium`
- **Button (secondary):** `bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-md px-4 py-2 text-sm font-medium`
- **Card:** `bg-card text-card-foreground rounded-lg border shadow-sm p-6`
- **Input:** `flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-ring`
- **Muted text:** `text-muted-foreground`
- **Border:** `border-border`

## When to use

Default mode for "modernize this UI" without a specific brand. Most ergonomic for future component installs via `npx shadcn add`.

## Don'ts

- **No hard-coded color classes** (`bg-zinc-100`, `text-gray-600`). Use semantic tokens (`bg-muted`, `text-muted-foreground`) so dark mode flips for free.
- **No competing radius scale** — the CSS var `--radius` is the source of truth. Use `rounded-lg` (resolves to `--radius`), `rounded-md` (radius-2px), `rounded-sm` (radius-4px). Don't introduce `rounded-xl` etc. unless you also extend the radius scale in `tailwind.config`.
- **No `dark:` variants on semantic classes** — `bg-card` already adapts. Adding `dark:bg-card-foreground` would be wrong.
