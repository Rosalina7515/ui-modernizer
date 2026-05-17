# Svelte 5 modernization notes

Loaded when `detect-stack.mjs` reports `runtime === 'svelte'`. Tailwind classes are identical to React/Vue; the differences are attribute syntax and Svelte's `class:` directives.

## 1 · Attribute name

In Svelte, it's `class` (no `className`):

```svelte
<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
```

→

```svelte
<button class="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98]">
```

## 2 · Class directives — `class:foo={bool}` and shorthand `class:foo`

Svelte has a native syntax for conditional classes:

```svelte
<div class="base" class:active={isActive} class:open={isOpen}>
<div class="base" class:disabled> <!-- shorthand: class:disabled={disabled} -->
```

**Modernizer rules:**
- Edit the *static* `class="..."` portion using the normal mappings.
- **Do not** rename the keys of `class:` directives — they're often tied to component state / variant names (e.g. `class:active`).
- **Do** verify each key references a class that still exists after your edits. If you renamed `bg-gray-100` → `bg-zinc-50`, but a `class:bg-gray-100={highlight}` directive still references the old name, flag it in the report — the user must decide.

## 3 · `style` blocks

A `.svelte` file can contain `<style>` (scoped by default) and `<style global>` blocks. Don't touch these. Tailwind utility classes in markup are independent of these blocks.

## 4 · `<script>` blocks

Never touched. State (`$state`, `$derived` in Svelte 5; `let` in Svelte 4) is logic, not visual.

## 5 · `+layout.svelte` / `+page.svelte` (SvelteKit)

SvelteKit conventions:
- `src/routes/+layout.svelte` — the global wrapper. Add body-level classes here (`bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 antialiased`).
- `src/routes/+page.svelte` — page content.

Don't modify `+page.server.ts`, `+page.ts`, `+layout.server.ts` — those are load functions, not visuals.

## 6 · Globals CSS

- **SvelteKit:** typically `src/app.css` or `src/app.postcss`, imported from `src/routes/+layout.svelte`:
  ```svelte
  <script>
    import '../app.css';
  </script>
  ```
- **Vite + Svelte:** usually `src/app.css` imported from `src/main.ts`.

`detect-stack.mjs` reports the found path.

## 7 · Tailwind v4 in Svelte

Same as React/Vue — v4 uses `@import "tailwindcss"` + `@theme` block in the same CSS file. No SvelteKit-specific tweaks needed.

## 8 · Skip list

The modernizer **does not edit** these in Svelte files:
- `class:foo={...}` directive keys (only the static `class=` part).
- `style="..."` inline styles.
- `bind:` / `on:` / `use:` / `transition:` / `in:` / `out:` / `animate:` directives — those are behavior, not styling.
- Component props (`<Button variant="primary" />`) — the styling lives inside the component, not at the call site.
