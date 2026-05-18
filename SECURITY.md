# Security Policy

## Supported versions

| Version | Status |
|---|---|
| `1.x` | ✅ supported — patches for current minor |
| `0.9.x` | ✅ supported until 6 months after 1.0 release |
| `< 0.9` | ❌ unsupported |

## Reporting an issue

If you discover a problem that could affect users, please do **not** open a public issue.

Instead, contact the maintainer via:

- GitHub: open a private security advisory at
  `https://github.com/Rosalina7515/ui-modernizer/security/advisories/new`

Include:

- A short description of the issue
- Steps to reproduce
- The affected version (`package.json` `version` field)
- Your assessment of impact

We aim to respond within 5 business days and to publish a fix within 30 days of confirmation. Reporters who follow this process are credited in the release notes (with their consent).

## What is in scope

- `bin/install.mjs` and all `scripts/*.mjs` Node.js entry points
- The Skill prompt (`SKILL.md`) when interpreted by Claude Code
- Configuration parsing (`.ui-modernizer.json`)

## What is out of scope

- Third-party dependencies (report upstream)
- The user's own project code that ui-modernizer edits (we provide backup + report; the user is responsible for review)
- Documentation typos (open a regular PR)
