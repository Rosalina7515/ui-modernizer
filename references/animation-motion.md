# Animation & Motion

The single biggest "feels modern" lever, after typography. Apply liberally but consistently.

## Default transition

Every interactive element:
```
transition-colors duration-150
```

For things that move (modals, sheets, dropdowns):
```
transition-all duration-200 ease-out
```

## Entrance animations (requires `tailwindcss-animate`)

```
Card grid items:  animate-in fade-in slide-in-from-bottom-2 duration-500
Modal:            animate-in fade-in zoom-in-95 duration-200
Toast:            animate-in slide-in-from-bottom-4 fade-in duration-300
Dropdown:         animate-in fade-in slide-in-from-top-1 duration-150
Skeleton:         animate-pulse
```

If `tailwindcss-animate` is not in the project's `tailwind.config`, ask the user to add it once. Provide the command:
```
npm install -D tailwindcss-animate
```
and add `require('tailwindcss-animate')` to the plugins array.

If the user declines, fall back to plain CSS keyframes (write into `globals.css`).

## Hover lift (cards)

```
transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
```

Use sparingly — only on click-through cards, not dense lists.

## Button press

```
transition-transform duration-100 active:scale-[0.98]
```

## Page-level fade-in (Next.js App Router)

Add to `app/layout.tsx` root div:
```tsx
<div className="animate-in fade-in duration-500">
  {children}
</div>
```

## Reduced motion

Always respect `prefers-reduced-motion`. Tailwind handles this if you use `motion-safe:` and `motion-reduce:` variants. For default-heavy motion, scope animations with `motion-safe:`:
```
motion-safe:animate-in motion-safe:fade-in
```

## Don't

- Don't animate on scroll for default cards (heavy, distracting).
- Don't use `animate-bounce` / `animate-spin` on UI chrome — only on loaders.
- Don't use durations > 500ms for UI feedback.
