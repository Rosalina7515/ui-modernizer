#!/usr/bin/env node
/**
 * `npx ui-modernizer` entry point.
 *
 * Default action: install this Skill into the user's Claude Code skills directory.
 *   - Global: ~/.claude/skills/ui-modernizer
 *   - Project: ./.claude/skills/ui-modernizer  (when run with --project)
 *
 * Subcommands:
 *   rollback              Restore latest backup in the current project.
 *   uninstall             Remove the skill from ~/.claude/skills/.
 *   --project             Install into ./.claude/skills/ instead of ~/.claude/skills/.
 *   --version, -v         Print version.
 */

import { existsSync, mkdirSync, cpSync, rmSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, '..');
const pkg = JSON.parse(readFileSync(path.join(pkgRoot, 'package.json'), 'utf8'));

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);

if (flag('--version') || flag('-v')) {
  console.log(pkg.version);
  process.exit(0);
}

if (args[0] === 'rollback') {
  const script = path.join(pkgRoot, 'scripts', 'backup.mjs');
  const res = spawnSync('node', [script, '--restore-latest'], { stdio: 'inherit', cwd: process.cwd() });
  process.exit(res.status ?? 1);
}

if (args[0] === 'uninstall') {
  const target = flag('--project')
    ? path.join(process.cwd(), '.claude', 'skills', 'ui-modernizer')
    : path.join(homedir(), '.claude', 'skills', 'ui-modernizer');
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`✓ Removed ${target}`);
  } else {
    console.log('Nothing to uninstall — skill not found.');
  }
  process.exit(0);
}

// Default: install
const target = flag('--project')
  ? path.join(process.cwd(), '.claude', 'skills', 'ui-modernizer')
  : path.join(homedir(), '.claude', 'skills', 'ui-modernizer');

mkdirSync(target, { recursive: true });

const itemsToCopy = ['SKILL.md', 'references', 'scripts', 'templates', 'package.json'];
for (const item of itemsToCopy) {
  const src = path.join(pkgRoot, item);
  if (!existsSync(src)) continue;
  const dest = path.join(target, item);
  cpSync(src, dest, { recursive: true });
}

console.log(`
✨ ui-modernizer v${pkg.version} installed.

   Skill location: ${target}

   Next steps:
   1. Open Claude Code in any React + Next.js + Tailwind project.
   2. Type:  "modernize this UI"
   3. Watch it work.

   Rollback (in your project):  npx ui-modernizer rollback
   Uninstall:                   npx ui-modernizer uninstall${flag('--project') ? ' --project' : ''}
`);
