# Linear style

**Signature:** ultra-tight density, mono-ish accents, soft purples, sharp typography.

## Tokens

- Background: `bg-[#0a0a0c] dark:bg-[#0a0a0c]` (Linear runs dark-first)
- Surface: `bg-[#141416]`
- Border: `border-white/[0.08]`
- Text: `text-[#fafafa]` body, `text-[#a1a1aa]` muted
- Accent: `bg-[#5e6ad2]` (Linear purple), hover `bg-[#5666c4]`
- Font: Inter, **letter-spacing -0.02em** on headings

## Patterns

- Page padding: tight, `p-4` not `p-8`
- Row height: `h-8` for list items
- Use 1px borders everywhere; soft shadows almost never
- Kbd hints: `text-[10px] uppercase tracking-wider text-zinc-500` with `kbd` styling
- Heading scale: `text-[28px] font-semibold tracking-[-0.02em]`

## Don'ts

- No big rounded corners (`rounded-xl` max, prefer `rounded-md`)
- No heavy shadows
- No gradients in chrome — only in product art / illustrations
