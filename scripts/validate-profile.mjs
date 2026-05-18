#!/usr/bin/env node
/**
 * Validate a style profile against the v1.0 spec
 * (see references/style-references/_PROFILE_FORMAT.md).
 *
 * Usage:
 *   node scripts/validate-profile.mjs <path/to/profile.md>
 *   node scripts/validate-profile.mjs --all               # validate every built-in profile
 *
 * Exit codes:
 *   0  all validated profiles passed
 *   1  one or more profiles failed
 *   2  bad usage
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeError } from './_errors.mjs';
import { success, failure } from './_response.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SKILL_ROOT = path.resolve(__dirname, '..');
const BUILTIN_DIR = path.join(SKILL_ROOT, 'references', 'style-references');

const REQUIRED_FRONTMATTER = ['name', 'displayName', 'version', 'vibe', 'darkFirst', 'recommendedFonts', 'authors'];
const REQUIRED_SECTIONS = ['## Tokens', '## Patterns', "## Don'ts"];

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return { fm: null, body: text };
  const yaml = m[1];
  const fm = {};
  let currentKey = null;
  for (const line of yaml.split('\n')) {
    if (!line.trim()) continue;
    if (/^\s+-\s+/.test(line) && currentKey) {
      if (!Array.isArray(fm[currentKey])) fm[currentKey] = [];
      fm[currentKey].push(line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    const kv = line.match(/^([a-zA-Z]\w*)\s*:\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const raw = kv[2].trim();
      if (raw === '') { fm[currentKey] = []; continue; }
      if (raw === 'true' || raw === 'false') { fm[currentKey] = raw === 'true'; continue; }
      if (/^\d+(\.\d+)?$/.test(raw)) { fm[currentKey] = Number(raw); continue; }
      fm[currentKey] = raw.replace(/^["']|["']$/g, '');
    }
  }
  const body = text.slice(m[0].length);
  return { fm, body };
}

function validateFile(file) {
  const errors = [];
  const warnings = [];
  if (!existsSync(file)) return { file, ok: false, errors: ['file not found'], warnings };
  const text = readFileSync(file, 'utf8');
  const { fm, body } = parseFrontmatter(text);

  if (!fm) {
    errors.push(makeError('UMD-050', { file, reason: 'missing YAML frontmatter (file must start with ---)' }));
    return { file, ok: false, errors, warnings };
  }

  const missing = REQUIRED_FRONTMATTER.filter((k) => !(k in fm));
  if (missing.length > 0) {
    errors.push(makeError('UMD-051', { file, missing }));
  }

  // name format
  if (fm.name && !/^[a-z0-9-]+$/.test(String(fm.name))) {
    errors.push(makeError('UMD-050', { file, reason: `name "${fm.name}" must be kebab-case ([a-z0-9-]+)` }));
  }

  // name matches filename (skip if name starts with _ for internal files)
  if (fm.name && !String(fm.name).startsWith('_')) {
    const expected = path.basename(file, '.md');
    if (fm.name !== expected) {
      errors.push(makeError('UMD-052', { file, providedName: fm.name, expectedName: expected }));
    }
  }

  // version
  if (fm.version && Number(fm.version) > 1.0) {
    warnings.push({ message: `profile version ${fm.version} is newer than spec v1.0 — modernizer may skip unknown fields` });
  }

  // vibe length
  if (fm.vibe && String(fm.vibe).length > 80) {
    warnings.push({ message: `vibe is ${String(fm.vibe).length} chars (recommended ≤ 80)` });
  }

  // sections
  const missingSections = [];
  for (const heading of REQUIRED_SECTIONS) {
    const re = new RegExp(`^${heading.replace("'", "['’]")}\\b`, 'm');
    if (!re.test(body)) missingSections.push(heading);
  }
  if (missingSections.length > 0) {
    errors.push(makeError('UMD-050', { file, missingSections }));
  }

  return { file, ok: errors.length === 0, errors, warnings, frontmatter: fm };
}

const args = process.argv.slice(2);
let targets = [];
if (args.includes('--all')) {
  for (const f of readdirSync(BUILTIN_DIR)) {
    if (f.endsWith('.md') && !f.startsWith('_')) targets.push(path.join(BUILTIN_DIR, f));
  }
} else {
  targets = args.filter((a) => !a.startsWith('--')).map((a) => path.resolve(a));
}

if (targets.length === 0) {
  console.error('Usage: validate-profile.mjs <file.md> [...]   OR   validate-profile.mjs --all');
  process.exit(2);
}

const results = targets.map(validateFile);
const anyFailed = results.some((r) => !r.ok);
// v1.0: wrap in unified envelope. Aggregate per-file errors at the top level.
const aggregatedErrors = [];
for (const r of results) {
  if (!r.ok) for (const e of r.errors) aggregatedErrors.push(e);
}
const aggregatedWarnings = [];
for (const r of results) {
  if (r.warnings) for (const w of r.warnings) aggregatedWarnings.push(w);
}
const payload = {
  totalChecked: results.length,
  failed: results.filter((r) => !r.ok).length,
  results: results.map((r) => ({
    file: path.relative(process.cwd(), r.file),
    ok: r.ok,
    errors: r.errors,
    warnings: r.warnings,
  })),
};
const envelope = anyFailed
  ? failure('validate-profile', aggregatedErrors, aggregatedWarnings)
  : success('validate-profile', payload, aggregatedWarnings);
if (anyFailed) envelope.payload = payload;
console.log(JSON.stringify(envelope, null, 2));

process.exit(anyFailed ? 1 : 0);
