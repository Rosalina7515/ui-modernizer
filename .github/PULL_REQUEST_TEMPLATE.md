<!--
Thanks for the PR! A quick checklist below — most apply to most PRs.
You don't need to fill in every section; delete the ones that don't apply.
-->

## What this PR does

<!-- One or two sentences. -->

## Related issue / discussion

<!-- Closes #123 -->

## Type

- [ ] 🎨 New style profile
- [ ] ✨ New feature
- [ ] 🐛 Bug fix
- [ ] 📚 Docs
- [ ] 🧪 Tests
- [ ] 🧹 Chore / refactor

## Checklist

- [ ] `npm test` passes locally
- [ ] If I added a new script, it uses `_response.mjs` (success/failure builders) and `_errors.mjs` (UMD-NNN codes)
- [ ] If I added a new error path, I added a `UMD-NNN` code to `_errors.mjs` and documented it in `references/error-codes.md`
- [ ] If I touched a style profile, I ran `node scripts/validate-profile.mjs <path>` and it passed
- [ ] I added an entry to `CHANGELOG.md` under `## [Unreleased]`
- [ ] My commits follow the [Conventional Commits](https://www.conventionalcommits.org/) format

## Screenshots / output (optional)

<!-- For UI / report.md / CLI output changes, paste before & after. -->

## Notes for reviewers

<!-- Anything non-obvious. -->
