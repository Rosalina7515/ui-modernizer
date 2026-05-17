# Dark Mode

Dark mode is non-negotiable in 2026. Every color class gets a `dark:` variant.

## Setup

1. In `tailwind.config.{js,ts}` set:
   ```
   darkMode: 'class',
   ```

2. In `app/layout.tsx`, add the class strategy:
   ```tsx
   <html lang="en" className="dark" suppressHydrationWarning>
   ```

3. If the project doesn't have a theme toggle and the user wants one, suggest adding `next-themes` — but only if they confirm.

## Body baseline

```tsx
<body className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased">
```

## Common dark variants

| Light | Dark |
|---|---|
| `bg-white` | `dark:bg-zinc-950` |
| `bg-zinc-50` | `dark:bg-zinc-900` |
| `bg-zinc-100` | `dark:bg-zinc-900` |
| `text-zinc-900` | `dark:text-zinc-100` |
| `text-zinc-700` | `dark:text-zinc-300` |
| `text-zinc-500` | `dark:text-zinc-400` |
| `border-zinc-200` | `dark:border-zinc-800` |
| `ring-zinc-200` | `dark:ring-zinc-800` |
| `divide-zinc-200` | `dark:divide-zinc-800` |

## Accent colors in dark mode

- Indigo CTAs stay `bg-indigo-600 hover:bg-indigo-500` in both modes.
- Indigo links: `text-indigo-600 dark:text-indigo-400`.
- Tinted backgrounds (badges): `bg-indigo-50 dark:bg-indigo-500/10`.

## Validation

After applying dark mode, mentally toggle `<html class="dark">` and check:
- Text contrast on every surface.
- Borders visible (don't disappear into background).
- Focus rings visible (`focus-visible:ring-offset-2` may need `ring-offset-zinc-950` in dark).
