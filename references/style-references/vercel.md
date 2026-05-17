# Vercel style

**Signature:** monochrome, Geist font, brutalist simplicity, generous whitespace, signature gradients in hero only.

## Tokens

- Background: `bg-black` dark, `bg-white` light
- Surface: `bg-[#0a0a0a]` dark, `bg-white` light
- Border: `border-[#1f1f1f] dark:border-[#1f1f1f]` (very subtle)
- Text: `text-white`, muted `text-[#a1a1a1]`
- Accent: NONE in chrome — buttons are black/white. Gradients only in hero art.
- Font: Geist Sans / Geist Mono (or Inter as fallback)

## Patterns

- CTA: `bg-white text-black` (dark mode) — high contrast, no color
- Card: `bg-[#0a0a0a] border border-[#1f1f1f] rounded-lg p-6`
- Hero gradient (single use):
  ```
  bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500
  ```

## Don'ts

- No `indigo-600` buttons here — replace with `bg-white text-black` / `bg-black text-white`
- No `ring-1` on cards — use plain 1px borders
- Spacing is *bigger* than Linear: `py-24` for sections
