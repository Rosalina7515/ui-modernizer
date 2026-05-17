#!/usr/bin/env node
/**
 * List all style profiles available to ui-modernizer.
 *
 * Scans `references/style-references/*.md` (relative to the skill's root) and
 * reads each profile's frontmatter. Outputs a JSON array suitable for the
 * Skill to show the user.
 *
 * Usage:
 *   node scripts/list-profiles.mjs
 *   node scripts/list-profiles.mjs --pretty       # human-readable table
 *   node scripts/list-profiles.mjs --skill-root /path/to/skill   # if not auto-detectable
 */

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const pretty = args.includes('--pretty');

// Allow override for skill root; otherwise infer from script location.
let skillRoot = path.resolve(__dirname, '..');
const rootIdx = args.indexOf('--skill-root');
if (rootIdx >= 0 && args[rootIdx + 1]) skillRoot = path.resolve(args[rootIdx + 1]);

const dir = path.join(skillRoot, 'references', 'style-references');
if (!existsSync(dir)) {
  console.error('No style-references directory at', dir);
  process.exit(2);
}

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const yaml = m[1];
  const out = {};
  let currentKey = null;
  for (const line of yaml.split('\n')) {
    if (!line.trim()) continue;
    // Sub-list item (starts with `  -`)
    if (/^\s+-\s+/.test(line) && currentKey) {
      const val = line.replace(/^\s+-\s+/, '').trim().replace(/^["']|["']$/g, '');
      if (!Array.isArray(out[currentKey])) out[currentKey] = [];
      out[currentKey].push(val);
      continue;
    }
    const kv = line.match(/^([a-zA-Z]\w*)\s*:\s*(.*)$/);
    if (kv) {
      currentKey = kv[1];
      const raw = kv[2].trim();
      if (raw === '') { out[currentKey] = []; continue; }
      if (raw === 'true' || raw === 'false') { out[currentKey] = raw === 'true'; continue; }
      if (/^\d+(\.\d+)?$/.test(raw)) { out[currentKey] = Number(raw); continue; }
      out[currentKey] = raw.replace(/^["']|["']$/g, '');
    }
  }
  return out;
}

const profiles = [];
for (const file of readdirSync(dir)) {
  if (!file.endsWith('.md')) continue;
  if (file.startsWith('_')) continue; // internal (spec, etc.)
  const full = path.join(dir, file);
  const text = readFileSync(full, 'utf8');
  const fm = parseFrontmatter(text);
  if (!fm) continue;
  profiles.push({
    slug: fm.name ?? file.replace(/\.md$/, ''),
    displayName: fm.displayName ?? fm.name,
    vibe: fm.vibe ?? '',
    darkFirst: fm.darkFirst ?? false,
    tags: fm.tags ?? [],
    version: fm.version ?? '1.0',
    authors: fm.authors ?? [],
    path: path.relative(skillRoot, full),
  });
}

profiles.sort((a, b) => a.slug.localeCompare(b.slug));

if (pretty) {
  const pad = (s, n) => String(s).padEnd(n);
  console.log(`${pad('slug', 16)} ${pad('display', 20)} ${pad('dark', 6)} vibe`);
  console.log('-'.repeat(80));
  for (const p of profiles) {
    console.log(`${pad(p.slug, 16)} ${pad(p.displayName, 20)} ${pad(p.darkFirst ? 'yes' : '', 6)} ${p.vibe}`);
  }
  console.log(`\n${profiles.length} profile(s) at ${path.relative(process.cwd(), dir)}`);
} else {
  console.log(JSON.stringify({ skillRoot, count: profiles.length, profiles }, null, 2));
}
