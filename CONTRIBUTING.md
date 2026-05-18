# Contributing to ui-modernizer

Thanks for considering a contribution. ui-modernizer is **mostly Markdown rules + a handful of Node.js scripts** — there's no build step, no TypeScript, no framework. Most contributions can be done in 10 minutes.

## Fastest contribution: a new style profile

This is the most welcomed PR type.

1. Copy [`references/style-references/notion.md`](./references/style-references/notion.md) as a template.
2. Edit the YAML frontmatter (`name` must match your filename).
3. Fill in `## Tokens`, `## Patterns`, `## Don'ts`.
4. Validate locally:
   ```bash
   node scripts/validate-profile.mjs references/style-references/<your>.md
   ```
   Must exit `0`.
5. Run the test suite to make sure nothing else broke:
   ```bash
   npm install
   npm test
   ```
6. Open a PR.

CI will re-run validation on every push.

## Code contributions

### Setup

```bash
git clone https://github.com/Rosalina7515/ui-modernizer
cd ui-modernizer
npm install
npm test
```

Node 20+ is required (we test on 20 in CI).

### Project layout

| Path | Purpose |
|---|---|
| `SKILL.md` | The prompt Claude Code reads when invoked |
| `bin/` | `npx ui-modernizer` entry point |
| `scripts/` | Node.js scripts called by the Skill — detection, validation, dry-run, etc. |
| `references/` | Markdown knowledge base loaded on demand by Claude |
| `references/style-references/` | Style profiles (one .md per aesthetic) |
| `templates/` | File templates injected during modernization |
| `examples/` | Tiny Next.js demos (before / after) |
| `tests/` | Vitest tests |
| `ROADMAP.md` | Where the project is heading |
| `CHANGELOG.md` | Version history |

### Conventions

- **No business logic in scripts** unless absolutely necessary. Prefer adding rules to a `references/*.md` file that Claude reads — that's where knowledge belongs.
- **Scripts are read-only by default.** Anything that writes to the user's filesystem must back up first (use `scripts/backup.mjs`).
- **Every script error must use a `UMD-NNN` code.** Add new codes to `scripts/_errors.mjs` and document them in `references/error-codes.md`.
- **Every script output goes through `_response.mjs`** (`success()` / `failure()` builders) — same envelope shape everywhere.
- **CLI flags follow a convention**: `--pretty` for human-readable, `--json` for machines (default), `--version`, `--help`.
- **Two-space indent**, single quotes, semicolons. No need for Prettier — keep it simple.

### Tests

Add a test in `tests/` for any new public-facing behavior. We aim for **80%+ coverage on `scripts/`**. Tests use Vitest:

```bash
npm test            # one-shot
npm run test:watch  # watch mode
```

### Commit messages

Follow Conventional Commits:

```
feat(v0.X.0): short description
fix(<scope>): short description
docs(<scope>): short description
test(<scope>): short description
chore(<scope>): short description
```

For version-bump commits, include the version in the type scope as shown.

### Pull request checklist

Before opening a PR, verify:

- [ ] `npm test` passes locally
- [ ] `node scripts/validate-profile.mjs --all` passes (if you touched profiles)
- [ ] You added an entry to `CHANGELOG.md` under `## [Unreleased]`
- [ ] You added/updated relevant `references/*.md` if behavior changed
- [ ] If you added a new error path, you added a UMD-NNN code + docs entry

## What we won't merge

- **Breaking changes** without a clear path (post-1.0). See [`references/api-stability.md`](./references/api-stability.md) for the SemVer commitment.
- **Bundled formatters / linters / build steps.** ui-modernizer is intentionally toolchain-light.
- **Closed-source / paid features.** This project is MIT and stays that way. See ROADMAP "Explicit non-goals".
- **Profiles that don't pass validation.** Run `validate-profile.mjs` before opening the PR.

## Filing issues

- 🐛 **Bug** — use the `Bug report` template; include OS, Node version, and steps to reproduce.
- ✨ **Feature** — use the `Feature request` template; explain the use case before the proposal.
- 🎨 **New profile** — open a `Profile contribution` issue first to discuss, *or* just submit the PR directly (we prefer PRs for profiles).

## Code of Conduct

By participating, you agree to abide by the [Contributor Covenant](./CODE_OF_CONDUCT.md).

## Security

Found a security issue? Don't open a public issue. See [SECURITY.md](./SECURITY.md).

---

Thanks for helping make modernizing UIs less tedious for everyone.
