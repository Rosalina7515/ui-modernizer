# shadcn Component Map

Per-pattern rewriting guide. After `scripts/detect-substitutions.mjs` reports a candidate, use this file to write the replacement JSX.

> All examples below are React JSX. For Vue, replace `className=` with `class=` and use `<slot />` for children. For Svelte, replace `className=` with `class=`.

## 1 · `<button>` → `<Button>`

**Detect signal:** `<button>` element with at least one of `bg-(indigo|blue|primary|zinc|red|rose|emerald|amber)-(500|600|700)` OR `border` + `bg-white`.

**Install:** `npx shadcn@latest add button`

**Import to add:**
```tsx
import { Button } from '@/components/ui/button';
```

**Variant detection rules:**

| Classes contain | Use variant |
|---|---|
| `bg-indigo-*`, `bg-primary`, `bg-brand-*`, `bg-blue-*` (solid fill) | `default` |
| `border` + `bg-white` / `bg-zinc-50` + `text-zinc-*` (outlined) | `outline` |
| `hover:bg-zinc-100`, `hover:bg-accent`, no border, no background by default | `ghost` |
| `bg-red-*`, `bg-rose-600` | `destructive` |
| `underline` + `text-indigo-*` (text-only) | `link` |
| `bg-zinc-100`, `bg-zinc-200`, `bg-secondary` | `secondary` |

**Size detection rules:**

| Classes contain | Use size |
|---|---|
| `h-8` or `text-xs` and `px-3` | `sm` |
| `h-9` (default Tailwind) or `text-sm` and `px-4` | `default` (omit `size`) |
| `h-10`, `text-base`, `px-6 py-3` | `lg` |
| Only an icon as child, square aspect (`h-9 w-9`) | `icon` |

**Rewrite example:**

```diff
- <button
-   className="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98]"
-   onClick={handleClick}
- >
-   Submit
- </button>
+ <Button onClick={handleClick}>Submit</Button>
```

**Preserve:** `onClick`, `disabled`, `type`, `form`, `aria-*`, `data-*`, `ref`. Drop only `className` (the variant replaces it).

## 2 · `<input>` → `<Input>`

**Detect signal:** `<input type="text|email|password|search|number|tel|url"` OR no type attribute (defaults to text).

**Install:** `npx shadcn@latest add input`

**Import:**
```tsx
import { Input } from '@/components/ui/input';
```

**Rewrite example:**

```diff
- <input
-   type="email"
-   placeholder="you@company.com"
-   value={email}
-   onChange={(e) => setEmail(e.target.value)}
-   className="block w-full rounded-md border-0 ring-1 ring-inset ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-sm placeholder:text-zinc-400 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
- />
+ <Input
+   type="email"
+   placeholder="you@company.com"
+   value={email}
+   onChange={(e) => setEmail(e.target.value)}
+ />
```

**Skip:** `<input type="checkbox|radio|range|file|color|date">` — those need different shadcn components, out of v0.5 scope.

## 3 · `<textarea>` → `<Textarea>`

**Detect signal:** `<textarea>` element with any modernized class string.

**Install:** `npx shadcn@latest add textarea`

```tsx
import { Textarea } from '@/components/ui/textarea';
```

**Rewrite:** same idea as Input — drop `className`, keep all other props.

## 4 · `<label>` → `<Label>`

**Detect signal:** `<label className="text-sm font-medium ...">` or similar.

**Install:** `npx shadcn@latest add label`

```tsx
import { Label } from '@/components/ui/label';
```

**Rewrite:** drop `className` (Label provides sane defaults). Keep `htmlFor`.

## 5 · "Badge-shaped span" → `<Badge>`

**Detect signal:** `<span className="...rounded-full ... px-2 py-0.5 text-xs ...">` containing exactly one of `bg-(emerald|rose|amber|indigo|zinc)-(50|100|500/10)` + matching text color.

**Install:** `npx shadcn@latest add badge`

```tsx
import { Badge } from '@/components/ui/badge';
```

**Variant detection rules:**

| Classes contain | Use variant |
|---|---|
| `bg-zinc-100`, `bg-secondary` | `secondary` |
| `border`, no background | `outline` |
| `bg-red-*`, `bg-rose-*` | `destructive` |
| everything else (`bg-emerald-50`, `bg-indigo-50`, etc.) | `default` |

**Rewrite example:**

```diff
- <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 ring-1 ring-inset ring-emerald-600/20">
-   Active
- </span>
+ <Badge>Active</Badge>
```

## 6 · Card pattern → `<Card>` + `<CardHeader>` + `<CardContent>`

**Detect signal:** `<div>` with `rounded-xl` + (`shadow-sm` or `ring-1 ring-zinc-200`) + `bg-white` (or `bg-card`) + `p-(4|6|8)`, containing at least one `<h3>` or `<h2>` child.

**Install:** `npx shadcn@latest add card`

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
```

**Rewrite example:**

```diff
- <div className="rounded-xl bg-white dark:bg-zinc-950 p-6 shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800 transition-shadow hover:shadow-md">
-   <h3 className="text-base font-semibold tracking-tight">{title}</h3>
-   <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{description}</p>
-   <div className="mt-4">{children}</div>
- </div>
+ <Card>
+   <CardHeader>
+     <CardTitle>{title}</CardTitle>
+     <CardDescription>{description}</CardDescription>
+   </CardHeader>
+   <CardContent>{children}</CardContent>
+ </Card>
```

**Skip** if the card has more than ~3 direct children (probably custom layout) or contains a form (substitution would split an `<input>` from its label).

## 7 · Separator pattern → `<Separator>`

**Detect signal:** `<hr>` OR `<div className="h-px ... bg-(zinc-200|border|zinc-800) ...">`.

**Install:** `npx shadcn@latest add separator`

```tsx
import { Separator } from '@/components/ui/separator';
```

**Rewrite:**

```diff
- <hr className="my-6 border-t border-zinc-200 dark:border-zinc-800" />
+ <Separator className="my-6" />
```

## 8 · Avatar pattern → `<Avatar>`

**Detect signal:** `<img>` with `rounded-full` + small `h-(7|8|9|10) w-(7|8|9|10)`.

**Install:** `npx shadcn@latest add avatar`

```tsx
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
```

**Rewrite:**

```diff
- <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full" />
+ <Avatar className="h-8 w-8">
+   <AvatarImage src={user.avatarUrl} alt={user.name} />
+   <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
+ </Avatar>
```

## 9 · Universal preserve list

For every substitution, **always preserve**:
- Every event handler (`onClick`, `onChange`, `onSubmit`, etc.)
- Every `ref`, `key`
- Every `aria-*`, `data-*`, `role`
- Every `disabled`, `required`, `readOnly`, `autoFocus`
- Every Tailwind class that is NOT structural-styling (e.g. `mx-auto`, `mt-4` — those are layout, keep them in `className`)
- Original `id`, `name`, `value`, `placeholder`, `type` (for inputs)

## 10 · Universal drop list

For every substitution, **always drop**:
- Class strings that describe the visual identity now owned by the shadcn component (palette, padding, border, radius, shadow, hover state, focus ring).

You'll often end up with a much shorter `className` — just margin / layout utilities. That's expected.
