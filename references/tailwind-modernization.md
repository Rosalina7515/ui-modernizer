# Tailwind Modernization — exhaustive class mapping

Apply these substitutions when editing `className` strings. Mappings are ordered: when several apply, prefer the more specific match.

> **Mechanical rule:** the LEFT column is what you're likely to see in dated codebases. The RIGHT column is the 2026 replacement. If multiple options are listed, pick the first one unless context suggests otherwise.
>
> **Brand color note (v0.2):** Every occurrence of `indigo` below is a *placeholder*. Substitute the `classPrefix` returned by `scripts/detect-brand.mjs` (one of `brand` / `primary` / `accent` / `indigo` fallback) before writing the class. See `references/brand-color-strategy.md` for the substitution rules and edge cases.
>
> **Tailwind v4 note (v0.2):** If `scripts/detect-stack.mjs` reports `tailwind.flavor === 'v4'`, also read `references/tailwind-v4.md` — a handful of class names changed (`flex-shrink-0` → `shrink-0`, etc.) and the globals.css template is different.
>
> **Framework note (v0.3):** Every example below uses JSX (`className=`). The Tailwind class strings themselves are **framework-agnostic** — they work identically in:
> - React / Next.js → `className="..."`
> - Vue / Nuxt → `class="..."` (and inside `:class="[...]"` / `:class="{...}"`)
> - Svelte / SvelteKit → `class="..."` (leave `class:foo={bool}` directives alone)
>
> Use `classAttr` from `detect-stack.mjs` output when emitting code. See `references/frameworks/vue.md` and `references/frameworks/svelte.md` for the per-framework rules.

## Colors — grays

| Find | Replace with |
|---|---|
| `bg-gray-50` | `bg-zinc-50 dark:bg-zinc-900` |
| `bg-gray-100` | `bg-zinc-100 dark:bg-zinc-900` |
| `bg-gray-200` | `bg-zinc-200 dark:bg-zinc-800` |
| `bg-gray-800` | `bg-zinc-800 dark:bg-zinc-100` (if used as text-on-light) |
| `bg-gray-900` | `bg-zinc-900 dark:bg-zinc-100` |
| `text-gray-400` | `text-zinc-400 dark:text-zinc-500` |
| `text-gray-500` | `text-zinc-500 dark:text-zinc-400` |
| `text-gray-600` | `text-zinc-600 dark:text-zinc-400` |
| `text-gray-700` | `text-zinc-700 dark:text-zinc-300` |
| `text-gray-800` | `text-zinc-800 dark:text-zinc-200` |
| `text-gray-900` | `text-zinc-900 dark:text-zinc-100` |
| `border-gray-200` | `border-zinc-200 dark:border-zinc-800` |
| `border-gray-300` | `border-zinc-200 dark:border-zinc-800` |
| `divide-gray-200` | `divide-zinc-200 dark:divide-zinc-800` |

## Colors — accents

| Find | Replace with |
|---|---|
| `bg-blue-500` (button) | `bg-indigo-600 hover:bg-indigo-500` |
| `bg-blue-600` (button) | `bg-indigo-600 hover:bg-indigo-500` |
| `text-blue-500` (link) | `text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4` |
| `text-blue-600` (link) | `text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4` |
| `bg-red-500` | `bg-rose-600 hover:bg-rose-500` |
| `text-red-500` | `text-rose-600 dark:text-rose-400` |
| `bg-green-500` | `bg-emerald-600 hover:bg-emerald-500` |
| `text-green-500` | `text-emerald-600 dark:text-emerald-400` |
| `bg-yellow-400` (warning) | `bg-amber-500` |

## Border radius

| Find | Replace with |
|---|---|
| `rounded` (alone) | `rounded-md` |
| `rounded-sm` | `rounded-md` |
| `rounded-md` (on card) | `rounded-xl` |
| `rounded-lg` (on modal) | `rounded-2xl` |

(Don't downgrade — only upgrade. If a class is already at or above target, leave it.)

## Shadows

| Find | Replace with |
|---|---|
| `shadow` (alone) | `shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800` |
| `shadow-md` (on card resting) | `shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800` (resting), `hover:shadow-md` (hover) |
| `shadow-lg` (modal) | `shadow-xl ring-1 ring-zinc-900/5` |

## Typography

| Find | Replace with |
|---|---|
| `text-2xl font-bold` | `text-2xl font-semibold tracking-tight` |
| `text-3xl font-bold` | `text-3xl md:text-4xl font-semibold tracking-tight` |
| `text-4xl font-bold` | `text-4xl md:text-5xl font-semibold tracking-tight` |
| `font-bold` (on heading) | `font-semibold tracking-tight` |
| `text-base text-gray-600` (body) | `text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed` |

## Buttons (full class block replace)

Match a button-like element (`<button>` or `<a>` with `bg-*` and `text-white`):

| Legacy pattern | Modern replacement |
|---|---|
| `bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded` | `inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98]` |
| `border border-gray-300 px-4 py-2 rounded` (secondary) | `inline-flex items-center justify-center gap-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2 text-sm font-medium text-zinc-900 dark:text-zinc-100 shadow-sm transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2` |

## Inputs

| Find | Replace with |
|---|---|
| `border border-gray-300 px-3 py-2 rounded` | `block w-full rounded-md border-0 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-shadow` |

## Cards

| Find | Replace with |
|---|---|
| `bg-white p-4 rounded shadow` | `bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-shadow hover:shadow-md` |
| `bg-white p-6 rounded-lg shadow-md` | `bg-white dark:bg-zinc-950 p-6 rounded-xl shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-shadow hover:shadow-md` |

## Spacing — common gentle upgrades

| Find | Replace with |
|---|---|
| `p-2` (on card) | `p-6` |
| `p-3` (on card) | `p-6` |
| `m-2` (between siblings) | use parent `space-y-4` or `gap-4` instead |
| `py-8` (page section) | `py-16 md:py-24` |
| `space-y-2` (form fields) | `space-y-4` |

## Add (never replace — append) to every interactive element

Append these if not already present on `<button>`, `<a>`, role="button", `<input>`, `<select>`, `<textarea>`:

```
transition-colors duration-150
focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
```

## Body / layout root

In `app/layout.tsx` (or `_app.tsx`), ensure the body has:

```
className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased"
```

## What NOT to change

- Class names that look like CSS module / styled-component identifiers (kebab-case, includes `_` hash).
- Classes inside string concatenation you can't statically resolve — skip and note in report.
- `cn(...)` / `clsx(...)` calls: only modify the string literal arguments, never the variable arguments.
