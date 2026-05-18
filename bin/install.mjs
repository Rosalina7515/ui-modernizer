#!/usr/bin/env node
/**
 * `npx ui-modernizer` entry point (v1.0+).
 *
 * Default action: install the Skill into the user's Claude Code skills directory.
 *   - Global:  ~/.claude/skills/ui-modernizer        (no flag)
 *   - Project: ./.claude/skills/ui-modernizer        (with --project)
 *
 * Subcommands:
 *   <none>                Install the skill (default)
 *   rollback              Restore the latest backup in the current project
 *   uninstall             Remove the installed skill
 *   health                Run self-check
 *
 * Flags:
 *   --project             Install into ./.claude/skills/ instead of ~/.claude/skills/
 *   --version, -v         Print version
 *   --help, -h            Show this message
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
const sub = args.find((a) => !a.startsWith('-')); // first non-flag arg

function printHelp() {
  console.log(`ui-modernizer v${pkg.version}

USAGE
  npx ui-modernizer [subcommand] [--project] [--version] [--help]

SUBCOMMANDS
  (default)         Install the skill into ~/.claude/skills/ui-modernizer
  rollback          Restore the latest backup in the current project
  uninstall         Remove the installed skill
  health            Run a quick self-check of the installed skill

FLAGS
  --project         Install into ./.claude/skills/ instead of ~/.claude/skills/
  --version, -v     Print version and exit
  --help, -h        Show this message

EXAMPLES
  npx ui-modernizer                       # install globally
  npx ui-modernizer --project             # install into current repo only
  npx ui-modernizer rollback              # undo the latest modernization
  npx ui-modernizer uninstall             # remove the global install
  npx ui-modernizer health --pretty       # check the install is healthy

LEARN MORE
  README:           https://github.com/Rosalina7515/ui-modernizer
  Error codes:      references/error-codes.md (in the skill folder)
  API stability:    references/api-stability.md
`);
}

if (flag('--help') || flag('-h')) { printHelp(); process.exit(0); }
if (flag('--version') || flag('-v')) { console.log(pkg.version); process.exit(0); }

if (sub === 'rollback') {
  const script = path.join(pkgRoot, 'scripts', 'backup.mjs');
  const res = spawnSync('node', [script, '--restore-latest'], { stdio: 'inherit', cwd: process.cwd() });
  process.exit(res.status ?? 1);
}

if (sub === 'health') {
  const script = path.join(pkgRoot, 'scripts', 'health.mjs');
  const passthroughArgs = args.filter((a) => a !== 'health');
  const res = spawnSync('node', [script, ...passthroughArgs], { stdio: 'inherit', cwd: process.cwd() });
  process.exit(res.status ?? 1);
}

if (sub === 'uninstall') {
  const target = flag('--project')
    ? path.join(process.cwd(), '.claude', 'skills', 'ui-modernizer')
    : path.join(homedir(), '.claude', 'skills', 'ui-modernizer');
  if (existsSync(target)) {
    rmSync(target, { recursive: true, force: true });
    console.log(`✓ Removed ${target}`);
  } else {
    console.log('Nothing to uninstall — skill not found at:');
    console.log(`  ${target}`);
  }
  process.exit(0);
}

if (sub && sub !== 'install') {
  console.error(`Unknown subcommand: "${sub}"`);
  console.error('Run `npx ui-modernizer --help` for usage.');
  process.exit(2);
}

// Default: install
const target = flag('--project')
  ? path.join(process.cwd(), '.claude', 'skills', 'ui-modernizer')
  : path.join(homedir(), '.claude', 'skills', 'ui-modernizer');

const isUpgrade = existsSync(target);
mkdirSync(target, { recursive: true });

const itemsToCopy = ['SKILL.md', 'references', 'scripts', 'templates', 'package.json'];
let copied = 0;
for (const item of itemsToCopy) {
  const src = path.join(pkgRoot, item);
  if (!existsSync(src)) continue;
  const dest = path.join(target, item);
  cpSync(src, dest, { recursive: true });
  copied++;
}

const action = isUpgrade ? 'upgraded' : 'installed';
console.log(`
✨ ui-modernizer v${pkg.version} ${action}.

   Skill location: ${target}
   Files copied:   ${copied}

   Next steps:
   1. Open Claude Code in any React/Vue/Svelte + Tailwind project.
   2. Type:  "modernize this UI"
   3. Watch it work.

   Check the install:   npx ui-modernizer health --pretty
   Rollback (in proj):  npx ui-modernizer rollback
   Uninstall:           npx ui-modernizer uninstall${flag('--project') ? ' --project' : ''}
`);
