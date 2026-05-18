# Migration guide

How to upgrade between ui-modernizer versions.

## From 0.9 → 1.0

**Good news: this is a non-breaking upgrade.** Everything that worked in 0.9 continues to work in 1.0. The 1.0 release is the *stability commitment*, not a redesign.

### What changed

| Area | Change | You need to do |
|---|---|---|
| Public API | All script CLI flags + JSON output shapes now frozen until 2.0 | Nothing |
| Error codes | All scripts now emit `UMD-NNN` codes (0.9 only did this in `load-config.mjs`) | Nothing required; if you parse error output programmatically, you can now rely on `errors[].code` everywhere |
| Output envelope | Every script now wraps output in `{ ok, command, version, timestamp, payload | errors, warnings }` | If your scripts parsed the raw output, switch to reading `.payload` |
| `--version` / `--help` | All public scripts support these | Nothing |
| `health.mjs` | New self-check script | Optional: run `node scripts/health.mjs` after install to verify your environment |
| Docs structure | New: `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`, `MIGRATION.md`, `references/api-stability.md` | Nothing |

### If you parse script JSON output

The unified envelope means your code should look at `.payload` (or `.errors`) rather than the script's top-level fields. Before:

```js
const r = JSON.parse(output);
if (r.supported) { /* ... */ }     // before — detect-stack.mjs raw output
```

After:

```js
const r = JSON.parse(output);
if (r.ok && r.payload.supported) { /* ... */ }
```

The script's *intent* is unchanged; just one level of nesting was added for consistency. The 0.9 → 1.0 upgrade is the moment to standardize on this shape because all future scripts will use it.

### If you use `npx ui-modernizer`

No change. `npx ui-modernizer` continues to install the Skill into `~/.claude/skills/ui-modernizer`. The bundled scripts are upgraded in place.

### If you use `.ui-modernizer.json`

No schema change. Your existing config works as-is. New optional fields documented in [`references/config-file.md`](./references/config-file.md) are additive.

---

## From 0.1 - 0.8 → 1.0

Same answer: non-breaking. The full path is `0.1 → 0.2 → ... → 0.9 → 1.0`. Each minor was additive. If you skip from 0.5 straight to 1.0:

- All your old runs and backups remain rollable via `npx ui-modernizer rollback`.
- The Skill prompt has more steps now, but the trigger phrase `"modernize this UI"` is unchanged.
- Style profile names you used (linear / vercel / stripe / shadcn) continue to work; 3 new ones (notion / raycast / apple) were added in 0.4.

### Things to do after upgrading

1. (Optional) Run `node scripts/health.mjs --pretty` to see what optional deps are missing.
2. (Optional) Add a `.ui-modernizer.json` to your project root if you want team-level defaults (introduced in 0.8).
3. (Optional) Wire `node scripts/dry-run.mjs --ci` into your CI for pre-merge checks (introduced in 0.8).

---

## After 1.0

From 1.0 forward, follow [SemVer](./references/api-stability.md):

- **patch** (`1.0.1`, `1.0.2`, ...) — bug fixes, no behavior change
- **minor** (`1.1.0`, `1.2.0`, ...) — new features, fully backward-compatible
- **major** (`2.0.0`) — may break the contract; will ship its own migration guide

You can upgrade `1.x.y` → `1.x'.y'` (any later 1.x) without expecting breakage.
