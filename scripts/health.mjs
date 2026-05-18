#!/usr/bin/env node
/**
 * Self-check for ui-modernizer (v1.0+).
 *
 * Runs all the read-only detectors + verifies optional deps + validates all
 * built-in profiles. Output is a single health report:
 *
 *   {
 *     ok: bool,
 *     command: 'health',
 *     version: '...',
 *     timestamp: '...',
 *     payload: {
 *       checks: [
 *         { name, ok, detail }, ...
 *       ],
 *       summary: { total, passed, warned, failed }
 *     },
 *     warnings: [...]
 *   }
 *
 * Intended for:
 *   - First-run "did the install work?" sanity (npx ui-modernizer health)
 *   - CI smoke tests
 *   - Quick diagnostic when something's not behaving
 *
 * Usage:
 *   node scripts/health.mjs            # JSON
 *   node scripts/health.mjs --pretty   # human-readable
 *   node scripts/health.mjs --version
 *   node scripts/health.mjs --help
 */

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { success, failure } from './_response.mjs';
import { makeError } from './_errors.mjs';
import { parseArgs, isMainScript, readPackageVersion } from './_cli.mjs';

const __filename = fileURLToPath(import.meta.url);
const SKILL_ROOT = path.resolve(path.dirname(__filename), '..');

async function checkOptionalDep(modulePath, friendly) {
  try {
    await import(modulePath);
    return { name: friendly, ok: true, detail: 'installed' };
  } catch {
    return { name: friendly, ok: 'warn', detail: 'not installed (optional)' };
  }
}

function checkFileExists(rel, friendly) {
  const ok = existsSync(path.join(SKILL_ROOT, rel));
  return { name: friendly, ok, detail: ok ? `found at ${rel}` : `missing: ${rel}` };
}

function checkProfileCount() {
  const dir = path.join(SKILL_ROOT, 'references', 'style-references');
  if (!existsSync(dir)) return { name: 'style profiles', ok: false, detail: 'references/style-references/ missing' };
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  return { name: 'style profiles', ok: files.length >= 7, detail: `${files.length} profiles loaded` };
}

function checkPackageJsonVersion() {
  const v = readPackageVersion();
  return { name: 'package.json version', ok: v !== 'unknown', detail: v };
}

function checkSkillStructure() {
  const required = ['SKILL.md', 'bin/install.mjs', 'scripts/_errors.mjs', 'scripts/_response.mjs'];
  const missing = required.filter((rel) => !existsSync(path.join(SKILL_ROOT, rel)));
  return {
    name: 'skill structure',
    ok: missing.length === 0,
    detail: missing.length === 0 ? `all ${required.length} core files present` : `missing: ${missing.join(', ')}`,
  };
}

async function runProfileValidation() {
  // Spawn validate-profile.mjs --all in-process by re-using its logic indirectly:
  // we just check that each profile parses and has the required headings.
  const dir = path.join(SKILL_ROOT, 'references', 'style-references');
  if (!existsSync(dir)) return { name: 'profile validation', ok: false, detail: 'no profiles to validate' };
  const files = readdirSync(dir).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
  const required = ['## Tokens', '## Patterns', "## Don'ts"];
  const bad = [];
  for (const f of files) {
    const text = readFileSync(path.join(dir, f), 'utf8');
    const fm = text.match(/^---\n[\s\S]*?\n---/);
    if (!fm) { bad.push(`${f} (no frontmatter)`); continue; }
    for (const h of required) {
      const re = new RegExp(`^${h.replace("'", "['’]")}\\b`, 'm');
      if (!re.test(text)) { bad.push(`${f} (missing "${h}")`); break; }
    }
  }
  return {
    name: 'profile validation',
    ok: bad.length === 0,
    detail: bad.length === 0 ? `${files.length} profiles valid` : `invalid: ${bad.join('; ')}`,
  };
}

async function runChecks() {
  return [
    checkPackageJsonVersion(),
    checkSkillStructure(),
    checkProfileCount(),
    await runProfileValidation(),
    checkFileExists('references/error-codes.md', 'error-codes.md'),
    checkFileExists('references/api-stability.md', 'api-stability.md'),
    checkFileExists('references/config-file.md', 'config-file.md'),
    await checkOptionalDep('@babel/parser', '@babel/parser (AST safety)'),
    await checkOptionalDep('@babel/traverse', '@babel/traverse (AST safety)'),
    await checkOptionalDep('playwright', 'playwright (visual regression / screenshots)'),
  ];
}

// CLI entry
if (isMainScript(import.meta.url)) {
  const { flags, exit } = parseArgs(process.argv.slice(2), {
    command: 'health',
    usage: 'Usage: health.mjs [--pretty]',
    options: [],
  });
  if (exit) process.exit(0);

  const checks = await runChecks();
  const summary = {
    total: checks.length,
    passed: checks.filter((c) => c.ok === true).length,
    warned: checks.filter((c) => c.ok === 'warn').length,
    failed: checks.filter((c) => c.ok === false).length,
  };
  const overallOk = summary.failed === 0;

  if (flags.pretty) {
    console.log(`ui-modernizer health  ·  v${readPackageVersion()}`);
    console.log('─'.repeat(70));
    for (const c of checks) {
      const mark = c.ok === true ? '✓' : c.ok === 'warn' ? '⚠' : '✗';
      console.log(`  ${mark}  ${c.name.padEnd(50)}  ${c.detail}`);
    }
    console.log('─'.repeat(70));
    console.log(`  ${summary.passed} passed · ${summary.warned} warned · ${summary.failed} failed`);
    if (!overallOk) console.log('\n  ✗ Health check FAILED — see above');
    else if (summary.warned > 0) console.log('\n  ⚠ Health OK — but some optional dependencies are missing');
    else console.log('\n  ✓ All checks passed');
  } else {
    const errors = checks.filter((c) => c.ok === false).map((c) => makeError('UMD-999', { check: c.name, detail: c.detail }));
    const warnings = checks.filter((c) => c.ok === 'warn').map((c) => ({ message: `${c.name}: ${c.detail}` }));
    const payload = { checks, summary };
    const env = overallOk
      ? success('health', payload, warnings)
      : failure('health', errors, warnings);
    if (!overallOk) env.payload = payload;
    console.log(JSON.stringify(env, null, 2));
  }

  process.exit(overallOk ? 0 : 1);
}

export { runChecks };
