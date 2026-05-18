/**
 * Shared CLI helper (v1.0+).
 *
 * Standardizes how every script handles common flags:
 *   --version, -v   → print version, exit 0
 *   --help, -h      → print usage, exit 0
 *   --json          → JSON output (default)
 *   --pretty        → human-readable output
 *
 * Usage in a script:
 *
 *   import { parseArgs, isMainScript } from './_cli.mjs';
 *
 *   if (isMainScript(import.meta.url)) {
 *     const { flags, positional, exit } = parseArgs(process.argv.slice(2), {
 *       command: 'my-script',
 *       usage: 'Usage: my-script [options] <files...>',
 *       options: [
 *         ['--routes <list>',  'comma-separated routes to scan'],
 *         ['--strict',         'fail on any candidate'],
 *       ],
 *     });
 *     if (exit) return;
 *     // ... rest of CLI logic ...
 *   }
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ──────────────────────────────────────────────────────────────────────────────
// isMainScript: replacement for the manual `process.argv[1] === __filename` check.
// Returns true when the given import.meta.url corresponds to the script being run.

export function isMainScript(importMetaUrl) {
  const here = fileURLToPath(importMetaUrl);
  return process.argv[1] === here
      || (process.argv[1] && path.basename(process.argv[1]) === path.basename(here));
}

// ──────────────────────────────────────────────────────────────────────────────
// readPackageVersion: walk up from this file to find package.json, return its version.

let _cachedVersion = null;
export function readPackageVersion() {
  if (_cachedVersion) return _cachedVersion;
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    const p = path.join(dir, 'package.json');
    if (existsSync(p)) {
      try {
        _cachedVersion = JSON.parse(readFileSync(p, 'utf8')).version ?? 'unknown';
        return _cachedVersion;
      } catch { /* keep walking */ }
    }
    dir = path.dirname(dir);
  }
  _cachedVersion = 'unknown';
  return _cachedVersion;
}

// ──────────────────────────────────────────────────────────────────────────────
// parseArgs: returns { flags, positional, exit }.
//
// flags    — { foo: true, routes: '/x,/y' }  bools or values for known options
// positional — non-flag arguments (file paths etc.)
// exit     — true if --version/--help was handled (caller should return immediately)

export function parseArgs(argv, { command, usage, options = [] } = {}) {
  const flags = {};
  const positional = [];
  const known = new Map(); // long → expects-value
  for (const [decl] of options) {
    const tokens = decl.split(/\s+/);
    const long = tokens[0];
    const expectsValue = tokens.length > 1; // any "<...>" placeholder after name
    known.set(long, expectsValue);
  }

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];

    // --version / -v
    if (a === '--version' || a === '-v') {
      console.log(readPackageVersion());
      return { flags, positional, exit: true };
    }
    // --help / -h
    if (a === '--help' || a === '-h') {
      printUsage({ command, usage, options });
      return { flags, positional, exit: true };
    }

    if (a.startsWith('--')) {
      const eqIdx = a.indexOf('=');
      let name, value;
      if (eqIdx >= 0) {
        name = a.slice(0, eqIdx);
        value = a.slice(eqIdx + 1);
      } else {
        name = a;
        const expectsValue = known.get(name);
        if (expectsValue) {
          value = argv[++i];
        } else {
          value = true;
        }
      }
      const key = name.slice(2); // drop leading --
      flags[key] = value;
      continue;
    }

    positional.push(a);
  }
  return { flags, positional, exit: false };
}

function printUsage({ command, usage, options }) {
  if (command) console.log(`${command}  ·  ui-modernizer ${readPackageVersion()}`);
  if (usage) console.log(usage);
  console.log('');
  console.log('Options:');
  const allOptions = [
    ['--version, -v', 'Print version and exit'],
    ['--help, -h',    'Show this message'],
    ['--json',        'JSON output (default)'],
    ['--pretty',      'Human-readable output'],
    ...options,
  ];
  const padLen = Math.max(...allOptions.map(([k]) => k.length)) + 2;
  for (const [k, desc] of allOptions) console.log(`  ${k.padEnd(padLen)}  ${desc}`);
}
