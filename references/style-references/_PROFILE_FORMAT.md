---
name: _profile-format
description: Specification for ui-modernizer style profile files
version: 1.0
internal: true
---

# Style Profile Format (v1.0)

A **style profile** is a single Markdown file that tells `ui-modernizer` how to give a project a specific aesthetic (Linear / Vercel / Notion / your-brand-name / …).

This document is the spec. Both the **built-in profiles** under `references/style-references/` and **user-contributed profiles** (local paths the user points at) must conform.

A profile is validated by `scripts/validate-profile.mjs`. CI runs the validator on every PR — profiles that fail are rejected.

---

## 1 · File location

| Type | Location |
|---|---|
| Built-in | `references/style-references/<slug>.md` |
| User-local | Any path on the user's filesystem (passed by the user) |

`<slug>` must be `[a-z0-9-]+` and unique. Reserved slugs starting with `_` are internal (this spec file is `_PROFILE_FORMAT.md`).

---

## 2 · Frontmatter (YAML)

Every profile **must** start with a YAML frontmatter block. Required keys:

```yaml
---
name: <slug>                       # required, kebab-case, matches filename
displayName: <Human Name>          # required, shown in lists
version: 1.0                       # required, profile schema version
vibe: <one-line description>       # required, ≤ 80 chars, what feeling it conveys
darkFirst: true | false            # required, is the canonical aesthetic dark or light?
recommendedFonts:                  # required, list of font fallbacks
  - <font name>
  - <font name>
authors:                           # required, who curated this profile
  - <github-handle or name>
references:                        # optional, links to inspiration sources
  - <url>
---
```

Optional keys:
- `tags: [...]` — searchable tags (e.g. `["dense", "developer-tools"]`)
- `tailwindAddons: [...]` — Tailwind plugins this profile recommends (`["tailwindcss-animate"]`)

---

## 3 · Required sections

Every profile body **must** contain these `##` headings, in this order:

1. `## Tokens` — colors, backgrounds, borders, text, accent. Concrete Tailwind class names or hex/oklch values.
2. `## Patterns` — at minimum, target Tailwind class strings for **button**, **card**, **input**. Bullet points or short code blocks.
3. `## Don'ts` — things the modernizer must NOT do when using this profile (e.g. "no gradients in chrome", "no large radii").

---

## 4 · Optional sections

- `## When to use` — a short paragraph helping pick this profile over others.
- `## Sample composition` — a longer code snippet showing a hero / dashboard panel in this style.
- `## Brand-color override` — if the profile has a signature accent, where to inject it for `--color-<name>-*` tokens.

---

## 5 · Example (minimal)

```markdown
---
name: my-brand
displayName: My Brand
version: 1.0
vibe: confident, modern, slightly warm
darkFirst: false
recommendedFonts:
  - Inter
  - system-ui
authors:
  - your-handle
---

## Tokens

- Background: `bg-white dark:bg-stone-950`
- Accent: `bg-orange-600 hover:bg-orange-500`
- Border: `border-stone-200 dark:border-stone-800`

## Patterns

- **Button:** `inline-flex items-center justify-center rounded-md bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-500`
- **Card:** `rounded-xl bg-white dark:bg-stone-950 p-6 ring-1 ring-stone-200 dark:ring-stone-800 shadow-sm`
- **Input:** `block w-full rounded-md ring-1 ring-inset ring-stone-200 dark:ring-stone-800 bg-white dark:bg-stone-950 px-3 py-2 text-sm`

## Don'ts

- No indigo or violet — orange is the only accent.
- No glassmorphism — keep surfaces opaque.
```

---

## 6 · How users invoke a profile

| What the user says | What ui-modernizer does |
|---|---|
| `modernize this UI` | Default blend (no specific profile) |
| `modernize this UI like Linear` | Loads `references/style-references/linear.md` |
| `modernize this UI like notion` | Loads `references/style-references/notion.md` |
| `modernize this UI using ./our-brand.md` | Loads the user's local file (after validating it) |
| `list available style profiles` | Runs `scripts/list-profiles.mjs` and shows the table |
