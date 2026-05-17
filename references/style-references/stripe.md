---
name: stripe
displayName: Stripe
version: 1.0
vibe: trust and precision, soft purple, layered gradients, premium typography
darkFirst: false
recommendedFonts:
  - "Sohne"
  - "Inter"
  - "system-ui"
authors:
  - ui-modernizer
references:
  - https://stripe.com
tags:
  - premium
  - fintech
  - marketing
---

# Stripe style

**Signature:** trust + precision. Soft purple/indigo, layered gradients, premium typography, lots of breathing room.

## Tokens

- Background: `bg-white` light, `bg-[#0a2540]` deep blue surface for hero
- Surface: `bg-white shadow-xl ring-1 ring-zinc-900/5`
- Border: `border-zinc-200` (used sparingly — prefer rings + shadows)
- Text: `text-[#0a2540]` (Stripe navy), muted `text-zinc-600`
- Accent: `bg-[#635bff]` (Stripe brand purple), hover `bg-[#5a52e8]`
- Font: "Sohne" / Inter

## Patterns

- Floating cards over gradient backgrounds: `shadow-2xl ring-1 ring-zinc-900/10`
- Multi-color hero gradient:
  ```
  bg-[conic-gradient(at_top_left,_#7a73ff,_#0a2540,_#00d4ff,_#7a73ff)]
  ```
- Generous heading: `text-5xl md:text-6xl font-semibold tracking-tight`
- Rounded: `rounded-2xl` on hero cards, `rounded-lg` on CTAs

## Don'ts

- Don't use harsh shadows — Stripe shadows are soft and layered
- Don't crowd content — `py-32` for hero sections
