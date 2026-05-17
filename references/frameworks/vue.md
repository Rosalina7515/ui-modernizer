# Vue 3 modernization notes

Loaded when `detect-stack.mjs` reports `runtime === 'vue'`. Tailwind classes themselves are identical to React; what differs is the **attribute name** and the **template syntax**.

## 1 · Attribute name

In Vue templates, the class attribute is `class`, **not** `className`. When applying any rule from `tailwind-modernization.md`, edit:

```vue
<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
```

→

```vue
<button class="inline-flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 active:scale-[0.98]">
```

## 2 · Dynamic class bindings

Vue has three dynamic forms. The modernizer edits **string-literal segments** in each; it never reorders the binding logic.

| Form | What to do |
|---|---|
| `<div class="foo bar">` | Edit the string normally. |
| `<div :class="['foo', isActive && 'bar']">` | Edit each string literal inside the array. Skip variables. |
| `<div :class="{ 'foo': true, 'bar-active': isActive }">` | Edit only the **keys** that look like Tailwind classes. Boolean values untouched. |
| `<div :class="computedClasses">` (computed/variable) | **Skip and note in report.** Modernizer doesn't trace variables. |

You may have **both** static `class` and dynamic `:class` on the same element — that's idiomatic Vue. Edit both independently.

## 3 · `<style scoped>` and `<style>`

A Vue SFC may have `<style scoped>` or plain `<style>` blocks with raw CSS. The modernizer leaves these alone (the project's choice). Only Tailwind classes in `<template>` are touched.

If the project uses both Tailwind utilities **and** custom CSS in scoped styles, that's fine — they don't conflict.

## 4 · `<script setup>` / Options API

Modernizer never touches `<script>` or `<script setup>` blocks. State, refs, reactive logic — all untouched. Same hard rule as the React case.

## 5 · Globals CSS / Nuxt project structure

- **Nuxt 3** typically uses `assets/css/main.css` (registered in `nuxt.config.ts` via `css: ['~/assets/css/main.css']`).
- **Vite + Vue** typically uses `src/style.css` or `src/assets/main.css` imported from `src/main.ts`.

`detect-stack.mjs` reports the found path as `configFiles.globalsCSS`. If none is found, ask the user where the global CSS lives before injecting tokens.

## 6 · Nuxt-specific gotchas

- **Auto-imports**: Nuxt auto-imports components from `components/`. This doesn't affect the modernizer — class strings live in templates and are edited directly.
- **`<NuxtPage />` / `<NuxtLayout />`**: don't add `class=` to these unless you're sure they forward attributes. Prefer wrapping in a `<div class="...">`.
- **`color-mode` module**: if `@nuxtjs/color-mode` is installed, the project already has a dark-mode strategy. Don't add a competing one — adapt to it (it sets `.dark` on `<html>` already).

## 7 · Tailwind v4 in Vue/Nuxt

If `tailwind.flavor === 'v4'`, the `@theme` block goes in the same globals.css the project already loads. No JS config needed. See `references/tailwind-v4.md`.

## 8 · Skip list

The modernizer **does not edit** these in Vue files:
- `v-bind` shorthand `:class` with a *non-array, non-object* variable (`:class="x"`).
- `:style` (inline style strings — different problem).
- Tag attributes other than `class` and `:class`.
- Slot content passed via props.
